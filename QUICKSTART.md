# ⚡ Quick Start - Comienza en 5 minutos

## Opción A: Local (Para Testing)

### 1. Backend

```bash
cd backend

# Crear environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar
python app.py
```

✅ Backend corriendo en: `http://localhost:7860`

### 2. Frontend (En otra terminal)

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar
npx expo start

# En el QR que aparece:
# - Escanear con Expo Go app
# - O presionar 'w' para web
# - O presionar 'a' para Android emulator
```

✅ Frontend abierto en tu teléfono/emulador

### 3. Usar la App

1. Escribe un prompt en árabe:
   ```
   موسيقى مراكشية تقليدية
   ```

2. Selecciona estilo: Marroquí

3. Click "Generar" ✨

4. ¡Espera y disfruta! 🎵

---

## Opción B: Docker (Más Fácil)

```bash
# Clonar repo
git clone https://github.com/USERNAME/moroccan-music-ai
cd moroccan-music-ai

# Ejecutar todo con Docker
docker-compose up

# Esperar a que se carguen los modelos (~10-20 minutos primera vez)
```

Luego abrir frontend como en Opción A.

---

## Opción C: Deployment a Servidor (Para Amigos)

### 1. Deploy Backend a Hugging Face Spaces

```bash
# 1. Crear cuenta en https://huggingface.co
# 2. Crear nuevo Space (Docker)
# 3. Copiar URL del Space

# 4. Actualizar frontend:
# En frontend/App.tsx:
const API_BASE_URL = 'https://username-moroccan-music.hf.space';
```

### 2. Generar APK

```bash
cd frontend

# Compilar APK
eas build --platform android --profile preview

# Descargar .apk desde EAS dashboard
```

### 3. Compartir con Amigos

1. Enviar archivo .apk vía Google Drive o Telegram
2. Amigos descargan en teléfono
3. Abren archivo .apk
4. ¡Instalan y juegan!

---

## Prompts de Ejemplo

### En Árabe:
```
موسيقى عود مراكشية بطيئة وهادئة
موسيقى بنادر وإيقاع تقليدي
موسيقى هادئة للاسترخاء والتأمل
موسيقى راب مغربي بدارجة أوجدية
موسيقى غناء تقليدي مع كمان
```

### En Inglés:
```
Traditional moroccan music with oud
Slow gnaoua music with hand drums
Relaxing ambient moroccan style
Modern moroccan pop music
Fusion of arabic and western instruments
```

---

## Primeros Problemas & Soluciones

### "Connection refused"
```bash
# Backend no está corriendo
python backend/app.py
```

### "ModuleNotFoundError: torch"
```bash
pip install torch torchvision torchaudio
```

### "APK no instala"
- Verificar versión de Android (mín. Android 10)
- Permitir "Orígenes desconocidos" en Settings
- Desinstalar versión anterior

### "Modelo se tarda mucho"
- Primera carga descarga ~15GB (normal)
- Usar modelo más pequeño:
  ```python
  # En backend/models/musicgen.py
  model_name = "facebook/musicgen-small"
  ```

---

## Estructura Rápida

```
moroccan-music-ai/
├── backend/              ← API Python (FastAPI)
│   ├── app.py
│   ├── models/
│   └── requirements.txt
├── frontend/             ← App React Native
│   ├── App.tsx
│   ├── src/
│   └── package.json
├── docs/                 ← Documentación
├── README.md
└── docker-compose.yml    ← Para Docker
```

---

## Checklist Rápido

- [ ] Git clone hecho
- [ ] Python 3.10+ instalado
- [ ] Node.js 18+ instalado
- [ ] Backend corriendo (`http://localhost:7860`)
- [ ] Frontend abierto en teléfono/web
- [ ] Primer prompt generado ✅
- [ ] APK compilado (opcional)
- [ ] Compartir con amigos (opcional)

---

## Comandos Importantes

```bash
# Backend
python backend/app.py          # Ejecutar
curl http://localhost:7860     # Test

# Frontend
npx expo start                 # Ejecutar
eas build --platform android   # Build APK
npx expo run:android           # Ejecutar en emulador

# Docker
docker-compose up              # Levantar todo
docker-compose down            # Apagar
docker-compose logs backend    # Ver logs

# GitHub
git add .
git commit -m "mensaje"
git push origin main
```

---

## Siguientes Pasos

1. ✅ Completar Quick Start
2. 📖 Leer [docs/SETUP.md](docs/SETUP.md) para más detalles
3. 🚀 Leer [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) para producción
4. 📡 Leer [docs/API.md](docs/API.md) para API completa
5. 🤝 ¡Compartir y disfrutar!

---

## Links Útiles

- 📁 [GitHub](https://github.com)
- 🤗 [Hugging Face Spaces](https://huggingface.co/spaces)
- ⚡ [Expo Docs](https://docs.expo.dev)
- 🐍 [FastAPI Docs](https://fastapi.tiangolo.com)
- 🎵 [MusicGen Paper](https://arxiv.org/abs/2306.05284)

---

**¡Bienvenido! Ahora es tu turno de crear música. 🎵**

¿Preguntas? Abre un issue en GitHub.

---

Made with ❤️ for Moroccan music
