'use client';

import { RotationNumber, RotationSystem } from '@/lib/types';

interface RotationCarouselProps {
  current: RotationNumber;
  onChange: (rotation: RotationNumber) => void;
  system: RotationSystem;
  compact?: boolean;
}

const ROTATIONS: RotationNumber[] = [1, 2, 3, 4, 5, 6];

const SETTER_FRONT_51: Record<RotationNumber, boolean> = {
  1: false, 2: false, 3: false, 4: true, 5: true, 6: true,
};

export default function RotationCarousel({ current, onChange, system, compact = false }: RotationCarouselProps) {
  const getSetterRow = (r: RotationNumber): string => {
    if (system === '6-2') return r <= 3 ? 'S1 Back' : 'S1 Front';
    return SETTER_FRONT_51[r] ? 'Setter: Front' : 'Setter: Back';
  };

  if (compact) {
    return (
      <div className="flex bg-white/10 rounded-full p-1 gap-0.5">
        {ROTATIONS.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            aria-pressed={current === r}
            className={`focus-ring w-11 h-11 rounded-full text-sm font-bold btn-press transition-all ${
              current === r
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label={`Rotation ${r}, ${getSetterRow(r)}`}
          >
            {r}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-1.5">
      {ROTATIONS.map(r => {
        const isActive = current === r;
        const setterRow = getSetterRow(r);

        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            aria-pressed={current === r}
            className={`focus-ring flex-1 flex flex-col items-center gap-0.5 rounded-lg py-2 transition-all btn-press ${
              isActive
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base font-bold">R{r}</span>
            <span className={`text-[10px] leading-tight ${isActive ? 'text-indigo-300' : 'text-gray-400'}`}>
              {setterRow}
            </span>
          </button>
        );
      })}
    </div>
  );
}
