'use client';

import { RotationNumber } from '@/lib/types';

interface RotationSelectorProps {
  current: RotationNumber;
  onChange: (rotation: RotationNumber) => void;
}

const rotations: RotationNumber[] = [1, 2, 3, 4, 5, 6];

// In a 5-1 system: Setter is back row in R1-R3, front row in R4-R6
const SETTER_FRONT_ROW: Record<RotationNumber, boolean> = {
  1: false,
  2: false,
  3: false,
  4: true,
  5: true,
  6: true,
};

const SETTER_COLOR = '#EAB308';

export default function RotationSelector({ current, onChange }: RotationSelectorProps) {
  return (
    <div className="flex gap-1 bg-white/10 rounded-lg p-1">
      {rotations.map((r) => {
        const isFront = SETTER_FRONT_ROW[r];
        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`flex flex-col items-center px-2.5 py-1 text-sm font-medium rounded-md transition-colors ${
              current === r
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            <span>R{r}</span>
            <span
              className="w-1.5 h-1.5 rounded-full mt-0.5"
              style={{
                backgroundColor: isFront ? SETTER_COLOR : 'transparent',
                border: `1.5px solid ${SETTER_COLOR}`,
              }}
              title={isFront ? 'Setter front row' : 'Setter back row'}
            />
          </button>
        );
      })}
    </div>
  );
}
