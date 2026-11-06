'use client';

import { Modal } from '@/components/Modal';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'This is a Volleyball Court',
    description: '6 players per side. Teams rotate clockwise each time they win serve back. There are 6 rotations total.',
    visual: (
      <div className="flex items-center justify-center py-4">
        <div className="relative w-40 h-48 rounded-lg border-2 border-white/30 bg-green-900/30">
          <div className="absolute top-1/3 inset-x-0 h-0.5 bg-white/50" />
          <span className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-white/40">NET</span>
          {[[25,20],[50,20],[75,20],[25,65],[50,65],[75,65]].map(([x,y], i) => (
            <div key={i} className="absolute w-5 h-5 rounded-full bg-indigo-600 border border-white/50"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
              <span className="flex items-center justify-center h-full text-[8px] font-bold text-white">{i+1}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: '3 Phases per Rotation',
    description: 'Each rotation has Serve (starting positions), Receive (passing formation), and Transition (attacking/defending). Swipe or tap to move through them.',
    visual: (
      <div className="flex items-center justify-center gap-0 py-4">
        {[
          { label: 'Serve', active: true },
          { label: 'Receive', active: false },
          { label: 'Transition', active: false },
        ].map((p, i) => (
          <div key={p.label} className="flex items-center">
            {i > 0 && <div className="w-4 h-0.5 bg-white/20" />}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              p.active ? 'bg-indigo-600 text-white' : 'bg-white/10 text-gray-400'
            }`}>{p.label}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Tap to Learn',
    description: 'Tap any player to see their role, zone, and what they should do. Use the ? icons for help anytime. Swipe left/right to navigate.',
    visual: (
      <div className="flex items-center justify-center gap-4 py-4">
        {[
          { label: 'S', color: '#EAB308' },
          { label: 'OH', color: '#3B82F6' },
          { label: 'MB', color: '#EF4444' },
          { label: 'OPP', color: '#22C55E' },
          { label: 'L', color: '#F97316' },
        ].map(({ label, color }) => (
          <div key={label}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: color, color: '#030712' }}>
            {label}
          </div>
        ))}
      </div>
    ),
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function Welcome({ onComplete }: WelcomeProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = current === steps.length - 1;

  const goNext = () => {
    if (isLast) { onComplete(); return; }
    setDirection(1);
    setCurrent(s => s + 1);
  };

  return (
    <Modal isOpen onClose={onComplete} label="Volleyball tutorial">
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 flex flex-col items-center">
        <p role="status" className="sr-only">Step {current + 1} of {steps.length}: {steps[current].title}</p>
        <div aria-hidden="true" className="flex items-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${
              i === current ? 'w-8 bg-indigo-600' : i < current ? 'w-4 bg-indigo-500/50' : 'w-4 bg-gray-700'
            }`} />
          ))}
        </div>

        <div className="w-full bg-gray-900 rounded-2xl border border-white/10 p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={current} custom={direction}
              variants={slideVariants} initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-white mb-2">{steps[current].title}</h2>
              {steps[current].visual}
              <p className="text-sm text-gray-400 leading-relaxed mt-2">{steps[current].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between w-full mt-5">
          <button onClick={onComplete}
            className="text-sm text-gray-400 hover:text-gray-300 transition-colors px-3 py-2 focus-ring rounded-lg">
            Skip
          </button>
          <button onClick={goNext}
            className="focus-ring px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
    </Modal>
  );
}
