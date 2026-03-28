'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PlayerRole, CourtPosition, TokenDisplayMode } from '@/lib/types';
import { ROLE_COLORS, ROLE_SHORT, FRONT_ROW_THRESHOLD } from '@/lib/constants';
import { courtToSvg } from '@/lib/courtMath';

interface PlayerTokenProps {
  playerId: string;
  name: string;
  number: number;
  role: PlayerRole;
  position: CourtPosition;
  isFocused: boolean;
  isDimmed: boolean;
  displayMode: TokenDisplayMode;
  onClick?: () => void;
}

export default function PlayerToken(props: PlayerTokenProps) {
  const { name, number, role, position, isFocused, isDimmed, displayMode, onClick } = props;
  const svg = courtToSvg(position);
  const color = ROLE_COLORS[role];
  const radius = isFocused ? 24 : 20;
  const isBackRow = position.y > FRONT_ROW_THRESHOLD;
  const isLibero = role === 'libero';

  let displayText: string;
  switch (displayMode) {
    case 'jersey':
      displayText = String(number);
      break;
    case 'role':
      displayText = ROLE_SHORT[role];
      break;
    case 'name':
      displayText = name.length > 3 ? name.slice(0, 3).toUpperCase() : name.toUpperCase();
      break;
  }

  const labelName = name.length > 8 ? name.slice(0, 7) + '\u2026' : name;
  const youLabelY = Math.max(-(radius + 8), -45);

  return (
    <motion.g
      animate={{ x: svg.x, y: svg.y, opacity: isDimmed ? 0.4 : 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      role="button"
      aria-label={`${name}, ${ROLE_SHORT[role]}, ${isBackRow ? 'back' : 'front'} row`}
      tabIndex={onClick ? 0 : undefined}
    >
      {isFocused && (
        <text y={youLabelY} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={9} fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {isBackRow ? 'BACK ROW' : 'FRONT ROW'}
        </text>
      )}

      {isFocused && (
        <circle r={radius + 5} fill="none" stroke={color} strokeWidth={3} opacity={0.6} />
      )}

      {isLibero ? (
        <rect x={-radius} y={-radius} width={radius * 2} height={radius * 2}
          rx={8} fill={color} stroke="white"
          strokeWidth={isFocused ? 3.5 : 2.5}
          strokeDasharray={isBackRow ? '6 3' : undefined} />
      ) : (
        <circle r={radius} fill={color} stroke="white"
          strokeWidth={isFocused ? 3.5 : 2.5}
          strokeDasharray={isBackRow ? '6 3' : undefined} />
      )}

      <text textAnchor="middle" dominantBaseline="central" fill="white"
        fontSize={displayMode === 'name' ? 11 : 14} fontWeight="bold"
        style={{ userSelect: 'none', pointerEvents: 'none' }}>
        {displayText}
      </text>

      {!isDimmed && (
        <text y={radius + 12} textAnchor="middle" dominantBaseline="central"
          fill="white" fontSize={9} opacity={isFocused ? 1 : 0.7}
          style={{ userSelect: 'none', pointerEvents: 'none' }}>
          {isFocused ? (name.length > 10 ? name.slice(0, 9) + '\u2026' : name) : labelName}
        </text>
      )}
    </motion.g>
  );
}
