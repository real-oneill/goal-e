import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import BJJIcon from './BJJIcon';
import { Discipline } from '@/types';

interface DisciplineIconProps {
  discipline: Discipline;
  size?: number;
  color?: string;
}

export default function DisciplineIcon({ discipline, size = 24, color = '#000' }: DisciplineIconProps) {
  if (discipline === 'bjj') {
    return <BJJIcon size={size} color={color} />;
  }
  if (discipline === 'guitar') {
    return <Ionicons name="musical-notes-outline" size={size} color={color} />;
  }
  return <Ionicons name="barbell-outline" size={size} color={color} />;
}
