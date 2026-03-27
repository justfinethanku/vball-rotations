'use client';

import { RotationNumber } from '@/lib/types';

interface RotationSelectorProps {
  current: RotationNumber;
  onChange: (rotation: RotationNumber) => void;
}

const rotations: RotationNumber[] = [1, 2, 3, 4, 5, 6];

export default function RotationSelector({ current, onChange }: RotationSelectorProps) {
  return (
    <div className="flex gap-1 bg-white/10 rounded-lg p-1">
      {rotations.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            current === r
              ? 'bg-white text-black'
              : 'text-white hover:bg-white/10'
          }`}
        >
          R{r}
        </button>
      ))}
    </div>
  );
}
