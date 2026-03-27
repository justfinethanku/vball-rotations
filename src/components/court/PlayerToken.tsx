'use client';

import React from 'react';
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
    <g
      transform={`translate(${svg.x}, ${svg.y})`}
      opacity={isDimmed ? 0.25 : 1}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.4s ease, opacity 0.3s ease' }}
    >
      {/* "YOU" label above (focused only) */}
      {isFocused && (
        <text
          y={-(radius + 8)}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={9}
          fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          YOU
        </text>
      )}

      {/* Glow ring (focused only) — simple static ring, no animation */}
      {isFocused && (
        <circle
          r={radius + 5}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.4}
        />
      )}

      {/* Main circle */}
      <circle
        r={radius}
        fill={color}
        fillOpacity={0.9}
        stroke="white"
        strokeWidth={strokeWidth}
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
      {!isDimmed && (
        <text
          y={radius + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={isFocused ? 10 : 8}
          opacity={isFocused ? 1 : 0.7}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {isFocused ? (name.length > 10 ? name.slice(0, 9) + '\u2026' : name) : shortName}
        </text>
      )}
    </g>
  );
}
