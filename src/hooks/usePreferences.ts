'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserPreferences, TokenDisplayMode } from '@/lib/types';
import { loadPreferences, savePreferences } from '@/lib/preferences';

const DEFAULTS: UserPreferences = {
  tokenDisplayMode: 'role',
  learnMode: false,
  reduceMotion: false,
  courtFlipped: false,
  dismissedHelp: [],
  onboardingSeen: false,
};

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULTS);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration: must load localStorage after mount
    setPrefs(loadPreferences());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) savePreferences(prefs);
  }, [prefs, hydrated]);

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
