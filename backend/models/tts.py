"""
tts.py - Síntesis de voz en árabe/darija usando Silero TTS.

Silero ofrece un modelo TTS multilingüe ligero, gratuito y que corre
bien en CPU. Se usa aquí para generar las voces/coros que luego se
mezclan con la música generada por MusicGen (ver utils.mix_tracks).
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Optional

import numpy as np
import torch

logger = logging.getLogger("tts")

SILERO_LANGUAGE = "ar"  # árabe (Silero también soporta 'ru', 'en', etc.)
SILERO_SAMPLE_RATE = 48000

VOICES = {
    "male": "ar_0",
    "female": "ar_1",
}


@dataclass
class TTSResult:
    audio: np.ndarray
    sample_rate: int
    voice: str


class ArabicTTS:
    """
    Wrapper perezoso sobre el modelo Silero TTS para árabe.

    Si el modelo Silero no soporta directamente darija/dialecto
    marroquí, se recomienda transliterar/normalizar el texto a árabe
    estándar (MSA) antes de sintetizar para mejores resultados.
    """

    def __init__(self, voice: str = "female"):
        self.voice_key = voice if voice in VOICES else "female"
        self._model = None
        self._loaded = False
        self.device = torch.device("cpu")  # Silero corre bien en CPU

    def load(self) -> None:
        if self._loaded:
            return

        logger.info("Cargando modelo Silero TTS (idioma=%s)...", SILERO_LANGUAGE)
        t0 = time.time()

        # torch.hub descarga y cachea el modelo de silero-models
        self._model, _ = torch.hub.load(
            repo_or_dir="snakers4/silero-models",
            model="silero_tts",
            language=SILERO_LANGUAGE,
            speaker="v3_ar",
        )
        self._model.to(self.device)

        self._loaded = True
        logger.info("Silero TTS cargado en %.1fs", time.time() - t0)

    def unload(self) -> None:
        self._model = None
        self._loaded = False

    @property
    def is_loaded(self) -> bool:
        return self._loaded

    def synthesize(
        self,
        text: str,
        voice: Optional[str] = None,
        sample_rate: int = SILERO_SAMPLE_RATE,
    ) -> TTSResult:
        """
        Convierte texto en árabe a audio.

        Args:
            text: texto a sintetizar (árabe estándar recomendado).
            voice: 'male' o 'female'. Si None, usa la voz por defecto
                de la instancia.
            sample_rate: 8000, 24000 o 48000 (según soporte de Silero).
        """
        self.load()

        voice_key = voice if voice in VOICES else self.voice_key
        speaker_id = VOICES[voice_key]

        audio_tensor = self._model.apply_tts(
            text=text,
            speaker=speaker_id,
            sample_rate=sample_rate,
        )
        audio = audio_tensor.cpu().numpy().astype(np.float32)

        logger.info(
            "TTS generado: %d muestras, voz=%s, texto='%s'",
            len(audio),
            voice_key,
            text[:40],
        )

        return TTSResult(audio=audio, sample_rate=sample_rate, voice=voice_key)
