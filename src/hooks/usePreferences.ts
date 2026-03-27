'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserPreferences, TokenDisplayMode } from '@/lib/types';
import { loadPreferences, savePreferences } from '@/lib/preferences';

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const setTokenDisplayMode = useCallback((mode: TokenDisplayMode) => {
    setPrefs(p => ({ ...p, tokenDisplayMode: mode }));
  }, []);

  const toggleLearnMode = useCallback(() => {
    setPrefs(p => ({ ...p, learnMode: !p.learnMode }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setPrefs(p => ({ ...p, reduceMotion: !p.reduceMotion }));
  }, []);

  const toggleCourtFlipped = useCallback(() => {
    setPrefs(p => ({ ...p, courtFlipped: !p.courtFlipped }));
  }, []);

  const dismissHelp = useCallback((id: string) => {
    setPrefs(p => ({
      ...p,
      dismissedHelp: [...new Set([...p.dismissedHelp, id])],
    }));
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setPrefs(p => ({ ...p, onboardingSeen: true }));
  }, []);

  const cycleTokenDisplayMode = useCallback(() => {
    setPrefs(p => {
      const modes: TokenDisplayMode[] = ['jersey', 'role', 'name'];
      const idx = modes.indexOf(p.tokenDisplayMode);
      return { ...p, tokenDisplayMode: modes[(idx + 1) % modes.length] };
    });
  }, []);

  return {
    ...prefs,
    setTokenDisplayMode,
    toggleLearnMode,
    toggleReduceMotion,
    toggleCourtFlipped,
    dismissHelp,
    markOnboardingSeen,
    cycleTokenDisplayMode,
  };
}
