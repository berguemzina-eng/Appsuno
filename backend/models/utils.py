"""
utils.py - Utilidades de procesamiento de audio.

Incluye:
- Normalización de volumen
- Fade in / fade out
- Resampleo entre distintas sample rates
- Mezcla de pistas (música + voz)
- Exportación a WAV/MP3
- Construcción de prompts de estilo para MusicGen
- Cache simple de generaciones en disco
"""

from __future__ import annotations

import json
import logging
import os
import time
from pathlib import Path
from typing import Optional

import numpy as np
import soundfile as sf

logger = logging.getLogger("audio_utils")

# ---------------------------------------------------------------------------
# Normalización y fades
# ---------------------------------------------------------------------------

def normalize_audio(audio: np.ndarray, target_peak: float = 0.95) -> np.ndarray:
    """Normaliza el audio para que su pico máximo sea `target_peak`."""
    peak = np.max(np.abs(audio)) if audio.size else 0.0
    if peak == 0:
        return audio
    return (audio / peak) * target_peak


def apply_fade(
    audio: np.ndarray,
    sample_rate: int,
    fade_in_s: float = 0.5,
    fade_out_s: float = 1.0,
) -> np.ndarray:
    """Aplica fade-in y fade-out lineales a un clip de audio."""
    audio = audio.copy()
    n = len(audio)

    fade_in_samples = min(int(fade_in_s * sample_rate), n // 2)
    fade_out_samples = min(int(fade_out_s * sample_rate), n // 2)

    if fade_in_samples > 0:
        audio[:fade_in_samples] *= np.linspace(0.0, 1.0, fade_in_samples)
    if fade_out_samples > 0:
        audio[-fade_out_samples:] *= np.linspace(1.0, 0.0, fade_out_samples)

    return audio


# ---------------------------------------------------------------------------
# Resampleo
# ---------------------------------------------------------------------------

def resample_audio(audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    """Resamplea un array de audio de orig_sr a target_sr (sin dependencias
    pesadas: usa interpolación lineal, suficiente para voz/mezcla previa)."""
    if orig_sr == target_sr:
        return audio

    duration = len(audio) / orig_sr
    target_len = int(duration * target_sr)
    orig_idx = np.linspace(0, len(audio) - 1, num=len(audio))
    target_idx = np.linspace(0, len(audio) - 1, num=target_len)
    return np.interp(target_idx, orig_idx, audio).astype(np.float32)


# ---------------------------------------------------------------------------
# Mezcla
# ---------------------------------------------------------------------------

def mix_tracks(
    music: np.ndarray,
    music_sr: int,
    voice: Optional[np.ndarray] = None,
    voice_sr: Optional[int] = None,
    voice_gain: float = 0.9,
    music_gain_under_voice: float = 0.55,
) -> tuple[np.ndarray, int]:
    """
    Mezcla una pista de música con una pista de voz opcional.

    La música se atenúa (`music_gain_under_voice`) mientras hay voz
    sonando, de forma simple (no hay side-chaining dinámico, es un
    duck estático sobre el largo de la voz).
    """
    if voice is None:
        return normalize_audio(music), music_sr

    if voice_sr != music_sr:
        voice = resample_audio(voice, voice_sr, music_sr)

    # Igualar longitudes: si la voz es más corta, se centra sobre la música
    if len(voice) < len(music):
        pad_total = len(music) - len(voice)
        pad_left = pad_total // 2
        voice_padded = np.zeros_like(music)
        voice_padded[pad_left : pad_left + len(voice)] = voice
        duck_mask = np.zeros_like(music)
        duck_mask[pad_left : pad_left + len(voice)] = 1.0
        voice = voice_padded
    else:
        music = np.pad(music, (0, len(voice) - len(music)))
        duck_mask = np.ones_like(music)

    ducked_music = music * (1.0 - duck_mask * (1.0 - music_gain_under_voice))
    mixed = ducked_music + voice * voice_gain

    return normalize_audio(mixed), music_sr


# ---------------------------------------------------------------------------
# Exportación
# ---------------------------------------------------------------------------

def export_audio(
    audio: np.ndarray,
    sample_rate: int,
    output_path: str,
    fmt: str = "WAV",
) -> str:
    """Guarda el array de audio a disco. Devuelve la ruta final."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    sf.write(output_path, audio, sample_rate, format=fmt)
    logger.info("Audio exportado a %s (%s, %dHz)", output_path, fmt, sample_rate)
    return output_path


# ---------------------------------------------------------------------------
# Prompts de estilo
# ---------------------------------------------------------------------------

STYLE_PROMPTS = {
    "moroccan_trad": "traditional moroccan music with oud and darbuka percussion",
    "gnaoua": "gnaoua trance music with sintir bass lute and qraqeb metal castanets",
    "chaabi": "upbeat moroccan chaabi wedding music with violin and bendir drums",
    "andalusi": "andalusian moroccan classical music, orchestral oud and violin ensemble",
    "rai": "modern moroccan-algerian rai music with synths and darbuka",
    "ambient": "calm relaxing ambient moroccan style music with oud and light percussion",
}


def build_style_prompt(user_prompt: str, style: Optional[str] = None) -> str:
    """
    Combina el prompt libre del usuario con una plantilla de estilo
    predefinida para mejorar la calidad de generación de MusicGen
    (que responde mejor a descripciones en inglés).
    """
    base = STYLE_PROMPTS.get(style, "")
    if base and user_prompt:
        return f"{base}, {user_prompt}"
    return base or user_prompt


# ---------------------------------------------------------------------------
# Cache simple en disco (metadata de generaciones)
# ---------------------------------------------------------------------------

class GenerationCache:
    """Índice JSON simple de generaciones ya realizadas, para permitir
    listar 'biblioteca' y evitar recomputar en /status."""

    def __init__(self, cache_dir: str):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.index_path = self.cache_dir / "index.json"
        if not self.index_path.exists():
            self._write_index({})

    def _read_index(self) -> dict:
        try:
            return json.loads(self.index_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, FileNotFoundError):
            return {}

    def _write_index(self, data: dict) -> None:
        self.index_path.write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    def add(self, generation_id: str, metadata: dict) -> None:
        data = self._read_index()
        metadata["created_at"] = metadata.get("created_at", time.time())
        data[generation_id] = metadata
        self._write_index(data)

    def get(self, generation_id: str) -> Optional[dict]:
        return self._read_index().get(generation_id)

    def list_all(self, limit: int = 50) -> list[dict]:
        data = self._read_index()
        items = [{"id": k, **v} for k, v in data.items()]
        items.sort(key=lambda x: x.get("created_at", 0), reverse=True)
        return items[:limit]

    def update_status(self, generation_id: str, status: str, **extra) -> None:
        data = self._read_index()
        if generation_id in data:
            data[generation_id]["status"] = status
            data[generation_id].update(extra)
            self._write_index(data)
