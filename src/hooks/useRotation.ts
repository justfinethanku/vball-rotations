'use client';

import { useState, useCallback, useMemo } from 'react';
import { RotationNumber, Phase, PlayerRole, Player, RotationSystem, PlayerPosition, ZoneArea, VariantId } from '@/lib/types';
import { getRotationState } from '@/lib/rotationEngine';

const PHASES: Phase[] = ['serve', 'receive', 'transition'];

export function useRotation(players: Player[], system: RotationSystem, useLibero: boolean = true, variant: VariantId = 'standard') {
  const [currentRotation, setCurrentRotation] = useState<RotationNumber>(1);
  const [currentPhase, setCurrentPhase] = useState<Phase>('serve');
  const [focusedRole, setFocusedRole] = useState<PlayerRole | null>(null);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | null>(null);
  const [showZones, setShowZones] = useState(true);

  const { positions, zones } = useMemo(
    () => getRotationState(players, system, currentRotation, currentPhase, useLibero, variant),
    [players, system, currentRotation, currentPhase, useLibero, variant]
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
    setFocusedPlayerId(null); // clear player-specific focus when using role filter
  }, []);

  const toggleFocusedPlayer = useCallback((playerId: string, role: PlayerRole) => {
    setFocusedPlayerId(prev => {
      if (prev === playerId) {
        // Unfocus: clear both player and role
        setFocusedRole(null);
        return null;
      }
      // Focus on this specific player + set role for zone/info display
      setFocusedRole(role);
      return playerId;
    });
  }, []);

  // Get previous positions for arrows
  const previousPositions = useMemo((): PlayerPosition[] | null => {
    const currentPhaseIndex = PHASES.indexOf(currentPhase);
    if (currentPhaseIndex > 0) {
      const prevPhaseVal = PHASES[currentPhaseIndex - 1];
      return getRotationState(players, system, currentRotation, prevPhaseVal, useLibero, variant).positions;
    }
    // First phase of rotation - show from previous rotation's transition
    if (currentRotation > 1) {
      const prevRot = (currentRotation - 1) as RotationNumber;
      return getRotationState(players, system, prevRot, 'transition', useLibero, variant).positions;
    }
    return null;
  }, [players, system, currentRotation, currentPhase, useLibero, variant]);

  const movedPlayers = useMemo((): number => {
    if (!previousPositions) return 0;
    let count = 0;
    for (const pos of positions) {
      const prev = previousPositions.find(p => p.playerId === pos.playerId);
      if (!prev) continue;
      const dx = Math.abs(pos.position.x - prev.position.x);
      const dy = Math.abs(pos.position.y - prev.position.y);
      if (dx > 0.3 || dy > 0.3) count++;
    }
    return count;
  }, [positions, previousPositions]);

  const nextPhasePositions = useMemo((): PlayerPosition[] | null => {
    const currentPhaseIndex = PHASES.indexOf(currentPhase);
    if (currentPhaseIndex < PHASES.length - 1) {
      const nextPhaseVal = PHASES[currentPhaseIndex + 1];
      return getRotationState(players, system, currentRotation, nextPhaseVal, useLibero, variant).positions;
    }
    if (currentRotation < 6) {
      const nextRot = (currentRotation + 1) as RotationNumber;
      return getRotationState(players, system, nextRot, 'serve', useLibero, variant).positions;
    }
    return null;
  }, [players, system, currentRotation, currentPhase, useLibero, variant]);

  return {
    currentRotation,
    currentPhase,
    focusedRole,
    focusedPlayerId,
    showZones,
    positions,
    zones,
    previousPositions,
    movedPlayers,
    nextPhasePositions,
    setCurrentRotation,
    setCurrentPhase,
    setShowZones,
    stepForward,
    stepBackward,
    nextRotation,
    toggleFocusedRole,
    toggleFocusedPlayer,
  };
}
