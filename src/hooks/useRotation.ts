'use client';

import { useState, useCallback, useMemo } from 'react';
import { RotationNumber, Phase, PlayerRole, Player, RotationSystem, PlayerPosition, ZoneArea } from '@/lib/types';
import { getRotationState } from '@/lib/rotationEngine';

const PHASES: Phase[] = ['serve', 'receive', 'transition'];

export function useRotation(players: Player[], system: RotationSystem) {
  const [currentRotation, setCurrentRotation] = useState<RotationNumber>(1);
  const [currentPhase, setCurrentPhase] = useState<Phase>('serve');
  const [focusedRole, setFocusedRole] = useState<PlayerRole | null>(null);
  const [showZones, setShowZones] = useState(true);

  const { positions, zones } = useMemo(
    () => getRotationState(players, system, currentRotation, currentPhase),
    [players, system, currentRotation, currentPhase]
  );

  const nextPhase = useCallback((): boolean => {
    const currentIndex = PHASES.indexOf(currentPhase);
    if (currentIndex < PHASES.length - 1) {
      setCurrentPhase(PHASES[currentIndex + 1]);
      return true;
    }
    return false;
  }, [currentPhase]);

  const prevPhase = useCallback((): boolean => {
    const currentIndex = PHASES.indexOf(currentPhase);
    if (currentIndex > 0) {
      setCurrentPhase(PHASES[currentIndex - 1]);
      return true;
    }
    return false;
  }, [currentPhase]);

  const nextRotation = useCallback(() => {
    setCurrentRotation(prev => (prev % 6 + 1) as RotationNumber);
    setCurrentPhase('serve');
  }, []);

  const prevRotation = useCallback(() => {
    setCurrentRotation(prev => ((prev - 2 + 6) % 6 + 1) as RotationNumber);
    setCurrentPhase('serve');
  }, []);

  const stepForward = useCallback(() => {
    if (!nextPhase()) {
      nextRotation();
    }
  }, [nextPhase, nextRotation]);

  const stepBackward = useCallback(() => {
    if (!prevPhase()) {
      prevRotation();
      setCurrentPhase('transition');
    }
  }, [prevPhase, prevRotation]);

  const toggleFocusedRole = useCallback((role: PlayerRole | null) => {
    setFocusedRole(prev => prev === role ? null : role);
  }, []);

  // Get previous positions for arrows
  const previousPositions = useMemo((): PlayerPosition[] | null => {
    const currentPhaseIndex = PHASES.indexOf(currentPhase);
    if (currentPhaseIndex > 0) {
      const prevPhaseVal = PHASES[currentPhaseIndex - 1];
      return getRotationState(players, system, currentRotation, prevPhaseVal).positions;
    }
    // First phase of rotation - show from previous rotation's transition
    if (currentRotation > 1) {
      const prevRot = (currentRotation - 1) as RotationNumber;
      return getRotationState(players, system, prevRot, 'transition').positions;
    }
    return null;
  }, [players, system, currentRotation, currentPhase]);

  return {
    currentRotation,
    currentPhase,
    focusedRole,
    showZones,
    positions,
    zones,
    previousPositions,
    setCurrentRotation,
    setCurrentPhase,
    setShowZones,
    stepForward,
    stepBackward,
    nextRotation,
    toggleFocusedRole,
  };
}
