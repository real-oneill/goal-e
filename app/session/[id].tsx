import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import DisciplineIcon from '@/components/DisciplineIcon';

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <View style={sec.header}>
        <View style={[sec.line, { backgroundColor: color }]} />
        <Text style={[sec.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
const sec = StyleSheet.create({
  wrap: { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  line: { width: 3, height: 16, borderRadius: 2 },
  title: { fontSize: 13, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 1 },
});

function Field({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useColors> }) {
  if (!value) return null;
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>{label}</Text>
      <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground, lineHeight: 22 }}>{value}</Text>
    </View>
  );
}

function Rating({ label, value, color, colors }: { label: string; value: number; color: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, flex: 1 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View key={i} style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: i < value ? color : colors.border }} />
        ))}
      </View>
      <Text style={{ fontSize: 13, fontFamily: 'Inter_600SemiBold', color, width: 24, textAlign: 'right' }}>{value}/5</Text>
    </View>
  );
}

function Tags({ tags, color }: { tags: string[]; color: string }) {
  if (!tags.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {tags.map(t => (
        <View key={t} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: color + '20' }}>
          <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color }}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sessions, deleteSession } = useJournal();

  const session = sessions.find(s => s.id === id);

  if (!session) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 16 }]}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={[styles.notFoundText, { color: colors.mutedForeground }]}>Session not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getDisciplineConfig(session.discipline);
  const accent = colors[config.colorKey];

  function handleEdit() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const route = session!.discipline === 'bjj'
      ? '/log-bjj'
      : session!.discipline === 'guitar'
      ? '/log-guitar'
      : '/log-workout';
    router.push({ pathname: route as any, params: { sessionId: session!.id } });
  }

  function handleDelete() {
    Alert.alert('Delete session', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteSession(session!.id);
          router.back();
        }
      },
    ]);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerMid}>
          <View style={[styles.headerIcon, { backgroundColor: accent + '20' }]}>
            <DisciplineIcon discipline={session.discipline} size={16} color={accent} />
          </View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{config.label}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable onPress={handleEdit} style={styles.actionBtn}>
            <Ionicons name="pencil-outline" size={20} color={accent} />
          </Pressable>
          <Pressable onPress={handleDelete} style={styles.actionBtn}>
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
      >
        <Text style={[styles.dateText, { color: colors.mutedForeground }]}>{formatDate(session.date)}</Text>

        {session.metDailyObjective && (
          <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
            <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
            <Text style={[styles.badgeText, { color: '#22c55e' }]}>Daily objective met</Text>
          </View>
        )}

        <View style={styles.section}>
          <Section title="Session" color={accent}>
            <Field label="Objective" value={session.objective} colors={colors} />
            <Field label="What I worked on" value={session.actualWork} colors={colors} />
            <Field label="Notes" value={session.notes} colors={colors} />
            <Field label="What to improve" value={session.improvements} colors={colors} />
          </Section>
        </View>

        {session.bjj && (
          <>
            {(session.bjj.sessionDurationMinutes ?? 0) > 0 && (
              <View style={[styles.durationBadge, { backgroundColor: accent + '15' }]}>
                <Ionicons name="time-outline" size={14} color={accent} />
                <Text style={[styles.durationBadgeText, { color: accent }]}>{session.bjj.sessionDurationMinutes} min</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.section}>
              <Section title="Readiness" color={accent}>
                <Rating label="Energy" value={session.bjj.energyLevel} color={accent} colors={colors} />
                <Rating label="Motivation" value={session.bjj.motivationLevel} color={accent} colors={colors} />
                <Rating label="Sleep quality" value={session.bjj.sleepQuality} color={accent} colors={colors} />
                <Rating label="Diet quality" value={session.bjj.dietQuality} color={accent} colors={colors} />
                <Rating label="Physical condition" value={session.bjj.physicalCondition} color={accent} colors={colors} />
              </Section>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.section}>
              <Section title="Training" color={accent}>
                {session.bjj.techniques.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>Techniques</Text>
                    <Tags tags={session.bjj.techniques} color={accent} />
                  </View>
                )}
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 20, alignItems: 'flex-end' }}>
                    <View>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.6 }}>Sparring</Text>
                      <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: accent }}>{session.bjj.sparringRounds} <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>rounds</Text></Text>
                      {(session.bjj.sparringMinutes ?? 0) > 0 && (
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>{session.bjj.sparringMinutes} min</Text>
                      )}
                    </View>
                    <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
                    <View>
                      <Text style={{ fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_500Medium', textTransform: 'uppercase', letterSpacing: 0.6 }}>Drilling</Text>
                      <Text style={{ fontSize: 22, fontFamily: 'Inter_700Bold', color: accent }}>{session.bjj.drillingRounds} <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>rounds</Text></Text>
                      {(session.bjj.drillingMinutes ?? 0) > 0 && (
                        <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>{session.bjj.drillingMinutes} min</Text>
                      )}
                    </View>
                  </View>
                </View>
                {session.bjj.metMonthlyObjective && (
                  <View style={[styles.badge, { backgroundColor: accent + '15' }]}>
                    <Ionicons name="trophy-outline" size={14} color={accent} />
                    <Text style={[styles.badgeText, { color: accent }]}>Monthly objective met</Text>
                  </View>
                )}
              </Section>
            </View>
            {session.bjj.keyTakeaways ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.section}>
                  <Section title="Takeaways" color={accent}>
                    <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground, lineHeight: 22 }}>
                      {session.bjj.keyTakeaways}
                    </Text>
                  </Section>
                </View>
              </>
            ) : null}
          </>
        )}

        {session.guitar && (
          <>
            {(session.guitar.sessionDurationMinutes ?? 0) > 0 && (
              <View style={[styles.durationBadge, { backgroundColor: accent + '15' }]}>
                <Ionicons name="time-outline" size={14} color={accent} />
                <Text style={[styles.durationBadgeText, { color: accent }]}>{session.guitar.sessionDurationMinutes} min</Text>
              </View>
            )}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.section}>
              <Section title="Practice" color={accent}>
                {session.guitar.scalesPracticed.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>Scales</Text>
                    <Tags tags={session.guitar.scalesPracticed} color={accent} />
                  </View>
                )}
                {session.guitar.songsWorkedOn.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>Songs</Text>
                    <Tags tags={session.guitar.songsWorkedOn} color={accent} />
                  </View>
                )}
                {session.guitar.chordsLearned.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>Chords learned</Text>
                    <Tags tags={session.guitar.chordsLearned} color={accent} />
                  </View>
                )}
                {session.guitar.chordDiagrams.length > 0 && (
                  <View style={{ gap: 6 }}>
                    <Text style={{ fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.mutedForeground }}>
                      {session.guitar.chordDiagrams.length} chord diagram{session.guitar.chordDiagrams.length !== 1 ? 's' : ''} saved
                    </Text>
                  </View>
                )}
              </Section>
            </View>
            {session.guitar.keyTakeaways ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.section}>
                  <Section title="Takeaways" color={accent}>
                    <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground, lineHeight: 22 }}>
                      {session.guitar.keyTakeaways}
                    </Text>
                  </Section>
                </View>
              </>
            ) : null}
          </>
        )}

        {session.workout && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.section}>
              <Section title="Readiness" color={accent}>
                <Rating label="Energy" value={session.workout.energyLevel} color={accent} colors={colors} />
                <Rating label="Motivation" value={session.workout.motivationLevel} color={accent} colors={colors} />
                <Rating label="Sleep quality" value={session.workout.sleepQuality ?? 3} color={accent} colors={colors} />
                <Rating label="Diet quality" value={session.workout.dietQuality ?? 3} color={accent} colors={colors} />
                <Rating label="Physical condition" value={session.workout.physicalCondition} color={accent} colors={colors} />
                {session.workout.sessionDurationMinutes > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 14, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, flex: 1 }}>Duration</Text>
                    <Text style={{ fontSize: 15, fontFamily: 'Inter_700Bold', color: accent }}>{session.workout.sessionDurationMinutes} min</Text>
                  </View>
                )}
                {session.workout.completedAllWorkouts && (
                  <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
                    <Ionicons name="checkmark-circle" size={14} color="#22c55e" />
                    <Text style={[styles.badgeText, { color: '#22c55e' }]}>All planned work completed</Text>
                  </View>
                )}
              </Section>
            </View>
            {session.workout.exercises.length > 0 && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.section}>
                  <Section title="Exercises" color={accent}>
                    {session.workout.exercises.map(ex => (
                      <View key={ex.id} style={[styles.exCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                        <Text style={[styles.exName, { color: colors.foreground }]}>{ex.name || 'Exercise'}</Text>
                        {ex.sets.map((set, i) => (
                          <Text key={i} style={[styles.setRow, { color: colors.mutedForeground }]}>
                            Set {i + 1}: {set.reps > 0 ? `${set.reps} reps` : ''}{set.weight > 0 ? ` × ${set.weight} ${set.unit}` : ''}
                          </Text>
                        ))}
                      </View>
                    ))}
                  </Section>
                </View>
              </>
            )}
            {session.workout.keyTakeaways ? (
              <>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.section}>
                  <Section title="Takeaways" color={accent}>
                    <Text style={{ fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground, lineHeight: 22 }}>
                      {session.workout.keyTakeaways}
                    </Text>
                  </Section>
                </View>
              </>
            ) : null}
          </>
        )}
      </ScrollView>
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
  headerMid: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  actionBtn: { padding: 2 },
  scroll: { padding: 20, gap: 0 },
  dateText: { fontSize: 14, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  badgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  section: { gap: 12 },
  divider: { height: 1, marginVertical: 20 },
  exCard: { borderRadius: 10, borderWidth: 1, padding: 12, gap: 4 },
  exName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  setRow: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFoundText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  durationBadgeText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
