'use client';

import { Phase } from '@/lib/types';

interface PhaseToggleProps {
  current: Phase;
  onChange: (phase: Phase) => void;
}

const phases: Phase[] = ['serve', 'receive', 'transition'];

const phaseLabels: Record<Phase, string> = {
  serve: 'Serve',
  receive: 'Receive',
  transition: 'Transition',
};

export default function PhaseToggle({ current, onChange }: PhaseToggleProps) {
  return (
    <div className="flex gap-1 bg-white/10 rounded-lg p-1">
      {phases.map((phase) => (
        <button
          key={phase}
          onClick={() => onChange(phase)}
          className={`px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
            current === phase
              ? 'bg-indigo-500 text-white'
              : 'text-white hover:bg-white/10'
          }`}
        >
          {phaseLabels[phase]}
        </button>
      ))}
    </div>
  );
}
