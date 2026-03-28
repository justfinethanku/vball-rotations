'use client';

import { useState, useCallback, useEffect } from 'react';
import { Player, RotationSystem, Team, VariantId } from '@/lib/types';
import { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';
import { decodeTeam } from '@/lib/urlCodec';
import { loadStoredTeam, normalizeTeam, saveStoredTeam } from '@/lib/teamStorage';

export function useTeam(initialTeam?: Team) {
  const fallbackTeam = normalizeTeam(initialTeam);
  const [system, setSystem] = useState<RotationSystem>(fallbackTeam.system);
  const [players, setPlayers] = useState<Player[]>(
    fallbackTeam.players
  );
  const [teamName, setTeamName] = useState(fallbackTeam.name);
  const [useLibero, setUseLibero] = useState(fallbackTeam.useLibero);
  const [variant, setVariant] = useState<VariantId>(fallbackTeam.variant ?? 'standard');
  const [hydrated, setHydrated] = useState(false);

  const applyTeam = useCallback((team: Team) => {
    const normalized = normalizeTeam(team);
    setSystem(normalized.system);
    setPlayers(normalized.players);
    setTeamName(normalized.name);
    setUseLibero(normalized.useLibero);
    setVariant(normalized.variant ?? 'standard');
  }, []);

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
    variant: system === '5-1' ? variant : 'standard',
  }), [teamName, system, players, useLibero, variant]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    /* eslint-disable react-hooks/set-state-in-effect -- hydrate client-only team state from URL/localStorage after mount */
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      const sharedTeam = decodeTeam(hash.slice(6));
      if (sharedTeam) {
        applyTeam(sharedTeam);
        setHydrated(true);
        return;
      }
    }

    const storedTeam = loadStoredTeam();
    if (storedTeam) {
      applyTeam(storedTeam);
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [applyTeam]);

  useEffect(() => {
    if (!hydrated) return;
    saveStoredTeam(getTeam());
  }, [hydrated, getTeam]);

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
