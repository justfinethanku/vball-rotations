'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayerRole, CourtPosition } from '@/lib/types';
import { ROLE_COLORS } from '@/lib/constants';
import { courtToSvg } from '@/lib/courtMath';

interface PlayerTokenProps {
  playerId: string;
  name: string;
  number: number;
  role: PlayerRole;
  position: CourtPosition;
  isFocused: boolean;
  isDimmed: boolean;
  onClick?: () => void;
}

export default function PlayerToken({
  playerId,
  name,
  number,
  role,
  position,
  isFocused,
  isDimmed,
  onClick,
}: PlayerTokenProps) {
  const svg = courtToSvg(position);
  const color = ROLE_COLORS[role];
  const radius = isFocused ? 24 : 20;
  const strokeWidth = isFocused ? 3.5 : 2.5;

  // Truncate name for compact display (max 6 chars)
  const shortName = name.length > 8 ? name.slice(0, 7) + '\u2026' : name;

  return (
    <motion.g
      animate={{ x: svg.x, y: svg.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      opacity={isDimmed ? 0.25 : 1}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <defs>
        <filter id={`shadow-${playerId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(0,0,0,0.4)" />
        </filter>
        <radialGradient id={`grad-${playerId}`} cx="35%" cy="30%">
          <stop offset="0%" stopColor="white" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* "YOU" label above (focused only) */}
      {isFocused && (
        <motion.text
          animate={{ y: -(radius + 10) }}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={10}
          fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          YOU
        </motion.text>
      )}

      {/* Pulsing glow ring (when focused) */}
      {isFocused && (
        <circle
          r={radius + 4}
          fill="none"
          stroke={color}
          strokeWidth={3}
        >
          <animate
            attributeName="opacity"
            values="0.2;0.5;0.2"
            dur="1.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="r"
            values={`${radius + 4};${radius + 8};${radius + 4}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Circle */}
      <circle
        r={radius}
        fill={color}
        fillOpacity={0.85}
        stroke="white"
        strokeWidth={strokeWidth}
        filter={`url(#shadow-${playerId})`}
      />
      <circle r={radius} fill={`url(#grad-${playerId})`} />

      {/* Jersey number */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={14}
        fontWeight="bold"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {number}
      </text>

      {/* Name below circle: full name when focused, short name otherwise (hidden when dimmed) */}
      {!isDimmed && (
        <motion.text
          animate={{ y: radius + 12 }}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={isFocused ? 10 : 8}
          opacity={isFocused ? 1 : 0.7}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {isFocused ? (name.length > 10 ? name.slice(0, 9) + '\u2026' : name) : shortName}
        </motion.text>
      )}
    </motion.g>
  );
}
