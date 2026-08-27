# 📤 Cómo Subir Este Proyecto a GitHub

## 1. Crear el repositorio en GitHub

1. Entra a https://github.com/new
2. Nombre sugerido: `moroccan-music-ai`
3. Déjalo público o privado, como prefieras
4. **No** marques "Add a README" (ya tenemos uno) para evitar conflictos
5. Click en "Create repository"

## 2. Subir el código desde tu computadora

Descomprime el zip que te dieron y entra a la carpeta:

```bash
cd moroccan-music-ai
git init
git add .
git commit -m "Initial commit: Moroccan AI Music Generator"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/moroccan-music-ai.git
git push -u origin main
```

Reemplaza `TU_USUARIO` por tu nombre de usuario de GitHub.

## 3. Verificar que subió bien

Entra a `https://github.com/TU_USUARIO/moroccan-music-ai` y confirma que
ves las carpetas `backend/`, `frontend/` y `docs/`.

> El `.gitignore` ya excluye `node_modules/`, `venv/`, archivos `.env` y
> los audios generados, así que el repo se mantiene liviano.

## 4. Generar el APK desde este repositorio

Una vez subido, cualquiera puede clonarlo y compilar el APK:

```bash
git clone https://github.com/TU_USUARIO/moroccan-music-ai.git
cd moroccan-music-ai/frontend
npm install
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Al terminar el build, EAS entrega un enlace de descarga directa del
archivo `.apk`.

## 5. (Opcional) Desplegar el backend para que el APK funcione fuera de tu red local

El APK compilado apunta a la URL configurada en
`frontend/src/services/api.ts` (`API_BASE_URL`). Si vas a compartir el
APK con amigos, primero despliega el backend en un servicio gratuito
(Hugging Face Spaces, Render, Railway — ver `docs/DEPLOYMENT.md`),
actualiza esa URL con la dirección pública, y **luego** compila el APK.

## 6. Buenas prácticas antes de compartir el repo

- [ ] Revisa que no haya quedado ningún archivo `.env` con datos sensibles
- [ ] Actualiza el `projectId` de EAS en `frontend/app.json` con el tuyo
- [ ] Actualiza `API_BASE_URL` en `frontend/src/services/api.ts`
- [ ] Prueba `docker-compose up` localmente antes de subir
- [ ] Agrega una licencia (`LICENSE`) si el repo es público — el proyecto
      está pensado para MIT
