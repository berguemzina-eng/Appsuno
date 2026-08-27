/**
 * AudioPlayer.tsx - Reproductor de audio simple para los clips generados.
 * Usa expo-av. Muestra play/pause, barra de progreso y tiempo.
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/theme';

interface AudioPlayerProps {
  uri: string;
  title?: string;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function AudioPlayer({ uri, title }: AudioPlayerProps) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync();
    };
  }, [uri]);

  const onStatusUpdate = (status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis ?? 0);
    setDuration(status.durationMillis ?? 0);
    setIsPlaying(status.isPlaying ?? false);
  };

  const togglePlayback = async () => {
    if (!soundRef.current) {
      setLoading(true);
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri },
          { shouldPlay: true },
          onStatusUpdate
        );
        soundRef.current = sound;
      } finally {
        setLoading(false);
      }
      return;
    }

    const status = await soundRef.current.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.container}>
      {title ? (
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      ) : null}

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={togglePlayback}
          disabled={loading}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={22}
            color={colors.background}
          />
        </TouchableOpacity>

        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  title: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  timeText: {
    color: colors.textSecondary,
    fontSize: 11,
  },
});
