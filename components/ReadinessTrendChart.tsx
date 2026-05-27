import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { Session } from '@/types';

const WIN_W = Dimensions.get('window').width;

interface Point { x: number; y: number }
type ReadingKey = 'energy' | 'sleep' | 'motivation';
interface DayData { energy: number; sleep: number; motivation: number }

interface Props {
  sessions: Session[];
  discipline: 'bjj' | 'workout';
}

function getLast30Dates(): string[] {
  const out: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

const METRICS: { key: ReadingKey; color: string; label: string }[] = [
  { key: 'energy',     color: '#ef4444', label: 'Energy' },
  { key: 'sleep',      color: '#60a5fa', label: 'Sleep' },
  { key: 'motivation', color: '#4ade80', label: 'Motivation' },
];

export default function ReadinessTrendChart({ sessions, discipline }: Props) {
  const colors = useColors();

  const chartW  = WIN_W - 72;
  const chartH  = 110;
  const padL = 22, padR = 8, padT = 6, padB = 4;
  const plotW   = chartW - padL - padR;
  const plotH   = chartH - padT - padB;

  const dates = getLast30Dates();

  const byDate: Record<string, DayData> = {};
  sessions.forEach(s => {
    const d = discipline === 'bjj' ? s.bjj : s.workout;
    if (!d) return;
    const dateKey = s.date.slice(0, 10);
    if (!byDate[dateKey]) {
      byDate[dateKey] = {
        energy:     d.energyLevel,
        sleep:      d.sleepQuality ?? 3,
        motivation: d.motivationLevel,
      };
    }
  });

  if (Object.keys(byDate).length === 0) return null;

  function yOf(v: number) {
    return padT + plotH - ((v - 1) / 4) * plotH;
  }
  function xOf(i: number) {
    return padL + (i / 29) * plotW;
  }

  function buildPolyline(key: ReadingKey): string {
    return dates
      .map((date, i) => {
        const d = byDate[date];
        if (!d) return null;
        return `${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`;
      })
      .filter(Boolean)
      .join(' ');
  }

  function buildDots(key: ReadingKey): Point[] {
    return dates
      .map((date, i) => {
        const d = byDate[date];
        if (!d) return null;
        return { x: xOf(i), y: yOf(d[key]) };
      })
      .filter((p): p is Point => p !== null);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={[styles.chartTitle, { color: colors.mutedForeground }]}>
          Readiness · last 30 days
        </Text>
        <View style={styles.legend}>
          {METRICS.map(m => (
            <View key={m.key} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: m.color }]} />
              <Text style={[styles.legendText, { color: colors.mutedForeground }]}>{m.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Svg width={chartW} height={chartH}>
        {/* Horizontal gridlines */}
        {[1, 2, 3, 4, 5].map(v => (
          <Line
            key={v}
            x1={padL} y1={yOf(v)} x2={chartW - padR} y2={yOf(v)}
            stroke={colors.border}
            strokeWidth={0.5}
            strokeDasharray={v === 3 ? '5,3' : '2,5'}
            opacity={v === 3 ? 0.9 : 0.35}
          />
        ))}

        {/* Y-axis labels */}
        {[1, 3, 5].map(v => (
          <SvgText
            key={v}
            x={padL - 5} y={yOf(v) + 3.5}
            fontSize={8} fill={colors.mutedForeground} textAnchor="end"
          >{v}</SvgText>
        ))}

        {/* Weekly vertical tick guides (days 0, 7, 14, 21, 29) */}
        {[0, 7, 14, 21, 29].map(i => (
          <Line
            key={i}
            x1={xOf(i)} y1={padT} x2={xOf(i)} y2={chartH - padB}
            stroke={colors.border}
            strokeWidth={0.5}
            opacity={0.25}
          />
        ))}

        {/* Metric polylines */}
        {METRICS.map(m => {
          const pts = buildPolyline(m.key);
          if (!pts) return null;
          return (
            <Polyline
              key={m.key}
              points={pts}
              fill="none"
              stroke={m.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}

        {/* Dots at data points */}
        {METRICS.map(m =>
          buildDots(m.key).map((pt, i) => (
            <Circle key={i} cx={pt.x} cy={pt.y} r={3} fill={m.color} />
          ))
        )}
      </Svg>

      {/* X-axis labels */}
      <View style={[styles.xRow, { paddingLeft: padL, paddingRight: padR }]}>
        <Text style={[styles.xLabel, { color: colors.mutedForeground }]}>30d</Text>
        <Text style={[styles.xLabel, { color: colors.mutedForeground }]}>3w</Text>
        <Text style={[styles.xLabel, { color: colors.mutedForeground }]}>2w</Text>
        <Text style={[styles.xLabel, { color: colors.mutedForeground }]}>1w</Text>
        <Text style={[styles.xLabel, { color: colors.mutedForeground }]}>now</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  topRow: { gap: 5 },
  chartTitle: { fontSize: 11, fontFamily: 'Inter_600SemiBold', textTransform: 'uppercase', letterSpacing: 0.6 },
  legend: { flexDirection: 'row', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendText: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  xRow: { flexDirection: 'row', justifyContent: 'space-between' },
  xLabel: { fontSize: 9, fontFamily: 'Inter_400Regular' },
});
