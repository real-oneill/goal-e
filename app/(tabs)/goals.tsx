import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import GoalCard from '@/components/GoalCard';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import { Discipline, MonthlyGoal } from '@/types';

const DISCIPLINE_FILTERS: (Discipline | 'all')[] = ['all', 'bjj', 'workout', 'guitar'];
const PERIOD_FILTERS: ('all' | 'monthly' | 'yearly')[] = ['all', 'monthly', 'yearly'];

export default function GoalsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { goals, sessions } = useJournal();
  const [discFilter, setDiscFilter] = useState<Discipline | 'all'>('all');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'monthly' | 'yearly'>('all');

  const filtered = useMemo(() => {
    let list = goals;
    if (discFilter !== 'all') list = list.filter(g => g.discipline === discFilter);
    if (periodFilter !== 'all') list = list.filter(g => g.period === periodFilter);
    return [...list].sort((a, b) => {
      if (a.period !== b.period) return a.period === 'yearly' ? -1 : 1;
      return b.month.localeCompare(a.month);
    });
  }, [goals, discFilter, periodFilter]);

  function sessionCountForGoal(goal: MonthlyGoal) {
    if (goal.period === 'yearly') {
      return sessions.filter(s => s.discipline === goal.discipline && s.date.startsWith(goal.month)).length;
    }
    return sessions.filter(s => s.discipline === goal.discipline && s.date.startsWith(goal.month)).length;
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Goals</Text>
        <Pressable
          onPress={() => router.push('/goal/new')}
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
        >
          <Ionicons name="add" size={20} color={colors.primaryForeground} />
        </Pressable>
      </View>

      <View style={[styles.filtersWrap, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {PERIOD_FILTERS.map(f => {
            const active = f === periodFilter;
            const label = f === 'all' ? 'All' : f === 'monthly' ? 'Monthly' : 'Yearly';
            const icon = f === 'yearly' ? 'calendar-outline' : f === 'monthly' ? 'calendar-number-outline' : undefined;
            return (
              <Pressable
                key={f}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriodFilter(f); }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? colors.primary + '20' : 'transparent',
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                {icon && <Ionicons name={icon} size={12} color={active ? colors.primary : colors.mutedForeground} />}
                <Text style={[styles.filterText, { color: active ? colors.primary : colors.mutedForeground }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterRow, styles.filterRowSecond]}>
          {DISCIPLINE_FILTERS.map(f => {
            const active = f === discFilter;
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
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDiscFilter(f); }}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? accent + '20' : 'transparent',
                    borderColor: active ? accent : colors.border,
                  },
                ]}
              >
                <Text style={[styles.filterText, { color: active ? accent : colors.mutedForeground }]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={g => g.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        renderItem={({ item }) => (
          <GoalCard
            goal={item}
            sessionCount={sessionCountForGoal(item)}
            onPress={() => router.push(`/goal/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="trophy-outline" size={48} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No goals yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Set monthly or yearly goals for each discipline
            </Text>
            <Pressable
              onPress={() => router.push('/goal/new')}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>Set a goal</Text>
            </Pressable>
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
  filtersWrap: { borderBottomWidth: 1, paddingVertical: 8 },
  filterRow: { paddingHorizontal: 20 },
  filterRowSecond: { marginTop: 6 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  filterText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  list: { padding: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', paddingHorizontal: 40, lineHeight: 22 },
  emptyBtn: { marginTop: 8, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20 },
  emptyBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
