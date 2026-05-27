import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import DisciplineIcon from '@/components/DisciplineIcon';
import SessionCard from '@/components/SessionCard';

function formatPeriodLabel(period: 'monthly' | 'yearly', month: string) {
  if (period === 'yearly') return month;
  const [y, mo] = month.split('-');
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function GoalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { goals, sessions, updateGoal, deleteGoal } = useJournal();

  const goal = goals.find(g => g.id === id);

  const [reflection, setReflection] = useState(goal?.reflection ?? '');
  const [isComplete, setIsComplete] = useState(goal?.isComplete ?? false);
  const [editing, setEditing] = useState(false);
  const [goalText, setGoalText] = useState(goal?.goal ?? '');

  useEffect(() => {
    if (goal) {
      setReflection(goal.reflection);
      setIsComplete(goal.isComplete);
      setGoalText(goal.goal);
    }
  }, [goal?.id]);

  if (!goal) {
    return (
      <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: 16 }]}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </Pressable>
        </View>
        <View style={styles.centered}>
          <Text style={[styles.centeredText, { color: colors.mutedForeground }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = getDisciplineConfig(goal.discipline);
  const accent = colors[config.colorKey];
  const isYearly = goal.period === 'yearly';

  const linkedSessions = sessions.filter(s =>
    s.discipline === goal.discipline && s.date.startsWith(goal.month)
  );

  async function save() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await updateGoal(goal.id, { reflection, isComplete, goal: goalText });
    setEditing(false);
  }

  function handleDelete() {
    Alert.alert('Delete goal', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await deleteGoal(goal.id);
          router.back();
        },
      },
    ]);
  }

  const reflectionPrompt = isYearly
    ? 'Reflect on the year. What did you achieve? What surprised you? What will you focus on next year?'
    : 'Reflect on the month. Did you meet your goal? What did you learn? What will you focus on next month?';

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerMid}>
          <View style={[styles.headerIcon, { backgroundColor: accent + '20' }]}>
            <DisciplineIcon discipline={goal.discipline} size={16} color={accent} />
          </View>
          <View>
            <View style={styles.disciplineRow}>
              <Text style={[styles.headerDisc, { color: accent }]}>{config.label}</Text>
              <View style={[styles.periodPill, { backgroundColor: isYearly ? accent + '20' : colors.muted }]}>
                <Ionicons
                  name={isYearly ? 'calendar-outline' : 'calendar-number-outline'}
                  size={10}
                  color={isYearly ? accent : colors.mutedForeground}
                />
                <Text style={[styles.periodPillText, { color: isYearly ? accent : colors.mutedForeground }]}>
                  {isYearly ? 'Yearly' : 'Monthly'}
                </Text>
              </View>
            </View>
            <Text style={[styles.headerMonth, { color: colors.mutedForeground }]}>
              {formatPeriodLabel(goal.period, goal.month)}
            </Text>
          </View>
        </View>
        <View style={styles.headerActions}>
          {editing ? (
            <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: accent }]}>
              <Text style={styles.saveBtnText}>Save</Text>
            </Pressable>
          ) : (
            <>
              <Pressable onPress={() => setEditing(true)}>
                <Ionicons name="pencil-outline" size={20} color={colors.foreground} />
              </Pressable>
              <Pressable onPress={handleDelete}>
                <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              </Pressable>
            </>
          )}
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>GOAL</Text>
          {editing ? (
            <TextInput
              value={goalText}
              onChangeText={setGoalText}
              multiline
              style={[styles.editInput, { backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground }]}
            />
          ) : (
            <Text style={[styles.goalText, { color: colors.foreground }]}>{goal.goal}</Text>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>STATUS</Text>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Goal complete</Text>
            <Switch
              value={isComplete}
              onValueChange={v => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsComplete(v);
                if (!editing) updateGoal(goal.id, { isComplete: v });
              }}
              trackColor={{ true: '#22c55e' }}
              thumbColor={isComplete ? '#fff' : colors.mutedForeground}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>
            {isYearly ? 'YEARLY REFLECTION' : 'MONTHLY REFLECTION'}
          </Text>
          <TextInput
            value={reflection}
            onChangeText={v => {
              setReflection(v);
              if (!editing) setEditing(true);
            }}
            placeholder={reflectionPrompt}
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[styles.reflectionInput, {
              backgroundColor: colors.muted,
              borderColor: colors.input,
              color: colors.foreground,
            }]}
          />
          {(reflection !== goal.reflection || isComplete !== goal.isComplete) && !editing && (
            <Pressable onPress={save} style={[styles.saveInline, { backgroundColor: accent }]}>
              <Text style={styles.saveBtnText}>Save reflection</Text>
            </Pressable>
          )}
        </View>

        {linkedSessions.length > 0 && (
          <>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.mutedForeground }]}>
                SESSIONS {isYearly ? 'THIS YEAR' : 'THIS MONTH'} ({linkedSessions.length})
              </Text>
              {linkedSessions.map(s => (
                <SessionCard key={s.id} session={s} onPress={() => router.push(`/session/${s.id}`)} />
              ))}
            </View>
          </>
        )}

        {linkedSessions.length === 0 && (
          <View style={[styles.emptySession, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No {config.label.toLowerCase()} sessions logged {isYearly ? 'this year' : 'this month'} yet
            </Text>
            <Pressable
              onPress={() => router.push('/new-session')}
              style={[styles.logBtn, { backgroundColor: accent }]}
            >
              <Text style={[styles.logBtnText, { color: '#fff' }]}>Log a session</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      </KeyboardAvoidingView>
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
  headerMid: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  headerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  disciplineRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerDisc: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  periodPillText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  headerMonth: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  scroll: { padding: 20 },
  section: { gap: 12 },
  label: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  goalText: { fontSize: 17, fontFamily: 'Inter_500Medium', lineHeight: 26 },
  editInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  divider: { height: 1, marginVertical: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  toggleLabel: { fontSize: 15, fontFamily: 'Inter_500Medium' },
  reflectionInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 120,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  saveInline: { alignSelf: 'flex-end', paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, alignItems: 'center' },
  emptySession: { borderRadius: 12, borderWidth: 1, padding: 20, alignItems: 'center', gap: 12, marginTop: 20 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  logBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, alignItems: 'center' },
  logBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centeredText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});
