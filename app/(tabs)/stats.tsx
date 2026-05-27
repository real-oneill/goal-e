import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import DisciplineIcon from '@/components/DisciplineIcon';
import ReadinessTrendChart from '@/components/ReadinessTrendChart';
import { Discipline, Session } from '@/types';

const DISCIPLINES: Discipline[] = ['bjj', 'workout', 'guitar'];

function getLast30Days(sessions: Session[]) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  return sessions.filter(s => new Date(s.date) >= cutoff);
}

function getStreak(sessions: Session[], discipline?: Discipline) {
  const filtered = discipline ? sessions.filter(s => s.discipline === discipline) : sessions;
  if (!filtered.length) return 0;
  const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date));
  const uniqueDays = [...new Set(sorted.map(s => s.date.slice(0, 10)))];
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const day of uniqueDays) {
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const diff = Math.round((current.getTime() - d.getTime()) / 86400000);
    if (diff <= 1) {
      streak++;
      current = d;
    } else {
      break;
    }
  }
  return streak;
}

function getCompletionRate(sessions: Session[], discipline?: Discipline) {
  const filtered = discipline ? sessions.filter(s => s.discipline === discipline) : sessions;
  if (!filtered.length) return 0;
  const met = filtered.filter(s => s.metDailyObjective).length;
  return Math.round((met / filtered.length) * 100);
}

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, goals } = useJournal();
  const last30 = useMemo(() => getLast30Days(sessions), [sessions]);

  const overallStreak = getStreak(sessions);
  const totalSessions = sessions.length;
  const completedGoals = goals.filter(g => g.isComplete).length;

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 100 }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Stats</Text>

        <View style={styles.overviewRow}>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="flash" size={20} color={colors.primary} />
            <Text style={[styles.overviewNum, { color: colors.foreground }]}>{overallStreak}</Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>day streak</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="layers-outline" size={20} color={colors.primary} />
            <Text style={[styles.overviewNum, { color: colors.foreground }]}>{totalSessions}</Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>total sessions</Text>
          </View>
          <View style={[styles.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="trophy-outline" size={20} color={colors.primary} />
            <Text style={[styles.overviewNum, { color: colors.foreground }]}>{completedGoals}</Text>
            <Text style={[styles.overviewLabel, { color: colors.mutedForeground }]}>goals met</Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Last 30 Days</Text>

        {DISCIPLINES.map(discipline => {
          const config = getDisciplineConfig(discipline);
          const accent = colors[config.colorKey];
          const discSessions = last30.filter(s => s.discipline === discipline);
          const streak = getStreak(sessions.filter(s => s.discipline === discipline));
          const rate = getCompletionRate(discSessions);
          const total30 = discSessions.length;

          return (
            <View key={discipline} style={[styles.disciplineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.discHeader}>
                <View style={[styles.discIcon, { backgroundColor: accent + '20' }]}>
                  <DisciplineIcon discipline={discipline} size={18} color={accent} />
                </View>
                <Text style={[styles.discName, { color: colors.foreground }]}>{config.label}</Text>
                <Pressable
                  onPress={() => router.push('/new-session')}
                  style={[styles.logBtn, { borderColor: accent, backgroundColor: accent + '10' }]}
                >
                  <Ionicons name="add" size={14} color={accent} />
                  <Text style={[styles.logBtnText, { color: accent }]}>Log</Text>
                </Pressable>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent }]}>{total30}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>sessions</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent }]}>{streak}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>day streak</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNum, { color: accent }]}>{rate}%</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>objectives met</Text>
                </View>
              </View>

              <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.barFill, { backgroundColor: accent, width: `${rate}%` }]} />
              </View>

              {discSessions.length === 0 && (
                <Text style={[styles.noData, { color: colors.mutedForeground }]}>
                  No sessions in the last 30 days
                </Text>
              )}

              {(discipline === 'bjj' || discipline === 'workout') && discSessions.length > 0 && (
                <>
                  <View style={[styles.chartDivider, { backgroundColor: colors.border }]} />
                  <ReadinessTrendChart sessions={discSessions} discipline={discipline} />
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  title: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  overviewRow: { flexDirection: 'row', gap: 10 },
  overviewCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  overviewNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  overviewLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  disciplineCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  discHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discIcon: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  discName: { flex: 1, fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  logBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  statDivider: { width: 1, height: 32 },
  barTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: 4, borderRadius: 2 },
  noData: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  chartDivider: { height: 1 },
});
