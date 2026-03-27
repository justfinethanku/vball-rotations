'use client';

import { Phase } from '@/lib/types';

interface PhaseStepperProps {
  current: Phase;
  onChange: (phase: Phase) => void;
  movedCount?: number;
  compact?: boolean;
}

const PHASES: Phase[] = ['serve', 'receive', 'transition'];
const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serve',
  receive: 'Receive',
  transition: 'Transition',
};
const PHASE_LABELS_SHORT: Record<Phase, string> = {
  serve: 'Srv',
  receive: 'Rcv',
  transition: 'Trans',
};

export default function PhaseStepper({ current, onChange, movedCount, compact = false }: PhaseStepperProps) {
  const labels = compact ? PHASE_LABELS_SHORT : PHASE_LABELS;
  const currentIdx = PHASES.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {PHASES.map((phase, i) => {
        const isActive = phase === current;
        const isPast = i < currentIdx;

        return (
          <div key={phase} className="flex items-center">
            {i > 0 && (
              <div
                className="h-0.5 transition-colors duration-200"
                style={{
                  width: compact ? 12 : 20,
                  backgroundColor: isPast || isActive ? '#6366f1' : 'rgba(255,255,255,0.15)',
                }}
              />
            )}
            <button
              onClick={() => onChange(phase)}
              className={`focus-ring relative flex items-center justify-center rounded-full font-semibold transition-all btn-press ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : isPast
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/15'
              }`}
              style={{
                minWidth: compact ? 56 : 80,
                height: compact ? 36 : 40,
                fontSize: compact ? 11 : 13,
              }}
            >
              {labels[phase]}
              {isActive && movedCount !== undefined && movedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black">
                  {movedCount}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
