'use client';

import { useId } from 'react';
import { Modal } from '@/components/Modal';

import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import { Player, RotationSystem, VariantId, TokenDisplayMode } from '@/lib/types';
import { getVariantsForSystem } from '@/data/variants';
import { PlayerCard } from './PlayerCard';

interface SetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  teamName: string;
  system: RotationSystem;
  useLibero: boolean;
  variant: VariantId;
  tokenDisplayMode: TokenDisplayMode;
  reduceMotion: boolean;
  learnMode: boolean;
  courtFlipped: boolean;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onTeamNameChange: (name: string) => void;
  onSystemChange: (system: RotationSystem) => void;
  onUseLiberoChange: (value: boolean) => void;
  onVariantChange: (variant: VariantId) => void;
  onTokenDisplayModeChange: (mode: TokenDisplayMode) => void;
  onReduceMotionToggle: () => void;
  onLearnModeToggle: () => void;
  onCourtFlipToggle: () => void;
  onResetPlayers: () => void;
  onReplayOnboarding: () => void;
}

function Toggle({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-label={label}
      aria-checked={checked}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out ${
        checked ? 'bg-indigo-600' : 'bg-gray-600'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        } mt-0.5`}
      />
    </button>
  );
}

export function SetupDrawer({
  isOpen,
  onClose,
  players,
  teamName,
  system,
  useLibero,
  variant,
  tokenDisplayMode,
  reduceMotion,
  learnMode,
  courtFlipped,
  onUpdatePlayer,
  onTeamNameChange,
  onSystemChange,
  onUseLiberoChange,
  onVariantChange,
  onTokenDisplayModeChange,
  onReduceMotionToggle,
  onLearnModeToggle,
  onCourtFlipToggle,
  onResetPlayers,
  onReplayOnboarding,
}: SetupDrawerProps) {
  const fieldId = useId();
  const dragControls = useDragControls();
  const variants = getVariantsForSystem(system);

  const tokenModes: { value: TokenDisplayMode; label: string }[] = [
    { value: 'jersey', label: 'Jersey Numbers' },
    { value: 'role', label: 'Role Abbreviations' },
    { value: 'name', label: 'Player Names' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} label="Settings">
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
            style={{ maxHeight: '90vh' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100) onClose();
            }}
          >
            {/* Drag handle + Header — drag region */}
            <div onPointerDown={(e) => dragControls.start(e)} style={{ touchAction: 'none' }}>
              <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                <div className="h-1.5 w-10 rounded-full bg-gray-400" />
              </div>
              <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
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
            </div>

            {/* Scrollable content */}
            <div className="scroll-fade-bottom flex-1 overflow-y-auto px-5" style={{ paddingBottom: `max(2rem, calc(2rem + env(safe-area-inset-bottom, 0px)))` }}>
              {/* Team name */}
              <div className="mb-4">
                <label htmlFor={`${fieldId}-team`} className="mb-1 block text-xs text-gray-400">
                  Team Name
                </label>
                <input
                  id={`${fieldId}-team`}
                  type="text"
                  value={teamName}
                  onChange={(e) => onTeamNameChange(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500"
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
                      aria-pressed={system === s}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                        system === s
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Variant selector (5-1 only) */}
              {system === '5-1' && variants.length > 0 && (
                <div className="mb-5">
                  <label htmlFor={`${fieldId}-variant`} className="mb-1 block text-xs text-gray-400">
                    Variant
                  </label>
                  <select
                    id={`${fieldId}-variant`}
                    value={variant}
                    onChange={(e) => onVariantChange(e.target.value as VariantId)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500"
                  >
                    {variants.map((v) => (
                      <option key={v.id} value={v.id} className="bg-gray-900">
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                  <Toggle
                    label="Use Libero"
                    checked={useLibero}
                    onToggle={() => onUseLiberoChange(!useLibero)}
                  />
                </div>
              )}

              {/* Divider */}
              <div className="my-5 border-t border-white/10" />

              {/* Display section */}
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Display
              </h3>

              {/* Token display mode */}
              <div className="mb-4">
                <label className="mb-1 block text-xs text-gray-400">
                  Token Display
                </label>
                <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                  {tokenModes.map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => onTokenDisplayModeChange(mode.value)}
                      aria-pressed={tokenDisplayMode === mode.value}
                      className={`flex-1 rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                        tokenDisplayMode === mode.value
                          ? 'bg-indigo-600 text-white shadow'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Learn Mode toggle */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white">
                    Learn Mode
                  </label>
                  <p className="text-xs text-gray-400">
                    Show rotation tips and explanations
                  </p>
                </div>
                <Toggle label="Learn Mode" checked={learnMode} onToggle={onLearnModeToggle} />
              </div>

              {/* Reduce Motion toggle */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white">
                    Reduce Motion
                  </label>
                  <p className="text-xs text-gray-400">
                    Disable animations and transitions
                  </p>
                </div>
                <Toggle
                  label="Reduce Motion"
                  checked={reduceMotion}
                  onToggle={onReduceMotionToggle}
                />
              </div>

              {/* Flip Court toggle */}
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-white">
                    Flip Court
                  </label>
                  <p className="text-xs text-gray-400">
                    Mirror the court orientation
                  </p>
                </div>
                <Toggle
                  label="Flip Court"
                  checked={courtFlipped}
                  onToggle={onCourtFlipToggle}
                />
              </div>

              {/* Divider */}
              <div className="my-5 border-t border-white/10" />

              {/* Players section */}
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                Players
              </h3>

              {/* Players list */}
              <div className="space-y-2">
                {players.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onUpdate={(updates) => onUpdatePlayer(player.id, updates)}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={onResetPlayers}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
                >
                  Reset to Defaults
                </button>
                <button
                  onClick={onReplayOnboarding}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/10"
                >
                  Replay Tutorial
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </Modal>
  );
}
