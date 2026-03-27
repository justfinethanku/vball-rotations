'use client';

import { PlayerRole, RotationSystem } from '@/lib/types';
import { ROLE_COLORS, ROLE_SHORT } from '@/lib/constants';

interface PositionFilterProps {
  focusedRole: PlayerRole | null;
  onToggle: (role: PlayerRole | null) => void;
  system: RotationSystem;
}

const roles51: PlayerRole[] = ['setter', 'outside', 'middle', 'opposite', 'libero'];
const roles62: PlayerRole[] = ['setter', 'outside', 'middle', 'libero'];

const roleLabels62: Partial<Record<PlayerRole, string>> = {
  setter: 'Setter 1 / 2',
};

export default function PositionFilter({ focusedRole, onToggle, system }: PositionFilterProps) {
  const roles = system === '6-2' ? roles62 : roles51;

  return (
    <div className="overflow-x-auto flex gap-2 pb-1">
      {/* All chip */}
      <button
        onClick={() => onToggle(null)}
        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
          focusedRole === null
            ? 'bg-white text-black'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        All
      </button>

      {/* Role chips */}
      {roles.map((role) => {
        const isActive = focusedRole === role;
        const color = ROLE_COLORS[role];
        const label = system === '6-2' && roleLabels62[role]
          ? roleLabels62[role]
          : ROLE_SHORT[role];

        return (
          <button
            key={role}
            onClick={() => onToggle(isActive ? null : role)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
              isActive
                ? 'text-white'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            style={isActive ? { backgroundColor: color } : undefined}
          >
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            {label}
          </button>
        );
      })}
    </div>
  );
}
