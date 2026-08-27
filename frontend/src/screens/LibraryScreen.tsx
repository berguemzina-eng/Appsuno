/**
 * LibraryScreen.tsx - Lista de generaciones anteriores obtenidas
 * desde el backend (/api/library), con reproducción y regeneración.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/theme';
import AudioPlayer from '../components/AudioPlayer';
import api, { LibraryItem } from '../services/api';

export default function LibraryScreen() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { items: fetched } = await api.getLibrary();
      setItems(fetched);
    } catch {
      // Silencioso: si el backend no está disponible, se muestra lista vacía
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const renderItem = ({ item }: { item: LibraryItem }) => {
    const isExpanded = expandedId === item.id;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemPrompt} numberOfLines={1}>
              {item.prompt || 'Sin descripción'}
            </Text>
            <Text style={styles.itemMeta}>
              {item.style ?? 'estilo libre'} · {item.status}
            </Text>
          </View>
          <Ionicons
            name={item.status === 'completed' ? 'checkmark-circle' : 'time'}
            size={20}
            color={
              item.status === 'completed' ? colors.success : colors.textSecondary
            }
          />
        </View>

        {isExpanded && item.status === 'completed' && (
          <View style={styles.playerWrapper}>
            <AudioPlayer uri={api.getDownloadUrl(item.id)} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[typography.heading, styles.title]}>📚 Biblioteca</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Aún no has generado ninguna canción. ¡Ve a la pestaña Generador!
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  itemPrompt: {
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  itemMeta: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  playerWrapper: {
    marginTop: spacing.md,
  },
  emptyText: {
    ...typography.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
