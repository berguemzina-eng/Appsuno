# Backend - Moroccan AI Music Generator

API REST en FastAPI que genera música marroquí con IA (MusicGen) y voz
en árabe (Silero TTS), y las mezcla en un único archivo de audio.

## Instalación

```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Ejecutar

```bash
python app.py
```

Por defecto queda disponible en `http://localhost:7860`. La documentación
interactiva (Swagger) está en `http://localhost:7860/docs`.

## Variables de entorno

Ver `.env.example` en la raíz del proyecto. Las más relevantes:

| Variable | Descripción | Default |
|---|---|---|
| `PORT` | Puerto del servidor | `7860` |
| `MUSICGEN_MODEL` | `small`, `medium` o `large` | `small` |
| `MAX_DURATION_SECONDS` | Duración máxima permitida por generación | `60` |
| `OUTPUT_DIR` | Carpeta donde se guardan los WAV generados | `outputs` |
| `CORS_ORIGINS` | Orígenes permitidos (coma-separados) | `*` |

## Endpoints

Ver [`docs/API.md`](../docs/API.md) para el detalle completo de cada
endpoint, parámetros y ejemplos de respuesta.

## Notas sobre los modelos

- **MusicGen** se descarga automáticamente desde Hugging Face la
  primera vez que se genera música (varios GB según el tamaño elegido).
- **Silero TTS** se descarga vía `torch.hub` la primera vez que se
  solicita una generación con voz.
- Ambos modelos quedan cacheados localmente tras la primera descarga.
