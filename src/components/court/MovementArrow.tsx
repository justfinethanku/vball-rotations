'use client';

import React, { useId } from 'react';
import { CourtPosition } from '@/lib/types';
import { courtToSvg, getArrowPath } from '@/lib/courtMath';

interface MovementArrowProps {
  from: CourtPosition;
  to: CourtPosition;
  color: string;
  isDimmed: boolean;
}

export default function MovementArrow({
  from,
  to,
  color,
  isDimmed,
}: MovementArrowProps) {
  const markerId = useId();
  const svgFrom = courtToSvg(from);
  const svgTo = courtToSvg(to);
  const pathD = getArrowPath(svgFrom, svgTo);

  return (
    <g opacity={isDimmed ? 0.15 : 0.7} style={{ transition: 'opacity 0.3s ease' }}>
      <defs>
        <marker
          id={markerId}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <polygon points="0 0, 8 3, 0 6" fill={color} />
        </marker>
      </defs>

      <path
        d={pathD}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="6 4"
        strokeLinecap="round"
        fill="none"
        markerEnd={`url(#${markerId})`}
      />
    </g>
  );
}
