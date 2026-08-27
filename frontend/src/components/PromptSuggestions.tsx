/**
 * PromptSuggestions.tsx - Chips de prompts de ejemplo en árabe/darija
 * para que el usuario empiece rápido sin escribir desde cero.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing, radius, typography } from '../theme/theme';

const SUGGESTIONS: string[] = [
  'موسيقى عود مراكشية بطيئة وهادئة',
  'موسيقى بنادر وإيقاع تقليدي',
  'موسيقى هادئة للاسترخاء والتأمل',
  'موسيقى راب مغربي بدارجة أوجدية',
  'موسيقى غناء تقليدي مع كمان',
];

interface PromptSuggestionsProps {
  onSelect: (prompt: string) => void;
}

export default function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sugerencias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {SUGGESTIONS.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            style={styles.chip}
            onPress={() => onSelect(suggestion)}
          >
            <Text style={styles.chipText} numberOfLines={1}>
              {suggestion}
            </Text>
          </TouchableOpacity>
        ))}
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
  chip: {
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    maxWidth: 220,
  },
  chipText: {
    color: colors.text,
    fontSize: 13,
    textAlign: 'right',
  },
});
