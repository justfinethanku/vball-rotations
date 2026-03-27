'use client';

import { PlayerRole, RotationNumber, Phase, RotationSystem } from '@/lib/types';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/constants';
import { getPositionTip } from '@/data/position-info';

interface PositionInfoProps {
  role: PlayerRole;
  rotation: RotationNumber;
  phase: Phase;
  system: RotationSystem;
}

const ROLE_TIPS: Record<PlayerRole, Record<Phase, string>> = {
  setter: {
    serve: 'Prepare to set from the right side after the serve.',
    receive: 'Penetrate to the net from back row or set from position.',
    transition: 'Move to target position near the net, right of center.',
  },
  outside: {
    serve: 'Cover your zone and prepare to transition to attack.',
    receive: 'Pass in serve receive, then approach from zone 4.',
    transition: 'Approach from the left antenna for an outside attack.',
  },
  middle: {
    serve: 'Move to the net after the serve for a quick attack.',
    receive: 'Get to the net quickly for a 1 or slide attack.',
    transition: 'Stay ready at the net for quick sets and blocking.',
  },
  opposite: {
    serve: 'Cover your defensive zone, prepare right-side attack.',
    receive: 'Move to right side for a back-row or front-row attack.',
    transition: 'Attack from zone 2, or hit a back-row D ball.',
  },
  libero: {
    serve: 'Read the server and position for the best pass angle.',
    receive: 'Primary passer -- call the ball and deliver to target.',
    transition: 'Play defense in zone 5 or 6, dig and cover tips.',
  },
  ds: {
    serve: 'Serve tough and get back into defensive position.',
    receive: 'Support serve receive from your assigned zone.',
    transition: 'Play back-row defense and cover hitter tips.',
  },
};

const ROLE_BRIEF: Record<PlayerRole, string> = {
  setter: 'Runs the offense. Delivers sets to hitters.',
  outside: 'Primary attacker from the left side. Key passer.',
  middle: 'Quick attacker and primary blocker at the net.',
  opposite: 'Right-side attacker. Blocks the outside hitter.',
  libero: 'Defensive specialist. Cannot attack above the net.',
  ds: 'Back-row substitute. Serves and plays defense.',
};

export function PositionInfo({
  role,
  rotation,
  phase,
  system,
}: PositionInfoProps) {
  const color = ROLE_COLORS[role];
  const label = ROLE_LABELS[role];
  const positionTip = getPositionTip(system, rotation, phase, role);
  const tip = positionTip.tip || ROLE_TIPS[role][phase];
  const brief = positionTip.responsibility || ROLE_BRIEF[role];

  const phaseLabel =
    phase === 'serve'
      ? 'Serving'
      : phase === 'receive'
        ? 'Serve Receive'
        : 'Transition';

  return (
    <div
      className="rounded-xl border bg-gray-900/90 p-3 backdrop-blur"
      style={{ borderColor: `${color}33` }}
    >
      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold text-white">{label}</span>
        <span className="ml-auto text-xs text-gray-400">
          R{rotation} &middot; {phaseLabel} &middot; {system}
        </span>
      </div>

      {/* Description */}
      <p className="mb-1.5 text-xs text-gray-400">{brief}</p>

      {/* Phase-specific tip */}
      <div
        className="rounded-lg px-2.5 py-2 text-xs text-white/90"
        style={{ backgroundColor: `${color}18` }}
      >
        {tip}
      </div>
    </div>
  );
}
