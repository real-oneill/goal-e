import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import SessionCard from '@/components/SessionCard';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import { Discipline } from '@/types';

const FILTERS: (Discipline | 'all')[] = ['all', 'bjj', 'workout', 'guitar'];

export default function LogScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions } = useJournal();
  const [filter, setFilter] = useState<Discipline | 'all'>('all');

  const filtered = filter === 'all' ? sessions : sessions.filter(s => s.discipline === filter);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Journal</Text>
        <Pressable
          onPress={() => router.push('/new-session')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <View style={[styles.filters, { borderBottomColor: colors.border }]}>
        {FILTERS.map(f => {
          const active = f === filter;
          let label = 'All';
          let accent = colors.primary;
          if (f !== 'all') {
            const config = getDisciplineConfig(f);
            label = config.label;
            accent = colors[config.colorKey];
          }
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: active ? (f === 'all' ? colors.primary : accent) + '20' : 'transparent',
                  borderColor: active ? (f === 'all' ? colors.primary : accent) : colors.border,
                },
              ]}
            >
              <Text style={[styles.filterText, { color: active ? (f === 'all' ? colors.primary : accent) : colors.mutedForeground }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={s => s.id}
        scrollEnabled={!!filtered.length}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item }) => (
          <SessionCard session={item} onPress={() => router.push(`/session/${item.id}`)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="journal-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sessions yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {filter === 'all' ? 'Log your first training session' : `Log your first ${getDisciplineConfig(filter).label} session`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  filterText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { padding: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40 },
});
