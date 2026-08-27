# 🛠️ Guía de Instalación Detallada

## Requisitos previos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Python | 3.10 | `python --version` |
| Node.js | 18 | `node --version` |
| npm | 9 | `npm --version` |
| Git | cualquiera | `git --version` |
| Expo CLI | (se instala con npx, no hace falta global) | — |

Opcional pero recomendado para generación rápida: GPU NVIDIA con drivers
CUDA instalados (`nvidia-smi` debe funcionar).

## 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/moroccan-music-ai.git
cd moroccan-music-ai
```

## 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

pip install -r requirements.txt
cp ../.env.example .env       # y ajusta valores si hace falta

python app.py
```

Verifica que responda:

```bash
curl http://localhost:7860/health
```

### Notas sobre la primera ejecución

- La primera vez que generes música, se descargará el modelo MusicGen
  elegido (`small` ≈ 3GB por defecto). Puede tardar varios minutos según
  tu conexión.
- La primera vez que generes con voz, se descargará el modelo Silero TTS
  (mucho más liviano, ~100MB).
- Ambos quedan cacheados en `~/.cache/huggingface` y `~/.cache/torch`.

## 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
npx expo start
```

Opciones desde la terminal de Expo:
- `w` → abre en el navegador
- `a` → abre en emulador Android (requiere Android Studio configurado)
- Escanear QR con la app **Expo Go** en tu teléfono

Si tu teléfono y tu computadora no están en la misma red, usa
`npx expo start --tunnel`.

## 4. Configurar la URL del backend

Por defecto el frontend apunta a `http://localhost:7860`
(`frontend/src/services/api.ts`). Si usas el emulador Android, puede que
necesites `http://10.0.2.2:7860` en su lugar. Si despliegas el backend
en la nube, reemplaza esa URL por la pública.

## 5. Docker (alternativa todo-en-uno para el backend)

```bash
docker-compose up --build
```

Esto construye la imagen del backend y la deja corriendo en
`http://localhost:7860`. El frontend se sigue ejecutando por separado
con `npx expo start`.

## Problemas comunes

Ver la sección "Primeros Problemas & Soluciones" en
[`QUICKSTART.md`](../QUICKSTART.md).
