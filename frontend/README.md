# Frontend - Moroccan AI Music Generator

App React Native (Expo) con soporte para árabe, tema oscuro estilo Suno,
generador interactivo, biblioteca de canciones y reproductor de audio.

## Instalación

```bash
npm install
```

## Ejecutar en desarrollo

```bash
npx expo start
```

- Presiona `w` para abrir en el navegador.
- Presiona `a` para abrir en un emulador Android.
- Escanea el QR con la app **Expo Go** en tu teléfono.

Antes de generar música, asegúrate de que el backend esté corriendo
(por defecto en `http://localhost:7860`) o edita `API_BASE_URL` en
`src/services/api.ts` para apuntar a tu backend desplegado.

## Compilar el APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

Al terminar, EAS te da un link para descargar el `.apk` directamente.

## Estructura

```
frontend/
├── App.tsx                 # Navegación raíz (tabs)
├── app.json                # Config de Expo
├── eas.json                # Perfiles de build (EAS)
├── src/
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── GeneratorScreen.tsx
│   │   ├── LibraryScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   ├── AudioPlayer.tsx
│   │   ├── PromptSuggestions.tsx
│   │   └── StyleSelector.tsx
│   ├── services/
│   │   └── api.ts
│   └── theme/
│       └── theme.ts
```
