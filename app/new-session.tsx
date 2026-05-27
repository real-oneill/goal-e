import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { getDisciplineConfig } from '@/components/DisciplineCard';
import DisciplineIcon from '@/components/DisciplineIcon';
import { Discipline } from '@/types';

const DISCIPLINES: { discipline: Discipline; description: string }[] = [
  { discipline: 'bjj', description: 'Log techniques, sparring rounds, check-in vitals' },
  { discipline: 'workout', description: 'Track exercises, sets, reps, and weight' },
  { discipline: 'guitar', description: 'Log scales, songs, chords, and diagrams' },
];

export default function NewSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  function choose(discipline: Discipline) {
    router.push(`/log-${discipline}`);
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: 16 }]}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>New Session</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          What are you training today?
        </Text>

        {DISCIPLINES.map(({ discipline, description }) => {
          const config = getDisciplineConfig(discipline);
          const accent = colors[config.colorKey];
          return (
            <Pressable
              key={discipline}
              onPress={() => choose(discipline)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: accent + '20' }]}>
                <DisciplineIcon discipline={discipline} size={32} color={accent} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>{config.label}</Text>
                <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
            </Pressable>
          );
        })}
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
    paddingBottom: 16,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  content: { padding: 20, gap: 14 },
  subtitle: { fontSize: 15, fontFamily: 'Inter_400Regular', marginBottom: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  cardDesc: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },
});
