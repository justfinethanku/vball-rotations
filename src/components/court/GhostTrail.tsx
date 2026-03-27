'use client';

import { PlayerRole, CourtPosition } from '@/lib/types';
import { ROLE_COLORS } from '@/lib/constants';
import { courtToSvg, getArrowPath } from '@/lib/courtMath';

interface GhostTrailProps {
  from: CourtPosition;
  to: CourtPosition;
  role: PlayerRole;
  reduceMotion: boolean;
}

export default function GhostTrail({ from, to, role, reduceMotion }: GhostTrailProps) {
  if (reduceMotion) return null;

  const fromSvg = courtToSvg(from);
  const toSvg = courtToSvg(to);
  const color = ROLE_COLORS[role];
  const path = getArrowPath(fromSvg, toSvg);

  return (
    <g className="ghost-trail" style={{ pointerEvents: 'none' }}>
      <circle cx={fromSvg.x} cy={fromSvg.y} r={16} fill={color} opacity={0.3}
        strokeDasharray="4 2" stroke={color} strokeWidth={1.5} />
      <path d={path} fill="none" stroke={color} strokeWidth={2}
        strokeDasharray="4 4" opacity={0.4} />
    </g>
  );
}
