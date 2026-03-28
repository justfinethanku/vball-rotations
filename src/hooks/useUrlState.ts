'use client';

import { useCallback } from 'react';
import { Team } from '@/lib/types';
import { encodeTeam } from '@/lib/urlCodec';

export function useUrlState(
  getTeam: () => Team
) {
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
