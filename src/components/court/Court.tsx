'use client';

import React from 'react';
import { SVG_WIDTH, SVG_HEIGHT, SVG_PADDING, COURT_SVG } from '@/lib/constants';
import { getAttackLineY } from '@/lib/courtMath';

interface CourtProps {
  children: React.ReactNode;
}

export default function Court({ children }: CourtProps) {
  const attackLineY = getAttackLineY();
  const netY = COURT_SVG.y;
  const netPatternId = 'net-hatch';

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      preserveAspectRatio="xMidYMid meet"
      className="w-full h-auto"
    >
      <defs>
        {/* Radial gradient for court surface */}
        <radialGradient id="court-gradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1DB954" />
          <stop offset="100%" stopColor="#117A32" />
        </radialGradient>

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
        fill="url(#court-gradient)"
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

      {/* NET label */}
      <text
        x={COURT_SVG.x + COURT_SVG.width / 2}
        y={netY}
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={8}
        fontWeight="bold"
        opacity={0.45}
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        NET
      </text>

      {/* Antenna marks */}
      <rect
        x={COURT_SVG.x - 1}
        y={netY - 4}
        width={2}
        height={8}
        fill="#EF4444"
      />
      <rect
        x={COURT_SVG.x + COURT_SVG.width - 1}
        y={netY - 4}
        width={2}
        height={8}
        fill="#EF4444"
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

      {/* Children (players, arrows, overlays) */}
      {children}
    </svg>
  );
}
