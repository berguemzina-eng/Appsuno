# 📡 Documentación de la API

Base URL local: `http://localhost:7860`
Documentación interactiva (Swagger): `http://localhost:7860/docs`

---

## `GET /`
Información básica de la API.

## `GET /health`
Estado del servidor y de los modelos.

```json
{
  "status": "ok",
  "musicgen_loaded": false,
  "musicgen_model": "facebook/musicgen-small",
  "device": "cpu",
  "tts_loaded": false
}
```

## `GET /styles`
Lista de estilos musicales predefinidos.

```json
{ "styles": ["moroccan_trad", "gnaoua", "chaabi", "andalusi", "rai", "ambient"] }
```

## `GET /voices`
Voces TTS disponibles.

```json
{ "voices": ["male", "female"] }
```

## `POST /api/generate`
Encola una generación de música (+ voz opcional). Se procesa en
background; usa `GET /api/status/{id}` para consultar el progreso.

**Body:**
```json
{
  "prompt": "موسيقى مراكشية تقليدية",
  "style": "moroccan_trad",
  "duration": 30,
  "include_voice": false,
  "voice": "female",
  "voice_text": null,
  "temperature": 1.0,
  "seed": null
}
```

**Respuesta:**
```json
{
  "id": "a1b2c3d4e5f6",
  "status": "queued",
  "message": "Generación en curso. Consulta /api/status/{id} para ver el progreso."
}
```

## `GET /api/status/{id}`
Consulta el estado de una generación.

```json
{
  "id": "a1b2c3d4e5f6",
  "status": "completed",
  "prompt": "موسيقى مراكشية تقليدية",
  "style": "moroccan_trad",
  "duration": 30.2,
  "audio_url": "/api/download/a1b2c3d4e5f6",
  "error": null,
  "created_at": 1735000000.0
}
```

Valores posibles de `status`: `queued`, `processing`, `completed`, `failed`.

## `GET /api/download/{id}`
Descarga el archivo WAV generado (`audio/wav`). Devuelve 404 si aún no
está listo.

## `POST /api/regenerate/{id}`
Vuelve a generar usando el mismo prompt/estilo/duración de una
generación anterior, con una nueva `id`.

## `GET /api/library?limit=50`
Lista las generaciones más recientes (metadata, sin el audio).

```json
{
  "items": [
    {
      "id": "a1b2c3d4e5f6",
      "status": "completed",
      "prompt": "...",
      "style": "moroccan_trad",
      "created_at": 1735000000.0,
      "duration": 30.2
    }
  ]
}
```

---

## Códigos de error comunes

| Código | Causa |
|---|---|
| 404 | Generación/audio no encontrado |
| 422 | Body de la petición inválido (revisa tipos y rangos) |
| 500 | Error interno generando el audio (ver `error` en `/api/status/{id}`) |
