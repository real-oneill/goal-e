import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import DisciplineCard, { getDisciplineConfig } from '@/components/DisciplineCard';
import { Discipline } from '@/types';

const DISCIPLINES: Discipline[] = ['bjj', 'workout', 'guitar'];

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}
function getCurrentYear() {
  return new Date().getFullYear().toString();
}

function formatMonth(m: string) {
  const [y, mo] = m.split('-');
  return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function NewGoalScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addGoal, goals } = useJournal();

  const [discipline, setDiscipline] = useState<Discipline>('bjj');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(getCurrentYear());
  const [goal, setGoal] = useState('');

  const config = getDisciplineConfig(discipline);
  const accent = colors[config.colorKey];

  const periodKey = period === 'monthly' ? month : year;
  const existing = goals.find(g => g.discipline === discipline && g.month === periodKey && g.period === period);

  async function save() {
    if (!goal.trim()) {
      Alert.alert('Add a goal', 'What do you want to achieve?');
      return;
    }
    if (existing) {
      const label = period === 'monthly' ? formatMonth(month) : year;
      Alert.alert(
        'Goal exists',
        `You already have a ${config.label} ${period} goal for ${label}. Edit the existing goal instead.`,
      );
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await addGoal({ discipline, period, month: periodKey, goal: goal.trim(), reflection: '', isComplete: false });
    router.back();
  }

  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - 2 + i);
    return d.toISOString().slice(0, 7);
  });

  const years = Array.from({ length: 4 }).map((_, i) => (new Date().getFullYear() - 1 + i).toString());

  const placeholder = period === 'yearly'
    ? `What do you want to achieve in ${config.label} this year?`
    : `What do you want to achieve in ${config.label} this month?`;

  const hint = period === 'yearly'
    ? 'Think big. e.g. "Compete in my first tournament and earn a stripe"'
    : 'Be specific. e.g. "Successfully execute triangle choke from closed guard in rolling"';

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>New Goal</Text>
        <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: accent }]}>
          <Text style={styles.saveBtnText}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>DISCIPLINE</Text>
          {DISCIPLINES.map(d => (
            <DisciplineCard key={d} discipline={d} selected={discipline === d} onPress={() => setDiscipline(d)} />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PERIOD</Text>
          <View style={[styles.segmented, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            {(['monthly', 'yearly'] as const).map(p => {
              const active = period === p;
              return (
                <Pressable
                  key={p}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPeriod(p); }}
                  style={[
                    styles.segment,
                    active && { backgroundColor: accent, shadowColor: accent, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
                  ]}
                >
                  <Ionicons
                    name={p === 'yearly' ? 'calendar-outline' : 'calendar-number-outline'}
                    size={14}
                    color={active ? '#fff' : colors.mutedForeground}
                  />
                  <Text style={[styles.segmentText, { color: active ? '#fff' : colors.mutedForeground }]}>
                    {p === 'monthly' ? 'Monthly' : 'Yearly'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {period === 'monthly' ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>MONTH</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {months.map(m => {
                const active = m === month;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMonth(m)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? accent + '20' : colors.muted, borderColor: active ? accent : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? accent : colors.foreground }]}>{formatMonth(m)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>YEAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {years.map(y => {
                const active = y === year;
                return (
                  <Pressable
                    key={y}
                    onPress={() => setYear(y)}
                    style={[
                      styles.chip,
                      { backgroundColor: active ? accent + '20' : colors.muted, borderColor: active ? accent : colors.border },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? accent : colors.foreground }]}>{y}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        )}

        {existing && (
          <View style={[styles.existingBanner, { backgroundColor: colors.destructive + '15', borderColor: colors.destructive + '40' }]}>
            <Ionicons name="warning-outline" size={14} color={colors.destructive} />
            <Text style={[styles.existingText, { color: colors.destructive }]}>
              A goal already exists for this period. Edit the existing one instead.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>GOAL</Text>
          <TextInput
            value={goal}
            onChangeText={setGoal}
            placeholder={placeholder}
            placeholderTextColor={colors.mutedForeground}
            multiline
            style={[styles.goalInput, { backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground }]}
          />
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>{hint}</Text>
        </View>
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
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: '#fff' },
  scroll: { padding: 20, gap: 24 },
  section: { gap: 12 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  segmented: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  segmentText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  chipText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  existingBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  existingText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  goalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    minHeight: 100,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  hint: { fontSize: 13, fontFamily: 'Inter_400Regular', fontStyle: 'italic', lineHeight: 18 },
});
