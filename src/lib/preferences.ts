import { UserPreferences, TokenDisplayMode } from './types';

const STORAGE_KEY = 'vball-preferences';

const DEFAULTS: UserPreferences = {
  tokenDisplayMode: 'role',
  learnMode: false,
  reduceMotion: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  courtFlipped: false,
  dismissedHelp: [],
  onboardingSeen: false,
};

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate old onboarding flag
      if (localStorage.getItem('vball-onboarding-seen')) {
        const prefs = { ...DEFAULTS, onboardingSeen: true };
        savePreferences(prefs);
        return prefs;
      }
      return { ...DEFAULTS };
    }
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
