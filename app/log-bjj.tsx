import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import RatingRow from '@/components/RatingRow';
import TagInput from '@/components/TagInput';
import DisciplineIcon from '@/components/DisciplineIcon';
import { BJJDetails } from '@/types';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={sectionStyles.header}>
      <View style={[sectionStyles.line, { backgroundColor: color }]} />
      <Text style={[sectionStyles.title, { color }]}>{title}</Text>
    </View>
  );
}
const sectionStyles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  line: { width: 3, height: 16, borderRadius: 2 },
  title: { fontSize: 13, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 1 },
});

function FieldLabel({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 6 }}>{label}</Text>;
}

function StyledInput({ value, onChange, placeholder, multiline, colors, style }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
  colors: ReturnType<typeof useColors>; style?: object;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      multiline={multiline}
      style={[{
        backgroundColor: colors.muted,
        borderWidth: 1,
        borderColor: colors.input,
        borderRadius: 10,
        padding: 12,
        fontSize: 14,
        fontFamily: 'Inter_400Regular',
        color: colors.foreground,
        minHeight: multiline ? 80 : undefined,
        textAlignVertical: multiline ? 'top' : 'center',
      }, style]}
    />
  );
}

function NumericPair({
  leftLabel, leftValue, leftOnChange, leftPlaceholder,
  rightLabel, rightValue, rightOnChange, rightPlaceholder,
  colors,
}: {
  leftLabel: string; leftValue: string; leftOnChange: (v: string) => void; leftPlaceholder?: string;
  rightLabel: string; rightValue: string; rightOnChange: (v: string) => void; rightPlaceholder?: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ flex: 1 }}>
        <FieldLabel label={leftLabel} colors={colors} />
        <TextInput
          value={leftValue}
          onChangeText={leftOnChange}
          keyboardType="numeric"
          placeholder={leftPlaceholder ?? '0'}
          placeholderTextColor={colors.mutedForeground}
          style={[numStyles.input, { backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground }]}
        />
      </View>
      <View style={{ flex: 1 }}>
        <FieldLabel label={rightLabel} colors={colors} />
        <TextInput
          value={rightValue}
          onChangeText={rightOnChange}
          keyboardType="numeric"
          placeholder={rightPlaceholder ?? '0'}
          placeholderTextColor={colors.mutedForeground}
          style={[numStyles.input, { backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground }]}
        />
      </View>
    </View>
  );
}
const numStyles = StyleSheet.create({
  input: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center',
  },
});

