'use client';

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: 'slow' | 'medium' | 'fast';
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onSpeedChange: (speed: 'slow' | 'medium' | 'fast') => void;
}

const speedOptions: { value: 'slow' | 'medium' | 'fast'; label: string }[] = [
  { value: 'slow', label: '0.5x' },
  { value: 'medium', label: '1x' },
  { value: 'fast', label: '2x' },
];

function ChevronLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 4L18 11L6 18V4Z" fill="currentColor" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor" />
      <rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function PlaybackControls({
  isPlaying,
  speed,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      {/* Step backward */}
      <button
        onClick={onStepBackward}
        className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        aria-label="Step backward"
      >
        <ChevronLeftIcon />
      </button>

      {/* Play / Pause */}
      <button
        onClick={onTogglePlay}
        className="p-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Step forward */}
      <button
        onClick={onStepForward}
        className="p-2 rounded-full text-white hover:bg-white/10 transition-colors"
        aria-label="Step forward"
      >
        <ChevronRightIcon />
      </button>

      {/* Speed selector */}
      <div className="flex gap-1 bg-white/10 rounded-lg p-1 ml-2">
        {speedOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onSpeedChange(opt.value)}
            className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
              speed === opt.value
                ? 'bg-white text-black'
                : 'text-white hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
