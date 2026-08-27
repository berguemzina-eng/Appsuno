"""
app.py - Moroccan AI Music Generator - Backend API (FastAPI)

Endpoints principales:
    GET  /                      -> info de la API
    GET  /health                -> estado del servidor y modelos
    GET  /styles                -> estilos musicales disponibles
    GET  /voices                -> voces TTS disponibles
    POST /api/generate          -> genera música (+ voz opcional) en background
    GET  /api/status/{id}       -> estado de una generación
    GET  /api/download/{id}     -> descarga el WAV generado
    POST /api/regenerate/{id}   -> vuelve a generar con el mismo prompt
    GET  /api/library           -> lista de generaciones anteriores

Ejecutar:
    python app.py
Sirve en http://localhost:7860 por defecto (compatible con Hugging Face Spaces).
"""

from __future__ import annotations

import logging
import os
import uuid
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from models import ArabicTTS, MusicGenerator, utils

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("app")

# ---------------------------------------------------------------------------
# Configuración
# ---------------------------------------------------------------------------

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "7860"))
OUTPUT_DIR = os.getenv("OUTPUT_DIR", "outputs")
MUSICGEN_MODEL = os.getenv("MUSICGEN_MODEL", "small")
MAX_DURATION = int(os.getenv("MAX_DURATION_SECONDS", "60"))
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")

Path(OUTPUT_DIR).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title="Moroccan AI Music Generator API",
    description="API gratuita y open source para generar música marroquí con IA",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instancias perezosas de los modelos (se cargan en el primer uso real)
music_generator = MusicGenerator(model_size=MUSICGEN_MODEL)
tts_engine = ArabicTTS()
cache = utils.GenerationCache(cache_dir=OUTPUT_DIR)


# ---------------------------------------------------------------------------
# Esquemas
# ---------------------------------------------------------------------------

class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=500, description="Prompt en árabe/darija o inglés")
    style: Optional[str] = Field(None, description="Estilo predefinido, ver /styles")
    duration: int = Field(30, ge=5, le=MAX_DURATION, description="Duración en segundos")
    include_voice: bool = Field(False, description="Si True, genera voz TTS y la mezcla")
    voice: Optional[str] = Field("female", description="'male' o 'female'")
    voice_text: Optional[str] = Field(None, description="Texto en árabe a sintetizar como voz")
    temperature: float = Field(1.0, ge=0.1, le=1.5)
    seed: Optional[int] = None


class GenerateResponse(BaseModel):
    id: str
    status: str
    message: str


class StatusResponse(BaseModel):
    id: str
    status: str
    prompt: Optional[str] = None
    style: Optional[str] = None
    duration: Optional[float] = None
    audio_url: Optional[str] = None
    error: Optional[str] = None
    created_at: Optional[float] = None


# ---------------------------------------------------------------------------
# Rutas básicas
# ---------------------------------------------------------------------------

@app.get("/")
def root():
    return {
        "name": "Moroccan AI Music Generator API",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "musicgen_loaded": music_generator.is_loaded,
        "musicgen_model": music_generator.model_id,
        "device": music_generator.device,
        "tts_loaded": tts_engine.is_loaded,
    }


@app.get("/styles")
def list_styles():
    return {"styles": list(utils.STYLE_PROMPTS.keys())}


@app.get("/voices")
def list_voices():
    from models.tts import VOICES

    return {"voices": list(VOICES.keys())}


# ---------------------------------------------------------------------------
# Generación
# ---------------------------------------------------------------------------

