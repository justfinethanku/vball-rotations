'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeProps {
  onComplete: () => void;
}

// ─── Slide content ─────────────────────────────────────────────
const slides = [
  {
    title: 'Welcome to VBall Rotations',
    content: (
      <div className="flex flex-col items-center gap-4">
        {/* Volleyball SVG icon */}
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mb-2">
          <circle cx="40" cy="40" r="36" stroke="#818cf8" strokeWidth="3" fill="none" />
          <path d="M40 4C40 4 52 24 52 40C52 56 40 76 40 76" stroke="#818cf8" strokeWidth="2" fill="none" />
          <path d="M40 4C40 4 28 24 28 40C28 56 40 76 40 76" stroke="#818cf8" strokeWidth="2" fill="none" />
          <path d="M4 40C24 40 40 28 40 28C40 28 56 40 76 40" stroke="#818cf8" strokeWidth="2" fill="none" />
          <path d="M4 40C24 40 40 52 40 52C40 52 56 40 76 40" stroke="#818cf8" strokeWidth="2" fill="none" />
        </svg>
        <p className="text-lg text-indigo-300 font-medium">
          The easiest way to learn volleyball rotations
        </p>
        <p className="text-sm text-gray-400">
          Understand where to stand and move in every rotation
        </p>
      </div>
    ),
  },
  {
    title: 'Choose Your System',
    content: (
      <div className="flex flex-col items-center gap-4">
        {/* Styled toggle buttons */}
        <div className="flex bg-white/10 rounded-lg p-1 text-sm">
          <span className="px-4 py-2 rounded-md bg-indigo-500 text-white font-medium">
            5-1
          </span>
          <span className="px-4 py-2 rounded-md text-gray-400 font-medium">
            6-2
          </span>
        </div>
        <p className="text-sm text-gray-300">
          <span className="text-indigo-400 font-medium">5-1</span> uses one setter who sets from everywhere
        </p>
        <p className="text-sm text-gray-300">
          <span className="text-indigo-400 font-medium">6-2</span> uses two setters &mdash; the back-row setter always sets
        </p>
      </div>
    ),
  },
  {
    title: 'Navigate Rotations',
    content: (
      <div className="flex flex-col items-center gap-4">
        {/* Swipe gesture hint */}
        <div className="flex items-center gap-6 text-gray-400">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-gray-500 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
        <p className="text-sm text-gray-300">
          Swipe or use controls to move through rotations
        </p>
        <p className="text-sm text-gray-400">
          Each rotation has 3 phases: <span className="text-indigo-400">Serve</span> &rarr; <span className="text-indigo-400">Receive</span> &rarr; <span className="text-indigo-400">Transition</span>
        </p>
      </div>
    ),
  },
  {
    title: 'Focus on Your Position',
    content: (
      <div className="flex flex-col items-center gap-4">
        {/* Colored role dots */}
        <div className="flex items-center gap-3">
          {[
            { label: 'S', color: '#facc15' },
            { label: 'OH', color: '#f87171' },
            { label: 'MB', color: '#60a5fa' },
            { label: 'OPP', color: '#c084fc' },
            { label: 'L', color: '#4ade80' },
          ].map(({ label, color }) => (
            <div
              key={label}
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
              style={{ backgroundColor: color }}
            >
              {label}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-300">
          Tap a position to see exactly what <span className="text-indigo-400 font-medium">YOU</span> do
        </p>
        <p className="text-sm text-gray-400">
          Share the link so your whole team can learn
        </p>
      </div>
    ),
  },
];

// ─── Animation variants ────────────────────────────────────────
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 200 : -200,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -200 : 200,
    opacity: 0,
  }),
};

// ─── Welcome component ─────────────────────────────────────────
export default function Welcome({ onComplete }: WelcomeProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const isLastSlide = currentSlide === slides.length - 1;

  const goNext = () => {
    if (isLastSlide) {
      onComplete();
      return;
    }
    setDirection(1);
    setCurrentSlide((s) => s + 1);
  };

  const goToSlide = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 flex flex-col items-center">
        {/* Card */}
        <div className="w-full bg-gray-900 rounded-2xl border border-white/10 p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center gap-4"
            >
              <h2 className="text-xl font-bold text-white">{slide.title}</h2>
              {slide.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center gap-2 mt-5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === currentSlide ? 'bg-indigo-400' : 'bg-gray-600'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between w-full mt-5">
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-3 py-2"
          >
            Skip
          </button>
          <button
            onClick={goNext}
            className="px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors"
          >
            {isLastSlide ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
