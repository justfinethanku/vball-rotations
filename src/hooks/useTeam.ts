'use client';

import { useState, useCallback } from 'react';
import { Player, RotationSystem, Team } from '@/lib/types';
import { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';

export function useTeam(initialTeam?: Team) {
  const [system, setSystem] = useState<RotationSystem>(initialTeam?.system ?? '5-1');
  const [players, setPlayers] = useState<Player[]>(
    initialTeam?.players ?? [...DEFAULT_PLAYERS]
  );
  const [teamName, setTeamName] = useState(initialTeam?.name ?? 'My Team');

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const switchSystem = useCallback((newSystem: RotationSystem) => {
    setSystem(newSystem);
    if (newSystem === '6-2') {
      setPlayers([...DEFAULT_PLAYERS_62]);
    } else {
      setPlayers([...DEFAULT_PLAYERS]);
    }
  }, []);

  const getTeam = useCallback((): Team => ({
    name: teamName,
    system,
    players,
  }), [teamName, system, players]);

  return {
    system,
    players,
    teamName,
    setTeamName,
    updatePlayer,
    switchSystem,
    getTeam,
    setPlayers,
  };
}
