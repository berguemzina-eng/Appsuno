/**
 * SplashScreen.tsx - Pantalla de bienvenida mostrada mientras la app
 * verifica la conexión con el backend.
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme/theme';
import api from '../services/api';

interface SplashScreenProps {
  onReady: (backendOnline: boolean) => void;
}

export default function SplashScreen({ onReady }: SplashScreenProps) {
  const [message, setMessage] = useState('Conectando con el servidor...');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        await api.health();
        if (!cancelled) {
          setMessage('¡Listo!');
          setTimeout(() => onReady(true), 400);
        }
      } catch {
        if (!cancelled) {
          setMessage('No se pudo conectar al backend. Revisa la URL en Ajustes.');
          setTimeout(() => onReady(false), 1200);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [onReady]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎵</Text>
      <Text style={styles.title}>Oujda AI Music</Text>
      <Text style={styles.subtitle}>Generador de música marroquí con IA</Text>
      <ActivityIndicator
        color={colors.primary}
        size="large"
        style={styles.spinner}
      />
      <Text style={styles.status}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  logo: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.heading,
    fontSize: 28,
  },
  subtitle: {
    ...typography.subheading,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  spinner: {
    marginTop: spacing.xl,
  },
  status: {
    ...typography.caption,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
