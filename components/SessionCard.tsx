import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Session } from '@/types';
import { getDisciplineConfig } from './DisciplineCard';
import DisciplineIcon from './DisciplineIcon';

interface SessionCardProps {
  session: Session;
  onPress?: () => void;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getSessionSummary(session: Session): string {
  if (session.discipline === 'bjj' && session.bjj) {
    const r = session.bjj.sparringRounds;
    const t = session.bjj.techniques.length;
    return `${r} round${r !== 1 ? 's' : ''} · ${t} technique${t !== 1 ? 's' : ''}`;
  }
  if (session.discipline === 'guitar' && session.guitar) {
    const s = session.guitar.scalesPracticed.length;
    const songs = session.guitar.songsWorkedOn.length;
    return `${s} scale${s !== 1 ? 's' : ''} · ${songs} song${songs !== 1 ? 's' : ''}`;
  }
  if (session.discipline === 'workout' && session.workout) {
    const e = session.workout.exercises.length;
    const d = session.workout.sessionDurationMinutes;
    return `${e} exercise${e !== 1 ? 's' : ''} · ${d} min`;
  }
  return session.objective;
}

export default function SessionCard({ session, onPress }: SessionCardProps) {
  const colors = useColors();
  const config = getDisciplineConfig(session.discipline);
  const accentColor = colors[config.colorKey];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.75 : 1 },
      ]}
    >
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
      <View style={styles.body}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
              <DisciplineIcon discipline={session.discipline} size={15} color={accentColor} />
            </View>
            <Text style={[styles.discipline, { color: accentColor }]}>{config.label}</Text>
            {session.metDailyObjective && (
              <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
                <Ionicons name="checkmark" size={11} color="#22c55e" />
                <Text style={[styles.badgeText, { color: '#22c55e' }]}>Done</Text>
              </View>
            )}
          </View>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>{formatDate(session.date)}</Text>
        </View>
        <Text style={[styles.objective, { color: colors.foreground }]} numberOfLines={1}>
          {session.objective}
        </Text>
        <Text style={[styles.summary, { color: colors.mutedForeground }]}>
          {getSessionSummary(session)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 10,
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discipline: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  date: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  objective: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  summary: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
