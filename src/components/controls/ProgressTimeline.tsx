'use client';

import { RotationNumber, Phase } from '@/lib/types';

const PHASES: Phase[] = ['serve', 'receive', 'transition'];
const ROTATIONS: RotationNumber[] = [1, 2, 3, 4, 5, 6];

const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serve',
  receive: 'Receive',
  transition: 'Transition',
};

interface ProgressTimelineProps {
  currentRotation: RotationNumber;
  currentPhase: Phase;
  onJump: (rotation: RotationNumber, phase: Phase) => void;
}

function getDotIndex(rotation: RotationNumber, phase: Phase): number {
  return (rotation - 1) * 3 + PHASES.indexOf(phase);
}

export function ProgressTimeline({
  currentRotation,
  currentPhase,
  onJump,
}: ProgressTimelineProps) {
  const currentIndex = getDotIndex(currentRotation, currentPhase);

  return (
    <div className="flex items-end gap-3">
      {ROTATIONS.map(rotation => (
        <div key={rotation} className="flex flex-col items-center gap-1">
          <span className="text-[9px] font-medium text-gray-500">
            R{rotation}
          </span>
          <div className="flex items-center gap-1">
            {PHASES.map(phase => {
              const dotIndex = getDotIndex(rotation, phase);
              const isCurrent = dotIndex === currentIndex;
              const isCompleted = dotIndex < currentIndex;
              const tooltip = `R${rotation} ${PHASE_LABELS[phase]}`;

              return (
                <button
                  key={phase}
                  type="button"
                  title={tooltip}
                  onClick={() => onJump(rotation, phase)}
                  className="flex items-center justify-center p-0.5 transition-transform hover:scale-125"
                  aria-label={tooltip}
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: isCurrent ? 8 : 6,
                      height: isCurrent ? 8 : 6,
                      backgroundColor: isCurrent
                        ? '#6366f1'
                        : isCompleted
                          ? '#ffffff'
                          : 'transparent',
                      border: !isCurrent && !isCompleted
                        ? '1.5px solid #6b7280'
                        : isCurrent
                          ? '1.5px solid #6366f1'
                          : '1.5px solid #ffffff',
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
