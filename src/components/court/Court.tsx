'use client';

import React from 'react';
import { SVG_WIDTH, SVG_HEIGHT, SVG_PADDING, COURT_SVG } from '@/lib/constants';
import { getAttackLineY } from '@/lib/courtMath';

interface CourtProps {
  children: React.ReactNode;
}

const ZONE_POSITIONS = [
  { zone: 4, x: COURT_SVG.x + COURT_SVG.width * 0.17, y: COURT_SVG.y + COURT_SVG.height * 0.17 },
  { zone: 3, x: COURT_SVG.x + COURT_SVG.width * 0.5, y: COURT_SVG.y + COURT_SVG.height * 0.17 },
  { zone: 2, x: COURT_SVG.x + COURT_SVG.width * 0.83, y: COURT_SVG.y + COURT_SVG.height * 0.17 },
  { zone: 5, x: COURT_SVG.x + COURT_SVG.width * 0.17, y: COURT_SVG.y + COURT_SVG.height * 0.72 },
  { zone: 6, x: COURT_SVG.x + COURT_SVG.width * 0.5, y: COURT_SVG.y + COURT_SVG.height * 0.72 },
  { zone: 1, x: COURT_SVG.x + COURT_SVG.width * 0.83, y: COURT_SVG.y + COURT_SVG.height * 0.72 },
];

export default function Court({ children }: CourtProps) {
  const attackLineY = getAttackLineY();
  const netY = COURT_SVG.y;
  const netPatternId = 'net-hatch';

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-full max-w-[450px]"
    >
      <defs>
        {/* Net cross-hatching pattern */}
        <pattern
          id={netPatternId}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="8" stroke="white" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>

      {/* Court background */}
      <rect
        x={COURT_SVG.x}
        y={COURT_SVG.y}
        width={COURT_SVG.width}
        height={COURT_SVG.height}
        fill="#16A34A"
        rx={4}
      />

      {/* Boundary lines */}
      <rect
        x={COURT_SVG.x}
        y={COURT_SVG.y}
        width={COURT_SVG.width}
        height={COURT_SVG.height}
        fill="none"
        stroke="white"
        strokeWidth={2}
        rx={4}
      />

      {/* Center line (net) background */}
      <rect
        x={COURT_SVG.x}
        y={netY - 6}
        width={COURT_SVG.width}
        height={12}
        fill="#1E3A5F"
      />

      {/* Net cross-hatching */}
      <rect
        x={COURT_SVG.x}
        y={netY - 6}
        width={COURT_SVG.width}
        height={12}
        fill={`url(#${netPatternId})`}
      />

      {/* Net top/bottom lines */}
      <line
        x1={COURT_SVG.x}
        y1={netY - 6}
        x2={COURT_SVG.x + COURT_SVG.width}
        y2={netY - 6}
        stroke="white"
        strokeWidth={2}
      />
      <line
        x1={COURT_SVG.x}
        y1={netY + 6}
        x2={COURT_SVG.x + COURT_SVG.width}
        y2={netY + 6}
        stroke="white"
        strokeWidth={2}
      />

      {/* Attack line (3m line) */}
      <line
        x1={COURT_SVG.x}
        y1={attackLineY}
        x2={COURT_SVG.x + COURT_SVG.width}
        y2={attackLineY}
        stroke="white"
        strokeWidth={1.5}
        strokeDasharray="8 4"
        opacity={0.7}
      />

      {/* Zone position numbers */}
      {ZONE_POSITIONS.map(({ zone, x, y }) => (
        <text
          key={zone}
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          opacity={0.18}
          fontSize={32}
          fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {zone}
        </text>
      ))}

      {/* Children (players, arrows, overlays) */}
      {children}
    </svg>
  );
}
