'use client';

import { useState, useCallback } from 'react';
import { Player, RotationSystem, Team, VariantId } from '@/lib/types';
import { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';

export function useTeam(initialTeam?: Team) {
  const [system, setSystem] = useState<RotationSystem>(initialTeam?.system ?? '5-1');
  const [players, setPlayers] = useState<Player[]>(
    initialTeam?.players ?? [...DEFAULT_PLAYERS]
  );
  const [teamName, setTeamName] = useState(initialTeam?.name ?? 'My Team');
  const [useLibero, setUseLibero] = useState(initialTeam?.useLibero ?? true);
  const [variant, setVariant] = useState<VariantId>('standard');

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const switchSystem = useCallback((newSystem: RotationSystem) => {
    setSystem(newSystem);
    setPlayers(prev => {
      const byRole: Record<string, Player[]> = {};
      for (const p of prev) {
        if (!byRole[p.role]) byRole[p.role] = [];
        byRole[p.role].push(p);
      }

      const defaults = newSystem === '6-2' ? DEFAULT_PLAYERS_62 : DEFAULT_PLAYERS;
      const used = new Set<string>();

      return defaults.map(def => {
        const candidates = byRole[def.role] || [];
        const reuse = candidates.find(c => !used.has(c.id));
        if (reuse) {
          used.add(reuse.id);
          return { ...reuse, id: def.id };
        }
        return { ...def };
      });
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
    variant,
    setVariant,
  };
}
