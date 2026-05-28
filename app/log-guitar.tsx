import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useJournal } from '@/context/JournalContext';
import TagInput from '@/components/TagInput';
import ChordDiagram from '@/components/ChordDiagram';
import { ChordDiagramData, GuitarDetails } from '@/types';
import { TextInput } from 'react-native';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function SectionHeader({ title, color }: { title: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
      <View style={{ width: 3, height: 16, borderRadius: 2, backgroundColor: color }} />
      <Text style={{ fontSize: 13, fontFamily: 'Inter_700Bold', color, textTransform: 'uppercase', letterSpacing: 1 }}>{title}</Text>
    </View>
  );
}

function FieldLabel({ label, colors }: { label: string; colors: ReturnType<typeof useColors> }) {
  return <Text style={{ fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginBottom: 6 }}>{label}</Text>;
}

function StyledInput({ value, onChange, placeholder, multiline, colors }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.mutedForeground}
      multiline={multiline}
      style={{
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
      }}
    />
  );
}

export default function LogGuitarScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const accent = colors.guitar;
  const { addSession, updateSession, sessions, goals } = useJournal();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

  const isEditing = !!sessionId;
  const existing = isEditing ? sessions.find(s => s.id === sessionId) : undefined;

  const [date, setDate] = useState(today());
  const [objective, setObjective] = useState('');
  const [actualWork, setActualWork] = useState('');
  const [notes, setNotes] = useState('');
  const [improvements, setImprovements] = useState('');
  const [metDailyObjective, setMetDailyObjective] = useState(false);

  const [sessionDurationMinutes, setSessionDurationMinutes] = useState('');
  const [scalesPracticed, setScalesPracticed] = useState<string[]>([]);
  const [songsWorkedOn, setSongsWorkedOn] = useState<string[]>([]);
  const [chordsLearned, setChordsLearned] = useState<string[]>([]);
  const [chordDiagrams, setChordDiagrams] = useState<ChordDiagramData[]>([]);
  const [keyTakeaways, setKeyTakeaways] = useState('');

  useEffect(() => {
    if (existing?.guitar) {
      setDate(existing.date);
      setObjective(existing.objective);
      setActualWork(existing.actualWork);
      setNotes(existing.notes);
      setImprovements(existing.improvements);
      setMetDailyObjective(existing.metDailyObjective);
      setSessionDurationMinutes(existing.guitar.sessionDurationMinutes ? String(existing.guitar.sessionDurationMinutes) : '');
      setScalesPracticed(existing.guitar.scalesPracticed);
      setSongsWorkedOn(existing.guitar.songsWorkedOn);
      setChordsLearned(existing.guitar.chordsLearned);
      setChordDiagrams(existing.guitar.chordDiagrams);
      setKeyTakeaways(existing.guitar.keyTakeaways);
    }
  }, [sessionId]);

  const month = date.slice(0, 7);
  const monthGoal = goals.find(g => g.discipline === 'guitar' && g.month === month);

  async function save() {
    if (!objective.trim()) {
      Alert.alert('Add objective', 'What did you want to practice this session?');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const guitar: GuitarDetails = {
      sessionDurationMinutes: parseInt(sessionDurationMinutes) || 0,
      scalesPracticed,
      songsWorkedOn,
      chordsLearned,
      chordDiagrams,
      keyTakeaways,
    };

    if (isEditing && sessionId) {
      await updateSession(sessionId, { objective, actualWork, notes, improvements, metDailyObjective, guitar });
      router.back();
    } else {
      await addSession({ discipline: 'guitar', date, objective, actualWork, notes, improvements, metDailyObjective, guitar });
      router.back();
      router.back();
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerTitle}>
          <View style={[styles.headerIcon, { backgroundColor: accent + '20' }]}>
            <Ionicons name="musical-notes-outline" size={18} color={accent} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {isEditing ? 'Edit Session' : 'Guitar'}
          </Text>
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
          <StyledInput value={objective} onChange={setObjective} placeholder="Today's practice focus..." multiline colors={colors} />
          <FieldLabel label="What did you actually work on?" colors={colors} />
          <StyledInput value={actualWork} onChange={setActualWork} placeholder="What happened in the practice..." multiline colors={colors} />
          <FieldLabel label="Notes" colors={colors} />
          <StyledInput value={notes} onChange={setNotes} placeholder="Observations, discoveries..." multiline colors={colors} />
          <FieldLabel label="What to improve next time?" colors={colors} />
          <StyledInput value={improvements} onChange={setImprovements} placeholder="What to focus on next session..." multiline colors={colors} />

          <View style={styles.durationRow}>
            <Text style={[styles.durationLabel, { color: colors.mutedForeground }]}>Session duration</Text>
            <View style={styles.durationRight}>
              <TextInput
                value={sessionDurationMinutes}
                onChangeText={setSessionDurationMinutes}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                style={{
                  borderWidth: 1, borderRadius: 10,
                  paddingHorizontal: 14, paddingVertical: 10,
                  fontSize: 16, fontFamily: 'Inter_600SemiBold', textAlign: 'center',
                  width: 64,
                  backgroundColor: colors.muted, borderColor: colors.input, color: colors.foreground,
                }}
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
          <SectionHeader title="Practice" color={accent} />
          <TagInput label="Scales practiced" tags={scalesPracticed} onChange={setScalesPracticed} color={accent}
            placeholder="e.g. pentatonic minor, major scale..." />
          <TagInput label="Songs worked on" tags={songsWorkedOn} onChange={setSongsWorkedOn} color={accent}
            placeholder="e.g. Blackbird, Wonderwall..." />
          <TagInput label="Chords learned" tags={chordsLearned} onChange={setChordsLearned} color={accent}
            placeholder="e.g. Bm, F#m..." />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <SectionHeader title="Chord Diagrams" color={accent} />
          <ChordDiagram chords={chordDiagrams} onChange={setChordDiagrams} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.section}>
          <SectionHeader title="Takeaways" color={accent} />
          <StyledInput value={keyTakeaways} onChange={setKeyTakeaways} placeholder="Key insights from this practice..." multiline colors={colors} />
        </View>
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
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  saveBtn: { paddingVertical: 8, paddingHorizontal: 18, borderRadius: 20, alignItems: 'center' },
  saveBtnText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scroll: { padding: 20 },
  dateLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', marginBottom: 12 },
  goalBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
  },
  goalBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  section: { gap: 12 },
  divider: { height: 1, marginVertical: 20 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  durationRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  durationLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  durationRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
