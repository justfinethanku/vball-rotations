'use client';

import { useId } from 'react';

import { Player, PlayerRole } from '@/lib/types';
import { ROLE_COLORS, ROLE_LABELS, ROLE_SHORT } from '@/lib/constants';

interface PlayerCardProps {
  player: Player;
  onUpdate: (updates: Partial<Player>) => void;
}

const ALL_ROLES: PlayerRole[] = [
  'setter',
  'outside',
  'opposite',
  'middle',
  'libero',
  'ds',
];

export function PlayerCard({ player, onUpdate }: PlayerCardProps) {
  const fieldId = useId();
  const roleColor = ROLE_COLORS[player.role];

  return (
    <div role="group" aria-label={`Player: ${player.name}`} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] p-3">
      {/* Color indicator bar */}
      <div
        className="h-10 w-1 flex-shrink-0 rounded-full"
        style={{ backgroundColor: roleColor, color: '#030712' }}
      />

      {/* Avatar preview */}
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
        style={{ backgroundColor: roleColor, color: '#030712' }}
      >
        {ROLE_SHORT[player.role]}
      </div>

      {/* Inputs row */}
      <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
        {/* Name */}
        <div className="min-w-[100px] flex-1">
          <label htmlFor={`${fieldId}-name`} className="mb-0.5 block text-xs text-gray-400">Name</label>
          <input
            id={`${fieldId}-name`}
            type="text"
            value={player.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
          />
        </div>

        {/* Number */}
        <div className="w-16">
          <label htmlFor={`${fieldId}-number`} className="mb-0.5 block text-xs text-gray-400">Jersey number</label>
          <input
            id={`${fieldId}-number`}
            type="number"
            value={player.number}
            onChange={(e) =>
              onUpdate({ number: parseInt(e.target.value, 10) || 0 })
            }
            maxLength={3}
            min={0}
            max={999}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-center text-sm text-white outline-none transition-colors focus:border-indigo-500"
          />
        </div>

        {/* Role */}
        <div className="min-w-[120px]">
          <label htmlFor={`${fieldId}-role`} className="mb-0.5 block text-xs text-gray-400">Role</label>
          <select
            id={`${fieldId}-role`}
            value={player.role}
            onChange={(e) => onUpdate({ role: e.target.value as PlayerRole })}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-sm text-white outline-none transition-colors focus:border-indigo-500"
          >
            {ALL_ROLES.map((role) => (
              <option key={role} value={role} className="bg-gray-900">
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
