'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Player, RotationSystem, RotationNumber, Phase } from '@/lib/types';
import { getRotationState } from '@/lib/rotationEngine';
import { ROLE_COLORS } from '@/lib/constants';
import Court from '@/components/court/Court';
import PlayerToken from '@/components/court/PlayerToken';

interface CompareViewProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  system: RotationSystem;
  useLibero?: boolean;
}

const ROTATIONS: RotationNumber[] = [1, 2, 3, 4, 5, 6];
const PHASES: Phase[] = ['serve', 'receive', 'transition'];
const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serve',
  receive: 'Receive',
  transition: 'Transition',
};

function RotationCourtPanel({
  label,
  players,
  system,
  rotation,
  phase,
  useLibero = true,
  onRotationChange,
  onPhaseChange,
}: {
  label: string;
  players: Player[];
  system: RotationSystem;
  rotation: RotationNumber;
  phase: Phase;
  useLibero?: boolean;
  onRotationChange: (r: RotationNumber) => void;
  onPhaseChange: (p: Phase) => void;
}) {
  const { positions } = getRotationState(players, system, rotation, phase, useLibero);

  return (
    <div className="flex flex-col items-center gap-3 flex-1 min-w-0">
      {/* Panel label */}
      <h3 className="text-sm font-semibold text-gray-300">{label}</h3>

      {/* Selectors */}
      <div className="flex gap-2">
        <select
          value={rotation}
          onChange={(e) => onRotationChange(Number(e.target.value) as RotationNumber)}
          className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {ROTATIONS.map((r) => (
            <option key={r} value={r} className="bg-gray-800">
              R{r}
            </option>
          ))}
        </select>

        <select
          value={phase}
          onChange={(e) => onPhaseChange(e.target.value as Phase)}
          className="bg-white/10 text-white text-sm rounded-lg px-2 py-1.5 border border-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {PHASES.map((p) => (
            <option key={p} value={p} className="bg-gray-800">
              {PHASE_LABELS[p]}
            </option>
          ))}
        </select>
      </div>

      {/* Mini Court */}
      <div className="w-full max-w-[300px]">
        <Court>
          {positions.map((pos) => {
            const player = players.find((p) => p.id === pos.playerId);
            if (!player) return null;
            return (
              <PlayerToken
                key={pos.playerId}
                playerId={pos.playerId}
                name={player.name}
                number={player.number}
                role={pos.role}
                position={pos.position}
                isFocused={false}
                isDimmed={false}
              />
            );
          })}
        </Court>
      </div>
    </div>
  );
}

export function CompareView({ isOpen, onClose, players, system, useLibero = true }: CompareViewProps) {
  const [rotationA, setRotationA] = useState<RotationNumber>(1);
  const [phaseA, setPhaseA] = useState<Phase>('serve');
  const [rotationB, setRotationB] = useState<RotationNumber>(1);
  const [phaseB, setPhaseB] = useState<Phase>('receive');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-gray-900 overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
              <h2 className="text-lg font-bold text-white">Compare Rotations</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                aria-label="Close comparison"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Content: two courts side by side (desktop) or stacked (mobile) */}
            <div className="flex-1 flex flex-col md:flex-row items-start justify-center gap-6 p-4 md:p-8">
              <RotationCourtPanel
                label="State A"
                players={players}
                system={system}
                rotation={rotationA}
                phase={phaseA}
                useLibero={useLibero}
                onRotationChange={setRotationA}
                onPhaseChange={setPhaseA}
              />

              {/* Divider */}
              <div className="hidden md:flex items-center self-stretch">
                <div className="w-px h-full bg-white/10" />
              </div>
              <div className="md:hidden w-full h-px bg-white/10" />

              <RotationCourtPanel
                label="State B"
                players={players}
                system={system}
                rotation={rotationB}
                phase={phaseB}
                useLibero={useLibero}
                onRotationChange={setRotationB}
                onPhaseChange={setPhaseB}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
