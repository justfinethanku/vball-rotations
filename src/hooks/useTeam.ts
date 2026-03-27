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
  const [useLibero, setUseLibero] = useState(initialTeam?.useLibero ?? true);

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const switchSystem = useCallback((newSystem: RotationSystem) => {
    setSystem(newSystem);
    setPlayers(prev => {
      if (newSystem === '6-2') {
        // Switching from 5-1 to 6-2:
        // Keep outsides, middles, libero, first setter; remove opposite; add Setter 2
        const setter = prev.find(p => p.role === 'setter');
        const outsides = prev.filter(p => p.role === 'outside');
        const middles = prev.filter(p => p.role === 'middle');
        const libero = prev.find(p => p.role === 'libero');

        // Find a default for Setter 2 from the 6-2 defaults
        const defaultSetter2 = DEFAULT_PLAYERS_62.find(
          p => p.role === 'setter' && p.id === 'p2'
        )!;

        return [
          setter ?? DEFAULT_PLAYERS_62[0],
          { ...defaultSetter2 },
          ...outsides.length >= 2
            ? outsides.slice(0, 2)
            : [...outsides, ...DEFAULT_PLAYERS_62.filter(p => p.role === 'outside').slice(outsides.length)],
          ...middles.length >= 2
            ? middles.slice(0, 2)
            : [...middles, ...DEFAULT_PLAYERS_62.filter(p => p.role === 'middle').slice(middles.length)],
          libero ?? DEFAULT_PLAYERS_62.find(p => p.role === 'libero')!,
        ];
      } else {
        // Switching from 6-2 to 5-1:
        // Keep first setter, outsides, middles, libero; remove second setter; add Opposite
        const setters = prev.filter(p => p.role === 'setter');
        const firstSetter = setters[0];
        const outsides = prev.filter(p => p.role === 'outside');
        const middles = prev.filter(p => p.role === 'middle');
        const libero = prev.find(p => p.role === 'libero');

        // Find a default for Opposite from the 5-1 defaults
        const defaultOpposite = DEFAULT_PLAYERS.find(p => p.role === 'opposite')!;

        return [
          firstSetter ?? DEFAULT_PLAYERS[0],
          ...outsides.length >= 2
            ? outsides.slice(0, 2)
            : [...outsides, ...DEFAULT_PLAYERS.filter(p => p.role === 'outside').slice(outsides.length)],
          ...middles.length >= 2
            ? middles.slice(0, 2)
            : [...middles, ...DEFAULT_PLAYERS.filter(p => p.role === 'middle').slice(middles.length)],
          { ...defaultOpposite },
          libero ?? DEFAULT_PLAYERS.find(p => p.role === 'libero')!,
        ];
      }
    });
  }, []);

  const getTeam = useCallback((): Team => ({
    name: teamName,
    system,
    players,
    useLibero,
  }), [teamName, system, players, useLibero]);

  return {
    system,
    players,
    teamName,
    setTeamName,
    updatePlayer,
    switchSystem,
    getTeam,
    setPlayers,
    useLibero,
    setUseLibero,
  };
}
