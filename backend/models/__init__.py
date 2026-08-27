"""
Paquete de modelos de IA para Moroccan AI Music Generator.

Expone:
- MusicGenerator: generación de música a partir de texto (MusicGen).
- ArabicTTS: síntesis de voz en árabe/darija.
- utilidades de audio (mezcla, normalización, fades, exportación).
"""

from .musicgen import MusicGenerator
from .tts import ArabicTTS
from . import utils

__all__ = ["MusicGenerator", "ArabicTTS", "utils"]
