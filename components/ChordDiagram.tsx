import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ChordDiagramData } from '@/types';

const FRETS = 5;
const STRINGS = 6;
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

const COMMON_CHORDS: ChordDiagramData[] = [
  { id: 'C', name: 'C', strings: [-1, 3, 2, 0, 1, 0] },
  { id: 'G', name: 'G', strings: [3, 2, 0, 0, 3, 3] },
  { id: 'D', name: 'D', strings: [-1, -1, 0, 2, 3, 2] },
  { id: 'A', name: 'A', strings: [-1, 0, 2, 2, 2, 0] },
  { id: 'E', name: 'E', strings: [0, 2, 2, 1, 0, 0] },
  { id: 'Am', name: 'Am', strings: [-1, 0, 2, 2, 1, 0] },
  { id: 'Em', name: 'Em', strings: [0, 2, 2, 0, 0, 0] },
  { id: 'Dm', name: 'Dm', strings: [-1, -1, 0, 2, 3, 1] },
  { id: 'F', name: 'F', strings: [1, 1, 2, 3, 3, 1] },
];

interface ChordDiagramProps {
  chords: ChordDiagramData[];
  onChange: (chords: ChordDiagramData[]) => void;
}

interface SingleDiagramProps {
  chord: ChordDiagramData;
  onRemove: () => void;
  onUpdate: (c: ChordDiagramData) => void;
}

function genId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function SingleDiagram({ chord, onRemove, onUpdate }: SingleDiagramProps) {
  const colors = useColors();
  const accentColor = colors.guitar;

  function toggle(strIdx: number, fret: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const current = chord.strings[strIdx];
    const next = [...chord.strings];
    if (current === fret) {
      next[strIdx] = 0;
    } else {
      next[strIdx] = fret;
    }
    onUpdate({ ...chord, strings: next });
  }

  function cycleOpen(strIdx: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...chord.strings];
    const current = next[strIdx];
    if (current > 0) {
      next[strIdx] = 0;
    } else if (current === 0) {
      next[strIdx] = -1;
    } else {
      next[strIdx] = 0;
    }
    onUpdate({ ...chord, strings: next });
  }

  const CELL = 26;
  const LEFT = 28;

  return (
    <View style={[styles.diagram, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.diagHeader}>
        <TextInput
          value={chord.name}
          onChangeText={t => onUpdate({ ...chord, name: t })}
          style={[styles.chordName, { color: colors.foreground, borderBottomColor: colors.border }]}
          placeholder="Chord name"
          placeholderTextColor={colors.mutedForeground}
        />
        <Pressable onPress={onRemove}>
          <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View style={{ marginTop: 8 }}>
        <View style={[styles.headerRow, { paddingLeft: LEFT }]}>
          {chord.strings.map((val, i) => (
            <Pressable key={i} onPress={() => cycleOpen(i)} style={[styles.cell, { width: CELL }]}>
              <Text style={[styles.openMute, { color: val === -1 ? colors.destructive : val === 0 ? accentColor : 'transparent' }]}>
                {val === -1 ? 'X' : 'O'}
              </Text>
            </Pressable>
          ))}
        </View>

        {Array.from({ length: FRETS }).map((_, fret) => (
          <View key={fret} style={[styles.fretRow, { borderTopColor: fret === 0 ? colors.foreground : colors.border }]}>
            <Text style={[styles.fretLabel, { color: colors.mutedForeground, width: LEFT - 6 }]}>{fret + 1}</Text>
            {chord.strings.map((val, strIdx) => {
              const active = val === fret + 1;
              return (
                <Pressable
                  key={strIdx}
                  onPress={() => toggle(strIdx, fret + 1)}
                  style={[styles.cell, { width: CELL, height: CELL }]}
                >
                  {active ? (
                    <View style={[styles.finger, { backgroundColor: accentColor }]} />
                  ) : (
                    <View style={[styles.stringLine, { backgroundColor: colors.border }]} />
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={[styles.headerRow, { paddingLeft: LEFT }]}>
          {STRING_LABELS.map((label, i) => (
            <Text key={i} style={[styles.stringLabel, { color: colors.mutedForeground, width: CELL }]}>
              {label}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function ChordDiagram({ chords, onChange }: ChordDiagramProps) {
  const colors = useColors();
  const accentColor = colors.guitar;

  function addBlank() {
    onChange([...chords, { id: genId(), name: '', strings: [0, 0, 0, 0, 0, 0] }]);
  }

  function addPreset(preset: ChordDiagramData) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChange([...chords, { ...preset, id: genId() }]);
  }

  function remove(id: string) {
    onChange(chords.filter(c => c.id !== id));
  }

  function update(id: string, updated: ChordDiagramData) {
    onChange(chords.map(c => c.id === id ? updated : c));
  }

  return (
    <View>
      <View style={styles.presetsLabel}>
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Common chords</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presets}>
        {COMMON_CHORDS.map(c => (
          <Pressable
            key={c.id}
            onPress={() => addPreset(c)}
            style={[styles.presetChip, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}
          >
            <Text style={[styles.presetLabel, { color: accentColor }]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {chords.map(c => (
        <SingleDiagram key={c.id} chord={c} onRemove={() => remove(c.id)} onUpdate={u => update(c.id, u)} />
      ))}

      <Pressable
        onPress={addBlank}
        style={[styles.addBtn, { borderColor: accentColor, backgroundColor: accentColor + '10' }]}
      >
        <Ionicons name="add" size={18} color={accentColor} />
        <Text style={[styles.addText, { color: accentColor }]}>Add chord diagram</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  presetsLabel: { marginBottom: 4 },
  sectionLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  presets: { marginBottom: 12 },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  presetLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  diagram: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  diagHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chordName: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    borderBottomWidth: 1,
    paddingBottom: 2,
    minWidth: 80,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  openMute: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  fretRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  fretLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    textAlign: 'right',
  },
  finger: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  stringLine: {
    width: 1,
    height: '100%',
  },
  stringLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  addBtn: {
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
  addText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
