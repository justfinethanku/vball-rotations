'use client';

import { useEffect, useCallback } from 'react';
import { Team } from '@/lib/types';
import { encodeTeam, decodeTeam } from '@/lib/urlCodec';

export function useUrlState(
  getTeam: () => Team,
  onLoadTeam: (team: Team) => void
) {
  // Load team from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash.startsWith('#data=')) {
      const encoded = hash.slice(6);
      const team = decodeTeam(encoded);
      if (team) {
        onLoadTeam(team);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const shareUrl = useCallback(async (): Promise<string> => {
    const team = getTeam();
    const encoded = encodeTeam(team);
    const url = `${window.location.origin}${window.location.pathname}#data=${encoded}`;

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Clipboard API not available
    }

    return url;
  }, [getTeam]);

  return { shareUrl };
}
