import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Discipline } from '@/types';
import DisciplineIcon from './DisciplineIcon';

interface DisciplineCardProps {
  discipline: Discipline;
  selected?: boolean;
  onPress?: () => void;
  sessionCount?: number;
  compact?: boolean;
}

const DISCIPLINE_CONFIG: Record<Discipline, { label: string; icon: string; colorKey: 'bjj' | 'guitar' | 'workout' }> = {
  bjj: { label: 'Jiu Jitsu', icon: 'bjj', colorKey: 'bjj' },
  guitar: { label: 'Guitar', icon: 'musical-notes-outline', colorKey: 'guitar' },
  workout: { label: 'Workout', icon: 'barbell-outline', colorKey: 'workout' },
};

export function getDisciplineConfig(discipline: Discipline) {
  return DISCIPLINE_CONFIG[discipline];
}

export default function DisciplineCard({ discipline, selected, onPress, sessionCount, compact }: DisciplineCardProps) {
  const colors = useColors();
  const config = DISCIPLINE_CONFIG[discipline];
  const accentColor = colors[config.colorKey];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        compact ? styles.compact : styles.full,
        {
          backgroundColor: selected ? accentColor + '22' : colors.card,
          borderColor: selected ? accentColor : colors.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
        <DisciplineIcon discipline={discipline} size={compact ? 22 : 28} color={accentColor} />
      </View>
      {!compact && (
        <View style={styles.info}>
          <Text style={[styles.label, { color: colors.foreground }]}>{config.label}</Text>
          {sessionCount !== undefined && (
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {sessionCount} session{sessionCount !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}
      {compact && (
        <Text style={[styles.compactLabel, { color: selected ? accentColor : colors.foreground }]}>
          {config.label}
        </Text>
      )}
      {selected && !compact && (
        <Ionicons name="checkmark-circle" size={20} color={accentColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  full: {
    padding: 16,
    marginBottom: 10,
  },
  compact: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  count: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  compactLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
});
