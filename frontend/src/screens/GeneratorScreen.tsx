/**
 * GeneratorScreen.tsx - Pantalla principal: escribir prompt, elegir
 * estilo, generar música y reproducir el resultado.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import StyleSelector from '../components/StyleSelector';
import PromptSuggestions from '../components/PromptSuggestions';
import AudioPlayer from '../components/AudioPlayer';
import api, { StatusResponse } from '../services/api';

type GenState = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export default function GeneratorScreen() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('moroccan_trad');
  const [duration, setDuration] = useState(30);
  const [includeVoice, setIncludeVoice] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [state, setState] = useState<GenState>('idle');
  const [result, setResult] = useState<StatusResponse | null>(null);

  const isBusy = state === 'queued' || state === 'processing';

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Alert.alert('Falta el prompt', 'Escribe qué música quieres generar.');
      return;
    }

    setResult(null);
    setState('queued');

    try {
      const { id } = await api.generate({
        prompt,
        style,
        duration,
        includeVoice,
        voiceText: includeVoice ? voiceText : undefined,
      });

      setState('processing');
      const finalStatus = await api.pollUntilDone(id);

      if (finalStatus.status === 'completed') {
        setResult(finalStatus);
        setState('completed');
      } else {
        setState('failed');
        Alert.alert('Error generando música', finalStatus.error ?? 'Error desconocido');
      }
    } catch (err: any) {
      setState('failed');
      Alert.alert('Error', err.message ?? 'No se pudo generar la música');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={typography.heading}>🎵 Generador</Text>
      <Text style={[typography.subheading, styles.subheading]}>
        Describe la música que quieres crear
      </Text>

      <TextInput
        style={styles.promptInput}
        placeholder="مثال: موسيقى مراكشية تقليدية"
        placeholderTextColor={colors.textSecondary}
        value={prompt}
        onChangeText={setPrompt}
        multiline
        textAlign="right"
      />

      <PromptSuggestions onSelect={setPrompt} />

      <StyleSelector selected={style} onSelect={setStyle} />

      <View style={styles.durationRow}>
        <Text style={typography.body}>Duración: {duration}s</Text>
        <View style={styles.durationButtons}>
          {[15, 30, 60].map((d) => (
            <TouchableOpacity
              key={d}
              style={[
                styles.durationChip,
                duration === d && styles.durationChipSelected,
              ]}
              onPress={() => setDuration(d)}
            >
              <Text
                style={[
                  styles.durationChipText,
                  duration === d && styles.durationChipTextSelected,
                ]}
              >
                {d}s
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.voiceRow}>
        <Text style={typography.body}>Incluir voz (TTS árabe)</Text>
        <Switch
          value={includeVoice}
          onValueChange={setIncludeVoice}
          trackColor={{ false: colors.border, true: colors.primaryDark }}
          thumbColor={includeVoice ? colors.primary : colors.textSecondary}
        />
      </View>

      {includeVoice && (
        <TextInput
          style={styles.voiceInput}
          placeholder="نص الصوت..."
          placeholderTextColor={colors.textSecondary}
          value={voiceText}
          onChangeText={setVoiceText}
          multiline
          textAlign="right"
        />
      )}

      <TouchableOpacity
        style={[styles.generateButton, isBusy && styles.generateButtonDisabled]}
        onPress={handleGenerate}
        disabled={isBusy}
      >
        {isBusy ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <>
            <Ionicons name="sparkles" size={18} color={colors.background} />
            <Text style={styles.generateButtonText}>Generar</Text>
          </>
        )}
      </TouchableOpacity>

      {state === 'queued' && (
        <Text style={styles.statusText}>En cola...</Text>
      )}
      {state === 'processing' && (
        <Text style={styles.statusText}>
          Generando música, esto puede tardar unos minutos ✨
        </Text>
      )}

      {result?.audio_url && (
        <View style={styles.resultContainer}>
          <AudioPlayer
            uri={`${api.getDownloadUrl(result.id)}`}
            title={result.prompt}
          />
        </View>
      )}
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
    paddingBottom: spacing.xl * 2,
  },
  subheading: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  promptInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    textAlignVertical: 'top',
  },
  voiceInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    color: colors.text,
    minHeight: 60,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    textAlignVertical: 'top',
  },
  durationRow: {
    marginTop: spacing.md,
  },
  durationButtons: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  durationChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceLight,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationChipText: {
    color: colors.text,
    fontWeight: '500',
  },
  durationChipTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  statusText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  resultContainer: {
    marginTop: spacing.lg,
  },
});