export default function LogBJJScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const accent = colors.bjj;
  const { addSession, goals } = useJournal();

  const [date] = useState(today());
  const [objective, setObjective] = useState('');
  const [actualWork, setActualWork] = useState('');
  const [notes, setNotes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [metDailyObjective, setMetDailyObjective] = useState(false);

  // Readiness
  const [energyLevel, setEnergyLevel] = useState(3);
  const [motivationLevel, setMotivationLevel] = useState(3);
  const [sleepQuality, setSleepQuality] = useState(3);
  const [dietQuality, setDietQuality] = useState(3);
  const [physicalCondition, setPhysicalCondition] = useState(3);

  const [sessionDurationMinutes, setSessionDurationMinutes] = useState('');

  // Training
  const [techniques, setTechniques] = useState<string[]>([]);
  const [sparringRounds, setSparringRounds] = useState('');
  const [sparringMinutes, setSparringMinutes] = useState('');
  const [drillingRounds, setDrillingRounds] = useState('');
  const [drillingMinutes, setDrillingMinutes] = useState('');
  const [metMonthlyObjective, setMetMonthlyObjective] = useState(false);
  const [keyTakeaways, setKeyTakeaways] = useState('');

  const month = date.slice(0, 7);
  const monthGoal = goals.find(g => g.discipline === 'bjj' && g.month === month);

  async function save() {
    if (!objective.trim()) {
      Alert.alert('Add objective', 'What did you want to work on this session?');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const bjj: BJJDetails = {
      energyLevel, motivationLevel, sleepQuality, dietQuality, physicalCondition,
      sessionDurationMinutes: parseInt(sessionDurationMinutes) || 0,
      techniques,
      sparringRounds: parseInt(sparringRounds) || 0,
      sparringMinutes: parseInt(sparringMinutes) || 0,
      drillingRounds: parseInt(drillingRounds) || 0,
      drillingMinutes: parseInt(drillingMinutes) || 0,
      metMonthlyObjective,
      keyTakeaways,
    };

    await addSession({ discipline: 'bjj', date, objective, actualWork, notes, improvements, metDailyObjective, bjj });
    router.back();
    router.back();
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: accent + '20' }]}>
            <DisciplineIcon discipline="bjj" size={18} color={accent} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Jiu Jitsu</Text>
        </View>
        <Pressable onPress={save} style={[styles.saveBtn, { backgroundColor: accent }]}>
          <Text style={[styles.saveBtnText, { color: '#fff' }]}>Save</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.dateLabel, { color: colors.mutedForeground }]}>{date}</Text>

        {monthGoal && (
          <View style={[styles.goalBanner, { backgroundColor: accent + '15', borderColor: accent + '40' }]}>
            <Ionicons name="trophy-outline" size={14} color={accent} />
            <Text style={[styles.goalBannerText, { color: accent }]} numberOfLines={2}>
              Monthly goal: {monthGoal.goal}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="Session" color={accent} />
          <FieldLabel label="What do you want to work on?" colors={colors} />
          <StyledInput value={objective} onChange={setObjective} placeholder="Today's objective..." multiline colors={colors} />
          <FieldLabel label="What did you actually work on?" colors={colors} />
          <StyledInput value={actualWork} onChange={setActualWork} placeholder="What happened in the session..." multiline colors={colors} />
          <FieldLabel label="Notes" colors={colors} />
          <StyledInput value={notes} onChange={setNotes} placeholder="Any observations, details..." multiline colors={colors} />
          <FieldLabel label="What to improve next time?" colors={colors} />
          <StyledInput value={improvements} onChange={setImprovements} placeholder="Focus areas for next session..." multiline colors={colors} />
          <View style={styles.durationRow}>
            <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>Session duration</Text>
            <View style={styles.durationRight}>
              <TextInput
                value={sessionDurationMinutes}
                onChangeText={setSessionDurationMinutes}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                style={[numStyles.input, { backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground, width: 64 }]}
              />
              <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>min</Text>
            </View>
          </View>
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Met daily objective</Text>
            <Switch
              value={metDailyObjective}
              onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMetDailyObjective(v); }}
              trackColor={{ true: accent }}
              thumbColor={metDailyObjective ? '#fff' : colors.mutedForeground}
            />
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <SectionHeader title="Readiness" color={accent} />
          <RatingRow label="Energy" value={energyLevel} onChange={setEnergyLevel} color={accent} />
          <RatingRow label="Motivation" value={motivationLevel} onChange={setMotivationLevel} color={accent} />
          <RatingRow label="Sleep quality" value={sleepQuality} onChange={setSleepQuality} color={accent} />
          <RatingRow label="Diet quality" value={dietQuality} onChange={setDietQuality} color={accent} />
          <RatingRow label="Physical condition" value={physicalCondition} onChange={setPhysicalCondition} color={accent} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <SectionHeader title="Training" color={accent} />
          <TagInput label="Techniques worked on" tags={techniques} onChange={setTechniques} color={accent}
            placeholder="e.g. triangle choke, guard pass..." />

          <View style={[styles.roundsGroup, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.roundsGroupLabel, { color: colors.mutedForeground }]}>Sparring</Text>
            <NumericPair
              leftLabel="Rounds" leftValue={sparringRounds} leftOnChange={setSparringRounds}
              rightLabel="Minutes" rightValue={sparringMinutes} rightOnChange={setSparringMinutes}
              colors={colors}
            />
          </View>

          <View style={[styles.roundsGroup, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.roundsGroupLabel, { color: colors.mutedForeground }]}>Drilling</Text>
            <NumericPair
              leftLabel="Rounds" leftValue={drillingRounds} leftOnChange={setDrillingRounds}
              rightLabel="Minutes" rightValue={drillingMinutes} rightOnChange={setDrillingMinutes}
              colors={colors}
            />
          </View>

          {monthGoal && (
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.foreground }]}>Met monthly objective</Text>
              <Switch
                value={metMonthlyObjective}
                onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMetMonthlyObjective(v); }}
                trackColor={{ true: accent }}
                thumbColor={metMonthlyObjective ? '#fff' : colors.mutedForeground}
              />
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <SectionHeader title="Takeaways" color={accent} />
          <StyledInput value={keyTakeaways} onChange={setKeyTakeaways} placeholder="Key insights from this session..." multiline colors={colors} />
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 20, gap: 0 },
  dateLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  goalBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 20,
  },
  goalBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  section: { gap: 12 },
  divider: { height: 1, marginVertical: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 4 },
  toggleLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  durationRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roundsGroup: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  roundsGroupLabel: { fontSize: 12, fontFamily: 'Inter_700Bold', textTransform: 'uppercase', letterSpacing: 0.8 },
});
