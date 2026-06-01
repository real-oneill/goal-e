import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { ChordDiagramData } from '@/types';

const FRETS = 5;
const STRINGS = 6;
const MAX_FRET = 24;
const STRING_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

const COMMON_CHORDS: ChordDiagramData[] = [
  { id: 'C',  name: 'C',  strings: [-1, 3, 2, 0, 1, 0],  startFret: 1 },
  { id: 'G',  name: 'G',  strings: [3, 2, 0, 0, 3, 3],   startFret: 1 },
  { id: 'D',  name: 'D',  strings: [-1, -1, 0, 2, 3, 2], startFret: 1 },
  { id: 'A',  name: 'A',  strings: [-1, 0, 2, 2, 2, 0],  startFret: 1 },
  { id: 'E',  name: 'E',  strings: [0, 2, 2, 1, 0, 0],   startFret: 1 },
  { id: 'Am', name: 'Am', strings: [-1, 0, 2, 2, 1, 0],  startFret: 1 },
  { id: 'Em', name: 'Em', strings: [0, 2, 2, 0, 0, 0],   startFret: 1 },
  { id: 'Dm', name: 'Dm', strings: [-1, -1, 0, 2, 3, 1], startFret: 1 },
  { id: 'F',  name: 'F',  strings: [1, 1, 2, 3, 3, 1],   startFret: 1 },
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
  const startFret = chord.startFret ?? 1;
  const endFret = startFret + FRETS - 1;

  function shiftNeck(delta: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = Math.max(1, Math.min(MAX_FRET - FRETS + 1, startFret + delta));
    if (next === startFret) return;
    // Clear any finger positions that fall outside the new window
    const newStrings = chord.strings.map(v => {
      if (v <= 0) return v;
      if (v < next || v > next + FRETS - 1) return 0;
      return v;
    });
    onUpdate({ ...chord, startFret: next, strings: newStrings });
  }

  function toggle(strIdx: number, fret: number) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const next = [...chord.strings];
    next[strIdx] = next[strIdx] === fret ? 0 : fret;
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
  const LEFT = 36;

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
        {/* Open/mute row */}
        <View style={[styles.headerRow, { paddingLeft: LEFT }]}>
          {chord.strings.map((val, i) => (
            <Pressable key={i} onPress={() => cycleOpen(i)} style={[styles.cell, { width: CELL }]}>
              <Text style={[styles.openMute, { color: val === -1 ? colors.destructive : val === 0 ? accentColor : 'transparent' }]}>
                {val === -1 ? 'X' : 'O'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Fret rows */}
        {Array.from({ length: FRETS }).map((_, i) => {
          const fretNum = startFret + i;
          return (
            <View
              key={fretNum}
              style={[
                styles.fretRow,
                { borderTopColor: i === 0 && startFret === 1 ? colors.foreground : colors.border,
                  borderTopWidth: i === 0 && startFret === 1 ? 3 : 1 }
              ]}
            >
              <Text style={[styles.fretLabel, { color: colors.mutedForeground, width: LEFT - 6 }]}>
                {fretNum}
              </Text>
              {chord.strings.map((val, strIdx) => {
                const active = val === fretNum;
                return (
                  <Pressable
                    key={strIdx}
                    onPress={() => toggle(strIdx, fretNum)}
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
          );
        })}

        {/* String labels + neck nav */}
        <View style={[styles.bottomRow, { paddingLeft: LEFT }]}>
          <View style={styles.stringLabels}>
            {STRING_LABELS.map((label, i) => (
              <Text key={i} style={[styles.stringLabel, { color: colors.mutedForeground, width: CELL }]}>
                {label}
              </Text>
            ))}
          </View>
          <View style={styles.neckNav}>
            <Pressable
              onPress={() => shiftNeck(-1)}
              disabled={startFret <= 1}
              style={[styles.navBtn, { opacity: startFret <= 1 ? 0.3 : 1, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-up" size={14} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.posLabel, { color: colors.mutedForeground }]}>
              {startFret === 1 ? 'nut' : `fr ${startFret}`}
            </Text>
            <Pressable
              onPress={() => shiftNeck(1)}
              disabled={endFret >= MAX_FRET}
              style={[styles.navBtn, { opacity: endFret >= MAX_FRET ? 0.3 : 1, borderColor: colors.border }]}
            >
              <Ionicons name="chevron-down" size={14} color={colors.foreground} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function ChordDiagram({ chords, onChange }: ChordDiagramProps) {
  const colors = useColors();
  const accentColor = colors.guitar;

  function addBlank() {
    onChange([...chords, { id: genId(), name: '', strings: [0, 0, 0, 0, 0, 0], startFret: 1 }]);
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stringLabels: {
    flexDirection: 'row',
  },
  stringLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
  },
  neckNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navBtn: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 2,
  },
  posLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    minWidth: 32,
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
