'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { SPEED_MS, PHASE_PAUSE_MS } from '@/lib/constants';

type Speed = 'slow' | 'medium' | 'fast';

export function useAnimation(stepForward: () => void) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<Speed>('medium');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    setIsPlaying(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, stop, play]);

  useEffect(() => {
    if (isPlaying) {
      const ms = SPEED_MS[speed] + PHASE_PAUSE_MS;
      intervalRef.current = setInterval(() => {
        stepForward();
      }, ms);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isPlaying, speed, stepForward]);

  return {
    isPlaying,
    speed,
    setSpeed,
    togglePlay,
    stop,
  };
}
