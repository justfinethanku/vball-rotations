'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayerRole, CourtPosition } from '@/lib/types';
import { ROLE_COLORS, ROLE_SHORT } from '@/lib/constants';
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
  const short = ROLE_SHORT[role];
  const radius = isFocused ? 28 : 22;
  const strokeWidth = isFocused ? 4 : 3;

  return (
    <motion.g
      animate={{ x: svg.x, y: svg.y }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      opacity={isDimmed ? 0.25 : 1}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {/* Role abbreviation badge */}
      <motion.text
        animate={{ y: -(radius + 10) }}
        textAnchor="middle"
        dominantBaseline="central"
        fill={isFocused ? 'white' : color}
        fontSize={10}
        fontWeight="bold"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {isFocused ? 'YOU' : short}
      </motion.text>

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
            values={`${radius};${radius + 4};${radius}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Circle */}
      <motion.circle
        animate={{ r: radius }}
        fill={color}
        fillOpacity={0.85}
        stroke="white"
        strokeWidth={strokeWidth}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      />

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

      {/* Name below circle */}
      <motion.text
        animate={{ y: radius + 14 }}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={10}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {name.length > 10 ? name.slice(0, 9) + '\u2026' : name}
      </motion.text>
    </motion.g>
  );
}
