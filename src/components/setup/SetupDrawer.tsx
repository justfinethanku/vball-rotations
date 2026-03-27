'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Player, RotationSystem } from '@/lib/types';
import { PlayerCard } from './PlayerCard';

interface SetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  teamName: string;
  system: RotationSystem;
  useLibero: boolean;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onTeamNameChange: (name: string) => void;
  onSystemChange: (system: RotationSystem) => void;
  onUseLiberoChange: (value: boolean) => void;
}

export function SetupDrawer({
  isOpen,
  onClose,
  players,
  teamName,
  system,
  useLibero,
  onUpdatePlayer,
  onTeamNameChange,
  onSystemChange,
  onUseLiberoChange,
}: SetupDrawerProps) {
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

          {/* Drawer panel */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-gray-900 shadow-2xl"
            style={{ maxHeight: '85vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-gray-600" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-semibold text-white">Team Setup</h2>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
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

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {/* Team name */}
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-400">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => onTeamNameChange(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              {/* System toggle */}
              <div className="mb-5">
                <label className="mb-1 block text-xs text-gray-400">
                  Rotation System
                </label>
                <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                  {(['5-1', '6-2'] as RotationSystem[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => onSystemChange(s)}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        system === s
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Use Libero toggle (5-1 only) */}
              {system === '5-1' && (
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-white">
                      Use Libero
                    </label>
                    <p className="text-xs text-gray-400">
                      Libero replaces back-row middle blocker
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={useLibero}
                    onClick={() => onUseLiberoChange(!useLibero)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
                      useLibero ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        useLibero ? 'translate-x-5' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </button>
                </div>
              )}

              {/* Players list */}
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Players
                </label>
                <div className="space-y-2">
                  {players.map((player) => (
                    <PlayerCard
                      key={player.id}
                      player={player}
                      onUpdate={(updates) => onUpdatePlayer(player.id, updates)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
