/**
 * SettingsScreen.tsx - Configuración de la app: URL del backend,
 * voz por defecto, y datos sobre la app.
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, radius, typography } from '../theme/theme';
import { API_BASE_URL } from '../services/api';

const STORAGE_KEY_BACKEND_URL = 'settings.backendUrl';

export default function SettingsScreen() {
  const [backendUrl, setBackendUrl] = useState(API_BASE_URL);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY_BACKEND_URL).then((value) => {
      if (value) setBackendUrl(value);
    });
  }, []);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY_BACKEND_URL, backendUrl.trim());
      setSavedMessage('Guardado. Reinicia la app para aplicar el cambio.');
    } catch {
      Alert.alert('Error', 'No se pudo guardar la configuración');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={typography.heading}>⚙️ Ajustes</Text>

      <Text style={[typography.subheading, styles.sectionLabel]}>
        URL del backend
      </Text>
      <TextInput
        style={styles.input}
        value={backendUrl}
        onChangeText={setBackendUrl}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="https://tu-usuario-moroccan-music.hf.space"
        placeholderTextColor={colors.textSecondary}
      />
      <Text style={styles.hint}>
        Nota: por ahora este valor se guarda localmente; para que la app lo
        use en tiempo de ejecución, actualiza también `API_BASE_URL` en
        `src/services/api.ts` antes de compilar el APK.
      </Text>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Guardar</Text>
      </TouchableOpacity>

      {savedMessage ? <Text style={styles.saved}>{savedMessage}</Text> : null}

      <View style={styles.divider} />

      <Text style={[typography.subheading, styles.sectionLabel]}>
        Acerca de
      </Text>
      <Text style={styles.aboutText}>
        Moroccan AI Music Generator{'\n'}
        Versión 1.0.0{'\n'}
        100% gratis y open source (MIT License){'\n'}
        Generación con MusicGen (Meta) + Silero TTS
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  sectionLabel: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hint: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: '700',
  },
  saved: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  aboutText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
