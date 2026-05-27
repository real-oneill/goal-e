import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';

interface RatingRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
  color?: string;
}

export default function RatingRow({ label, value, onChange, max = 5, color }: RatingRowProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={styles.dots}>
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < value;
          return (
            <Pressable
              key={i}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onChange(i + 1);
              }}
              style={[
                styles.dot,
                {
                  backgroundColor: filled ? accentColor : colors.border,
                  borderColor: filled ? accentColor : colors.border,
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.val, { color: accentColor }]}>{value}/{max}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  val: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    width: 28,
    textAlign: 'right',
  },
});
