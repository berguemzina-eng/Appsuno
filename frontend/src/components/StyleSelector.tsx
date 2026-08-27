/**
 * StyleSelector.tsx - Selector horizontal de estilos musicales
 * (debe coincidir con las claves de STYLE_PROMPTS en el backend).
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

export interface StyleOption {
  key: string;
  label: string;
  emoji: string;
}

export const STYLE_OPTIONS: StyleOption[] = [
  { key: 'moroccan_trad', label: 'Tradicional', emoji: '🎻' },
  { key: 'gnaoua', label: 'Gnaoua', emoji: '🥁' },
  { key: 'chaabi', label: 'Chaabi', emoji: '🎉' },
  { key: 'andalusi', label: 'Andalusí', emoji: '🎼' },
  { key: 'rai', label: 'Raï', emoji: '🎤' },
  { key: 'ambient', label: 'Ambient', emoji: '🌙' },
];

interface StyleSelectorProps {
  selected: string;
  onSelect: (styleKey: string) => void;
}

export default function StyleSelector({ selected, onSelect }: StyleSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Estilo</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {STYLE_OPTIONS.map((option) => {
          const isSelected = option.key === selected;
          return (
            <TouchableOpacity
              key={option.key}
              style={[styles.pill, isSelected && styles.pillSelected]}
              onPress={() => onSelect(option.key)}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text
                style={[styles.pillText, isSelected && styles.pillTextSelected]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  label: {
    ...typography.caption,
    marginBottom: spacing.xs,
    marginLeft: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emoji: {
    marginRight: spacing.xs,
  },
  pillText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: colors.background,
    fontWeight: '700',
  },
});
