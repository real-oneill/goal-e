import React from 'react';
import Svg, { Circle, Line, Path, Rect } from 'react-native-svg';

interface BJJIconProps {
  size?: number;
  color?: string;
}

export default function BJJIcon({ size = 24, color = '#000' }: BJJIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Head */}
      <Circle cx="12" cy="3.5" r="2" stroke={color} strokeWidth="1.5" />
      {/* Gi body — V-collar lapels + torso */}
      <Path
        d="M7 8.5 L10.5 7.5 L12 10.5 L13.5 7.5 L17 8.5 L17 15 L7 15 Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Belt */}
      <Line x1="7" y1="13" x2="17" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      {/* Left leg */}
      <Path d="M8.5 15 L8 21.5 L11 21.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right leg */}
      <Path d="M15.5 15 L16 21.5 L13 21.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
