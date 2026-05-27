import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { MonthlyGoal } from '@/types';
import { getDisciplineConfig } from './DisciplineCard';
import DisciplineIcon from './DisciplineIcon';

interface GoalCardProps {
  goal: MonthlyGoal;
  sessionCount?: number;
  onPress?: () => void;
}

function formatPeriodLabel(goal: MonthlyGoal) {
  if (goal.period === 'yearly') {
    return goal.month;
  }
  const [year, month] = goal.month.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function GoalCard({ goal, sessionCount, onPress }: GoalCardProps) {
  const colors = useColors();
  const config = getDisciplineConfig(goal.discipline);
  const accentColor = colors[config.colorKey];
  const isYearly = goal.period === 'yearly';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isYearly ? accentColor + '50' : colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.left}>
          <View style={[styles.iconWrap, { backgroundColor: accentColor + '20' }]}>
            <DisciplineIcon discipline={goal.discipline} size={16} color={accentColor} />
          </View>
          <View>
            <Text style={[styles.discipline, { color: accentColor }]}>{config.label}</Text>
            <Text style={[styles.month, { color: colors.mutedForeground }]}>{formatPeriodLabel(goal)}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <View style={[styles.periodBadge, { backgroundColor: isYearly ? accentColor + '20' : colors.muted }]}>
            <Ionicons name={isYearly ? 'calendar-outline' : 'calendar-number-outline'} size={11} color={isYearly ? accentColor : colors.mutedForeground} />
            <Text style={[styles.periodText, { color: isYearly ? accentColor : colors.mutedForeground }]}>
              {isYearly ? 'Yearly' : 'Monthly'}
            </Text>
          </View>
          {goal.isComplete && (
            <View style={[styles.badge, { backgroundColor: '#22c55e20' }]}>
              <Ionicons name="trophy-outline" size={12} color="#22c55e" />
              <Text style={[styles.badgeText, { color: '#22c55e' }]}>Complete</Text>
            </View>
          )}
          {sessionCount !== undefined && (
            <Text style={[styles.sessionCount, { color: colors.mutedForeground }]}>
              {sessionCount} sessions
            </Text>
          )}
        </View>
      </View>
      <Text style={[styles.goal, { color: colors.foreground }]} numberOfLines={2}>
        {goal.goal}
      </Text>
      {goal.reflection ? (
        <Text style={[styles.reflection, { color: colors.mutedForeground }]} numberOfLines={1}>
          {goal.reflection}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discipline: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  month: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  periodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  periodText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  sessionCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  goal: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    lineHeight: 22,
  },
  reflection: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    fontStyle: 'italic',
  },
});
