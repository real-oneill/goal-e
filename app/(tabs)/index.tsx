import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import DisciplineIcon from '@/components/DisciplineIcon';
import SessionCard from '@/components/SessionCard';
import { Discipline } from '@/types';

const DISCIPLINES: Discipline[] = ['bjj', 'workout', 'guitar'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, getCurrentMonthGoals, getCurrentYearGoals, getSessionsForMonth } = useJournal();
  const month = new Date().toISOString().slice(0, 7);
  const year = new Date().getFullYear().toString();
  const monthGoals = getCurrentMonthGoals();
  const yearGoals = getCurrentYearGoals();
  const monthSessions = useMemo(() => getSessionsForMonth(month), [month, sessions]);
  const recentSessions = sessions.slice(0, 3);

  const statsPerDiscipline = useMemo(() => {
    return DISCIPLINES.map(d => ({
      discipline: d,
      count: monthSessions.filter(s => s.discipline === d).length,
      monthGoal: monthGoals.find(g => g.discipline === d),
      yearGoal: yearGoals.find(g => g.discipline === d),
    }));
  }, [monthSessions, monthGoals, yearGoals]);

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingTop: 16, paddingBottom: insets.bottom + 100 }]}
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{getGreeting()}</Text>
            <Text style={[styles.monthLabel, { color: colors.foreground }]}>{formatMonth(month)}</Text>
          </View>
          <Pressable
            onPress={() => router.push('/new-session')}
            style={[styles.startBtn, { backgroundColor: colors.primary }]}
          >
            <Ionicons name="add" size={20} color={colors.primaryForeground} />
            <Text style={[styles.startBtnText, { color: colors.primaryForeground }]}>Log Session</Text>
          </Pressable>
        </View>

        <View style={styles.disciplineGrid}>
          {statsPerDiscipline.map(({ discipline, count, monthGoal, yearGoal }) => {
            const config = getDisciplineConfig(discipline);
            const accent = colors[config.colorKey];
            const hasAnyGoal = !!(monthGoal || yearGoal);
            const allComplete = (!monthGoal || monthGoal.isComplete) && (!yearGoal || yearGoal.isComplete);
            return (
              <Pressable
                key={discipline}
                onPress={() => router.push('/new-session')}
                style={({ pressed }) => [
                  styles.disciplineTile,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <LinearGradient
                  colors={[accent + '30', accent + '05']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={[styles.tileIcon, { backgroundColor: accent + '25' }]}>
                  <DisciplineIcon discipline={discipline} size={22} color={accent} />
                </View>
                <Text style={[styles.tileName, { color: colors.foreground }]}>{config.label}</Text>
                <Text style={[styles.tileCount, { color: accent }]}>{count} sessions</Text>
                {hasAnyGoal && (
                  <View style={[styles.goalDot, { backgroundColor: allComplete ? '#22c55e' : accent }]} />
                )}
              </Pressable>
            );
          })}
        </View>

        {yearGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{year} Goals</Text>
              <Pressable onPress={() => router.push('/(tabs)/goals')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {yearGoals.map(goal => {
              const config = getDisciplineConfig(goal.discipline);
              const accent = colors[config.colorKey];
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => router.push(`/goal/${goal.id}`)}
                  style={[styles.goalRow, { backgroundColor: colors.card, borderColor: accent + '40' }]}
                >
                  <View style={[styles.goalIcon, { backgroundColor: accent + '20' }]}>
                    <DisciplineIcon discipline={goal.discipline} size={14} color={accent} />
                  </View>
                  <View style={styles.goalMeta}>
                    <Text style={[styles.goalDiscipline, { color: accent }]}>{config.label}</Text>
                    <Text style={[styles.goalText, { color: colors.foreground }]} numberOfLines={1}>
                      {goal.goal}
                    </Text>
                  </View>
                  {goal.isComplete ? (
                    <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={18} color={colors.mutedForeground} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {monthGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trophy-outline" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Goals</Text>
              <Pressable onPress={() => router.push('/(tabs)/goals')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {monthGoals.map(goal => {
              const config = getDisciplineConfig(goal.discipline);
              const accent = colors[config.colorKey];
              return (
                <Pressable
                  key={goal.id}
                  onPress={() => router.push(`/goal/${goal.id}`)}
                  style={[styles.goalRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <View style={[styles.goalIcon, { backgroundColor: accent + '20' }]}>
                    <DisciplineIcon discipline={goal.discipline} size={14} color={accent} />
                  </View>
                  <Text style={[styles.goalText, { color: colors.foreground }]} numberOfLines={1}>
                    {goal.goal}
                  </Text>
                  {goal.isComplete ? (
                    <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={18} color={colors.mutedForeground} />
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        {recentSessions.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={16} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Sessions</Text>
              <Pressable onPress={() => router.push('/(tabs)/log')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </Pressable>
            </View>
            {recentSessions.map(s => (
              <SessionCard key={s.id} session={s} onPress={() => router.push(`/session/${s.id}`)} />
            ))}
          </View>
        ) : (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="journal-outline" size={40} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Start your first session</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Log sessions, set monthly goals, and track your progress
            </Text>
            <Pressable
              onPress={() => router.push('/new-session')}
              style={[styles.emptyBtn, { backgroundColor: colors.primary }]}
            >
              <Text style={[styles.emptyBtnText, { color: colors.primaryForeground }]}>Log your first session</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  monthLabel: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  startBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  disciplineGrid: { flexDirection: 'row', gap: 10 },
  disciplineTile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileName: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  tileCount: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  goalDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', flex: 1 },
  seeAll: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  goalIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalMeta: { flex: 1, gap: 1 },
  goalDiscipline: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  goalText: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', textAlign: 'center' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 20 },
  emptyBtn: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  emptyBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
