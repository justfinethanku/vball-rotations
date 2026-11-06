import { UserPreferences } from './types';

const STORAGE_KEY = 'vball-preferences';

const defaultPreferences = (): UserPreferences => ({
  tokenDisplayMode: 'role',
  learnMode: false,
  reduceMotion: typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  courtFlipped: false,
  dismissedHelp: [],
  onboardingSeen: false,
});

export function loadPreferences(): UserPreferences {
  const defaults = defaultPreferences();
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate old onboarding flag
      if (window.localStorage.getItem('vball-onboarding-seen')) {
        const prefs = { ...defaults, onboardingSeen: true };
        savePreferences(prefs);
        return prefs;
      }
      return defaults;
    }
    const saved: unknown = JSON.parse(raw);
    if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
    const values = saved as Record<string, unknown>;
    // Storage can contain old or malformed data. Keep only fields the UI can
    // consume, preserving valid choices instead of discarding the whole record.
    return {
      tokenDisplayMode: values.tokenDisplayMode === 'jersey' || values.tokenDisplayMode === 'role' || values.tokenDisplayMode === 'name'
        ? values.tokenDisplayMode : defaults.tokenDisplayMode,
      learnMode: typeof values.learnMode === 'boolean' ? values.learnMode : defaults.learnMode,
      reduceMotion: typeof values.reduceMotion === 'boolean' ? values.reduceMotion : defaults.reduceMotion,
      courtFlipped: typeof values.courtFlipped === 'boolean' ? values.courtFlipped : defaults.courtFlipped,
      dismissedHelp: Array.isArray(values.dismissedHelp)
        ? values.dismissedHelp.filter((id): id is string => typeof id === 'string') : [],
      onboardingSeen: typeof values.onboardingSeen === 'boolean' ? values.onboardingSeen : defaults.onboardingSeen,
    };
  } catch {
    return defaults;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Persistence is optional: restricted or full storage must not interrupt
    // the in-memory settings or hide the migrated onboarding flag.
  }
}
