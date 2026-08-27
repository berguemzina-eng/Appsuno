# 🚀 Guía de Deployment (Gratis)

Para que tus amigos usen el APK sin tener tu computadora encendida,
necesitas desplegar el **backend** en algún servicio con capa gratuita.
El **frontend** (APK) se compila una sola vez apuntando a esa URL pública.

## Opción 1: Hugging Face Spaces (recomendado)

Ideal porque está pensado para cargas de trabajo de IA e incluye GPU
gratuita limitada.

1. Crea una cuenta en https://huggingface.co
2. Crea un nuevo Space → tipo **Docker**
3. Clona el Space y copia el contenido de `backend/` dentro:
   ```bash
   git clone https://huggingface.co/spaces/TU_USUARIO/moroccan-music
   cp -r backend/* moroccan-music/
   cd moroccan-music
   git add .
   git commit -m "Deploy backend"
   git push
   ```
4. Espera a que el Space termine de construir (revisa los logs).
5. Tu API queda en `https://TU_USUARIO-moroccan-music.hf.space`.

## Opción 2: Render.com

1. Conecta tu repositorio de GitHub en https://render.com
2. Crea un **Web Service** nuevo apuntando a la carpeta `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `python app.py`
5. Plan gratuito: ten en cuenta que se "duerme" tras inactividad y los
   modelos pesados pueden exceder la RAM del plan free — usa
   `MUSICGEN_MODEL=small`.

## Opción 3: Railway

1. Conecta el repo en https://railway.app
2. Selecciona la carpeta `backend/` como root
3. Railway detecta el `Dockerfile` automáticamente
4. Configura las variables de entorno desde el panel (ver `.env.example`)

## Opción 4: Servidor propio / VPS

```bash
git clone https://github.com/TU_USUARIO/moroccan-music-ai.git
cd moroccan-music-ai
docker-compose up -d --build
```

Recomendado detrás de un reverse proxy (nginx/Caddy) con HTTPS si vas a
exponerlo a internet.

## Después de desplegar: actualizar el frontend

Antes de compilar el APK final, edita:

```ts
// frontend/src/services/api.ts
export const API_BASE_URL = 'https://TU-BACKEND-DESPLEGADO.com';
```

Luego compila:

```bash
cd frontend
eas build --platform android --profile preview
```

## Consideraciones de recursos

| Modelo | VRAM/RAM aprox. | Velocidad (GPU) | Velocidad (CPU) |
|---|---|---|---|
| `musicgen-small` | ~3GB | ~5-10s por clip | ~1-2 min por clip |
| `musicgen-medium` | ~6GB | ~15-20s | ~3-5 min |
| `musicgen-large` | ~13GB | ~25-30s | no recomendado |

Para planes gratuitos (sin GPU), usa siempre `musicgen-small` y limita
`MAX_DURATION_SECONDS` a 30 para mantener tiempos de espera razonables.
