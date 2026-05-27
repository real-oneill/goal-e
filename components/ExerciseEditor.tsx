import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { WorkoutExercise, WorkoutSet } from '@/types';

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface ExerciseEditorProps {
  exercises: WorkoutExercise[];
  onChange: (exercises: WorkoutExercise[]) => void;
}

export default function ExerciseEditor({ exercises, onChange }: ExerciseEditorProps) {
  const colors = useColors();
  const accentColor = colors.workout;

  function addExercise() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newEx: WorkoutExercise = {
      id: genId(),
      name: '',
      sets: [{ reps: 0, weight: 0, unit: 'lbs' }],
    };
    onChange([...exercises, newEx]);
  }

  function removeExercise(id: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(exercises.filter(e => e.id !== id));
  }

  function updateName(id: string, name: string) {
    onChange(exercises.map(e => e.id === id ? { ...e, name } : e));
  }

  function addSet(exId: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(exercises.map(e => {
      if (e.id !== exId) return e;
      const lastSet = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { ...lastSet }] };
    }));
  }

  function removeSet(exId: string, setIdx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange(exercises.map(e => {
      if (e.id !== exId || e.sets.length <= 1) return e;
      return { ...e, sets: e.sets.filter((_, i) => i !== setIdx) };
    }));
  }

  function updateSet(exId: string, setIdx: number, update: Partial<WorkoutSet>) {
    onChange(exercises.map(e => {
      if (e.id !== exId) return e;
      return { ...e, sets: e.sets.map((s, i) => i === setIdx ? { ...s, ...update } : s) };
    }));
  }

  return (
    <View>
      {exercises.map((ex, exIdx) => (
        <View key={ex.id} style={[styles.exCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <View style={styles.exHeader}>
            <TextInput
              value={ex.name}
              onChangeText={t => updateName(ex.id, t)}
              placeholder={`Exercise ${exIdx + 1}`}
              placeholderTextColor={colors.mutedForeground}
              style={[styles.exName, { color: colors.foreground, borderBottomColor: colors.border }]}
            />
            <Pressable onPress={() => removeExercise(ex.id)}>
              <Ionicons name="trash-outline" size={18} color={colors.destructive} />
            </Pressable>
          </View>

          <View style={styles.setHeader}>
            <Text style={[styles.setLabel, { color: colors.mutedForeground, flex: 1 }]}>Set</Text>
            <Text style={[styles.setLabel, { color: colors.mutedForeground, width: 60 }]}>Reps</Text>
            <Text style={[styles.setLabel, { color: colors.mutedForeground, width: 70 }]}>Weight</Text>
            <Text style={[styles.setLabel, { color: colors.mutedForeground, width: 36 }]}>Unit</Text>
            <View style={{ width: 24 }} />
          </View>

          {ex.sets.map((set, setIdx) => (
            <View key={setIdx} style={styles.setRow}>
              <Text style={[styles.setNum, { color: colors.mutedForeground, flex: 1 }]}>{setIdx + 1}</Text>
              <TextInput
                value={set.reps > 0 ? String(set.reps) : ''}
                onChangeText={t => updateSet(ex.id, setIdx, { reps: parseInt(t) || 0 })}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.numInput, { color: colors.foreground, borderColor: colors.input, width: 60 }]}
              />
              <TextInput
                value={set.weight > 0 ? String(set.weight) : ''}
                onChangeText={t => updateSet(ex.id, setIdx, { weight: parseFloat(t) || 0 })}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.numInput, { color: colors.foreground, borderColor: colors.input, width: 70 }]}
              />
              <Pressable
                onPress={() => updateSet(ex.id, setIdx, { unit: set.unit === 'lbs' ? 'kg' : 'lbs' })}
                style={[styles.unitBtn, { borderColor: accentColor + '60', backgroundColor: accentColor + '15' }]}
              >
                <Text style={[styles.unitText, { color: accentColor }]}>{set.unit}</Text>
              </Pressable>
              <Pressable onPress={() => removeSet(ex.id, setIdx)} style={{ width: 24, alignItems: 'center' }}>
                <Ionicons name="close" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}

          <Pressable
            onPress={() => addSet(ex.id)}
            style={[styles.addSetBtn, { borderColor: accentColor + '60' }]}
          >
            <Ionicons name="add" size={14} color={accentColor} />
            <Text style={[styles.addSetText, { color: accentColor }]}>Add set</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        onPress={addExercise}
        style={[styles.addExBtn, { borderColor: accentColor, backgroundColor: accentColor + '10' }]}
      >
        <Ionicons name="add" size={18} color={accentColor} />
        <Text style={[styles.addExText, { color: accentColor }]}>Add exercise</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  exCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  exName: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  setHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  setNum: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  numInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  unitBtn: {
    width: 36,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  unitText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addSetText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  addExText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