def _run_generation(
    generation_id: str,
    req: GenerateRequest,
) -> None:
    """Tarea en background: genera música (+voz) y guarda el resultado."""
    try:
        cache.update_status(generation_id, "processing")

        full_prompt = utils.build_style_prompt(req.prompt, req.style)

        result = music_generator.generate(
            prompt=full_prompt,
            duration=req.duration,
            temperature=req.temperature,
            seed=req.seed,
        )
        audio = utils.apply_fade(result.audio, result.sample_rate)

        if req.include_voice and req.voice_text:
            tts_result = tts_engine.synthesize(req.voice_text, voice=req.voice)
            audio, sr = utils.mix_tracks(
                music=audio,
                music_sr=result.sample_rate,
                voice=tts_result.audio,
                voice_sr=tts_result.sample_rate,
            )
        else:
            sr = result.sample_rate
            audio = utils.normalize_audio(audio)

        output_path = str(Path(OUTPUT_DIR) / f"{generation_id}.wav")
        utils.export_audio(audio, sr, output_path)

        cache.update_status(
            generation_id,
            "completed",
            duration=result.duration_seconds,
            audio_path=output_path,
        )
        logger.info("Generación %s completada", generation_id)

    except Exception as exc:  # noqa: BLE001
        logger.exception("Error generando %s", generation_id)
        cache.update_status(generation_id, "failed", error=str(exc))


@app.post("/api/generate", response_model=GenerateResponse)
def generate(req: GenerateRequest, background_tasks: BackgroundTasks):
    generation_id = uuid.uuid4().hex[:12]

    cache.add(
        generation_id,
        {
            "status": "queued",
            "prompt": req.prompt,
            "style": req.style,
            "requested_duration": req.duration,
        },
    )

    background_tasks.add_task(_run_generation, generation_id, req)

    return GenerateResponse(
        id=generation_id,
        status="queued",
        message="Generación en curso. Consulta /api/status/{id} para ver el progreso.",
    )


@app.get("/api/status/{generation_id}", response_model=StatusResponse)
def get_status(generation_id: str):
    meta = cache.get(generation_id)
    if meta is None:
        raise HTTPException(status_code=404, detail="Generación no encontrada")

    audio_url = None
    if meta.get("status") == "completed":
        audio_url = f"/api/download/{generation_id}"

    return StatusResponse(
        id=generation_id,
        status=meta.get("status", "unknown"),
        prompt=meta.get("prompt"),
        style=meta.get("style"),
        duration=meta.get("duration"),
        audio_url=audio_url,
        error=meta.get("error"),
        created_at=meta.get("created_at"),
    )


@app.get("/api/download/{generation_id}")
def download(generation_id: str):
    meta = cache.get(generation_id)
    if meta is None or meta.get("status") != "completed":
        raise HTTPException(status_code=404, detail="Audio no disponible")

    audio_path = meta.get("audio_path")
    if not audio_path or not os.path.exists(audio_path):
        raise HTTPException(status_code=404, detail="Archivo de audio no encontrado")

    return FileResponse(
        audio_path,
        media_type="audio/wav",
        filename=f"moroccan_music_{generation_id}.wav",
    )


@app.post("/api/regenerate/{generation_id}", response_model=GenerateResponse)
def regenerate(generation_id: str, background_tasks: BackgroundTasks):
    meta = cache.get(generation_id)
    if meta is None:
        raise HTTPException(status_code=404, detail="Generación original no encontrada")

    req = GenerateRequest(
        prompt=meta.get("prompt", ""),
        style=meta.get("style"),
        duration=meta.get("requested_duration", 30),
    )
    new_id = uuid.uuid4().hex[:12]

    cache.add(
        new_id,
        {
            "status": "queued",
            "prompt": req.prompt,
            "style": req.style,
            "requested_duration": req.duration,
            "regenerated_from": generation_id,
        },
    )
    background_tasks.add_task(_run_generation, new_id, req)

    return GenerateResponse(
        id=new_id,
        status="queued",
        message=f"Regenerando a partir de {generation_id}",
    )


@app.get("/api/library")
def library(limit: int = 50):
    return {"items": cache.list_all(limit=limit)}


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    logger.info("Iniciando servidor en %s:%s", HOST, PORT)
    uvicorn.run("app:app", host=HOST, port=PORT, reload=False)
