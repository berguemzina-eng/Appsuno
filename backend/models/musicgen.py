"""
musicgen.py - Wrapper sobre Meta MusicGen (Hugging Face Transformers)

Genera clips de música a partir de un prompt de texto. Pensado para
prompts en árabe/darija o inglés describiendo estilos marroquíes
(gnaoua, andalusí, chaabi, raï, etc). El modelo en sí no entiende
árabe de forma nativa con calidad óptima, así que este módulo
también permite pasar una traducción/paráfrasis en inglés generada
en el propio backend (ver utils.build_style_prompt).
"""

from __future__ import annotations

import logging
import os
import time
import uuid
from dataclasses import dataclass
from typing import Optional

import numpy as np
import torch

logger = logging.getLogger("musicgen")

# Modelos disponibles, de más rápido/liviano a más pesado/calidad
AVAILABLE_MODELS = {
    "small": "facebook/musicgen-small",   # ~3GB VRAM, rápido
    "medium": "facebook/musicgen-medium",  # ~6GB VRAM
    "large": "facebook/musicgen-large",   # ~13GB VRAM, mejor calidad
}

DEFAULT_MODEL_SIZE = os.getenv("MUSICGEN_MODEL", "small")
SAMPLE_RATE = 32000  # MusicGen genera audio a 32kHz


@dataclass
class GenerationResult:
    audio: np.ndarray          # array float32 mono/estéreo
    sample_rate: int
    duration_seconds: float
    generation_time_seconds: float
    model_name: str


class MusicGenerator:
    """
    Envuelve el modelo MusicGen de Meta para generación texto -> música.

    El modelo se carga de forma perezosa (lazy) la primera vez que se
    llama a `generate()`, para que el arranque del servidor sea rápido
    y no descargue ~GB de pesos si el endpoint nunca se usa.
    """

    def __init__(self, model_size: str = DEFAULT_MODEL_SIZE):
        if model_size not in AVAILABLE_MODELS:
            logger.warning(
                "Tamaño de modelo '%s' desconocido, usando 'small'", model_size
            )
            model_size = "small"

        self.model_size = model_size
        self.model_id = AVAILABLE_MODELS[model_size]
        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        self._model = None
        self._processor = None
        self._loaded = False

        logger.info(
            "MusicGenerator configurado: modelo=%s, dispositivo=%s",
            self.model_id,
            self.device,
        )

    def load(self) -> None:
        """Carga el modelo y processor en memoria (idempotente)."""
        if self._loaded:
            return

        from transformers import AutoProcessor, MusicgenForConditionalGeneration

        logger.info("Cargando modelo MusicGen '%s'...", self.model_id)
        t0 = time.time()

        self._processor = AutoProcessor.from_pretrained(self.model_id)
        self._model = MusicgenForConditionalGeneration.from_pretrained(
            self.model_id
        ).to(self.device)
        self._model.eval()

        self._loaded = True
        logger.info("Modelo cargado en %.1fs", time.time() - t0)

    def unload(self) -> None:
        """Libera el modelo de memoria (útil en entornos con poca RAM)."""
        self._model = None
        self._processor = None
        self._loaded = False
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def generate(
        self,
        prompt: str,
        duration: int = 15,
        temperature: float = 1.0,
        guidance_scale: float = 3.0,
        seed: Optional[int] = None,
    ) -> GenerationResult:
        """
        Genera un clip de música a partir de un prompt de texto.

        Args:
            prompt: descripción del estilo musical deseado (en inglés
                da mejores resultados con MusicGen).
            duration: duración objetivo en segundos (máx recomendado 60s
                en CPU, hasta 120s en GPU con buena VRAM).
            temperature: aleatoriedad del muestreo (0.1 - 1.5).
            guidance_scale: qué tanto sigue el modelo el prompt.
            seed: semilla para reproducibilidad (None = aleatorio).
        """
        self.load()

        if seed is not None:
            torch.manual_seed(seed)

        # MusicGen genera ~50 tokens por segundo de audio
        max_new_tokens = int(duration * 50)

        inputs = self._processor(
            text=[prompt],
            padding=True,
            return_tensors="pt",
        ).to(self.device)

        t0 = time.time()
        with torch.no_grad():
            audio_values = self._model.generate(
                **inputs,
                do_sample=True,
                guidance_scale=guidance_scale,
                temperature=temperature,
                max_new_tokens=max_new_tokens,
            )
        gen_time = time.time() - t0

        audio = audio_values[0, 0].cpu().numpy().astype(np.float32)
        actual_duration = len(audio) / SAMPLE_RATE

        logger.info(
            "Generación completada: %.1fs de audio en %.1fs (prompt='%s')",
            actual_duration,
            gen_time,
            prompt[:60],
        )

        return GenerationResult(
            audio=audio,
            sample_rate=SAMPLE_RATE,
            duration_seconds=actual_duration,
            generation_time_seconds=gen_time,
            model_name=self.model_id,
        )

    @staticmethod
    def new_generation_id() -> str:
        return uuid.uuid4().hex[:12]
