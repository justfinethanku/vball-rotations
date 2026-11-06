'use client';

import { Player, PlayerRole, RotationNumber, Phase, RotationSystem, PlayerPosition } from '@/lib/types';
import { ROLE_COLORS, ROLE_LABELS, ROLE_SHORT, FRONT_ROW_THRESHOLD } from '@/lib/constants';
import { getPositionTip } from '@/data/position-info';

interface PlayerInfoSheetProps {
  player: Player | null;
  role: PlayerRole | null;
  rotation: RotationNumber;
  phase: Phase;
  system: RotationSystem;
  position: PlayerPosition | null;
  nextPhasePosition: PlayerPosition | null;
  onClose: () => void;
}

const ROLE_BRIEF: Record<PlayerRole, string> = {
  setter: 'Runs the offense. Delivers sets to hitters.',
  outside: 'Primary attacker from the left side. Key passer.',
  middle: 'Quick attacker and primary blocker at the net.',
  opposite: 'Right-side attacker. Blocks the outside hitter.',
  libero: 'Defensive specialist. Cannot attack above the net.',
  ds: 'Back-row substitute. Serves and plays defense.',
};

const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serving',
  receive: 'Serve Receive',
  transition: 'Transition',
};

function getZoneNumber(x: number, y: number): number {
  const isBack = y > FRONT_ROW_THRESHOLD;
  if (isBack) {
    if (x < 3) return 5;
    if (x > 6) return 1;
    return 6;
  }
  if (x < 3) return 4;
  if (x > 6) return 2;
  return 3;
}

export function PlayerInfoSheet({
  player, role, rotation, phase, system, position, nextPhasePosition, onClose,
}: PlayerInfoSheetProps) {
  if (!role) return null;

  const color = ROLE_COLORS[role];
  const label = ROLE_LABELS[role];
  const positionTip = getPositionTip(system, rotation, phase, role);
  const brief = positionTip.responsibility || ROLE_BRIEF[role];
  const tip = positionTip.tip;

  const currentZone = position ? getZoneNumber(position.position.x, position.position.y) : null;
  const isBackRow = position ? position.position.y > FRONT_ROW_THRESHOLD : null;

  let movementPreview: string | null = null;
  if (nextPhasePosition && position) {
    const nextZone = getZoneNumber(nextPhasePosition.position.x, nextPhasePosition.position.y);
    if (nextZone !== currentZone) {
      movementPreview = `Next: moves to Zone ${nextZone}`;
    }
  }

  return (
    <div className="rounded-xl border bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-black/30 overflow-hidden"
      style={{ borderColor: `${color}40` }}>
      <div className="h-1" style={{ backgroundColor: color }} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: color, color: '#030712' }}>
              {ROLE_SHORT[role]}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {player ? `${player.name} · #${player.number}` : label}
              </div>
              <div className="text-[11px] text-gray-400">
                {label} · R{rotation} · {PHASE_LABELS[phase]}
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {currentZone !== null && (
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
              Zone {currentZone}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              isBackRow ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
            }`}>
              {isBackRow ? 'Back Row' : 'Front Row'}
            </span>
          </div>
        )}

        <p className="text-xs text-gray-300 mb-2 leading-relaxed">{brief}</p>

        {tip && (
          <div className="rounded-lg px-3 py-2 text-xs text-white/90 leading-relaxed"
            style={{ backgroundColor: `${color}18` }}>
            {tip}
          </div>
        )}

        {movementPreview && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            {movementPreview}
          </div>
        )}
      </div>
    </div>
  );
}
