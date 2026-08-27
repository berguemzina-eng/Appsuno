# 🎵 Moroccan AI Music Generator - Oujda Edition

Generador de música marroquí con IA. Similar a Suno, totalmente gratis y open source.

## ✨ Features

- 🎼 Generar música marroquí con IA
- 🎙️ Síntesis de voz en árabe/darija
- 🎵 Crear canciones completas (intro, verso, coro)
- 📱 App APK para Android
- ⚙️ Backend con modelos open source
- 🎨 UI tipo Suno

## 🛠️ Stack Tecnológico

**Frontend:**
- React Native + Expo
- TypeScript
- React Navigation
- Audio Player

**Backend:**
- Python FastAPI
- MusicGen (Meta)
- TTS Árabe (Silero/TacotronII)
- Hugging Face Transformers

**Hosting Gratis:**
- Hugging Face Spaces (backend)
- GitHub (código)

## 📋 Requisitos

- Node.js 18+
- Python 3.10+
- Expo CLI
- Git

## 🚀 Instalación Rápida

### Backend (Python + Hugging Face Spaces)

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend (React Native)

```bash
cd frontend
npm install
npx expo start

# Escanea QR con Expo Go o:
npx eas build --platform android --profile preview
```

## 📁 Estructura del Proyecto

```
moroccan-music-ai/
├── backend/
│   ├── app.py                 # API FastAPI
│   ├── models/
│   │   ├── musicgen.py       # Generador de música
│   │   ├── tts.py            # Síntesis de voz árabe
│   │   └── utils.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
├── frontend/
│   ├── app.json
│   ├── App.tsx
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── theme/
│   ├── package.json
│   └── README.md
├── docs/
│   ├── SETUP.md
│   ├── API.md
│   └── DEPLOYMENT.md
└── README.md
```

## 🎯 Cómo Funciona

1. **Usuario escribe prompt** en árabe/darija
2. **Backend procesa:**
   - MusicGen genera la música
   - TTS genera la voz
   - Se combinan y mezclan
3. **App reproduce** el audio generado
4. **Usuario puede:** descargar, compartir, regenerar

## 📊 Modelos Gratis Usados

- **MusicGen Large** - Meta (gratis, open source)
- **Silero TTS** - Voces rusas/árabes (gratis)
- **TacotronII** - TTS alternativo
- **Transformers** - Hugging Face (gratis)

## 🌐 Deploy Gratis

### Opción 1: Hugging Face Spaces (RECOMENDADO)

```bash
# Crear nuevo Space en huggingface.co
git clone https://huggingface.co/spaces/TU_USER/moroccan-music
cp -r backend/* .
git push
# ¡Listo! Tu app está en línea
```

### Opción 2: Replit

```bash
# Copiar todo el backend a Replit
# Ejecutar desde interface
```

### Opción 3: Render.com (Free Tier)

- Conectar GitHub
- Deploy automático
- Gratis por 3 meses

## 🔌 API Endpoints

```
POST /api/generate
{
  "prompt": "موسيقى مراكشية تقليدية",
  "duration": 30,
  "style": "moroccan_trad"
}

Response:
{
  "audioUrl": "https://...",
  "id": "abc123",
  "status": "completed"
}
```

## 📱 Screenshots (Esperado)

```
┌─────────────────┐
│   🎵 Oujda AI   │
├─────────────────┤
│  [Prompt Input] │
│  موسيقى عربية   │
│  ┌───────────┐  │
│  │ GENERATE  │  │
│  └───────────┘  │
│                 │
│  ▶️ ▮▮▮▮▮      │
│                 │
│ [Download] [+] │
└─────────────────┘
```

## 📝 Licencia

MIT - Úsalo libremente

## 🤝 Contribuciones

Fork, modifica, y haz PR. Todas las contribuciones son bienvenidas.

## ⚠️ Notas Legales

- Solo para uso personal
- Respetar derechos de autor
- Los modelos son open source (Licencias: MIT, CC-BY)

## 📞 Soporte

- 📧 Issues en GitHub
- 💬 Discussions

---

**Made with ❤️ para la música marroquí**
