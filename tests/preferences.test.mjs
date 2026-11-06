import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const modulePath = require.resolve('../.test-build/lib/preferences.js');
const key = 'vball-preferences';
const defaults = {
  tokenDisplayMode: 'role', learnMode: false, reduceMotion: false,
  courtFlipped: false, dismissedHelp: [], onboardingSeen: false,
};

// Exercise the real persistence module. Only the browser's storage and media
// boundary are replaced; restore globals even when a regression test fails.
function browser(t, entries = {}, options = {}) {
  const data = new Map(Object.entries(entries));
  const storage = {
    getItem: name => data.get(name) ?? null,
    setItem: (name, value) => data.set(name, String(value)),
  };
  const env = { localStorage: storage, matchMedia: () => ({ matches: false }), ...options };
  for (const [name, descriptor] of Object.entries({
    window: { value: env, configurable: true, writable: true },
    localStorage: { get: () => env.localStorage, configurable: true },
  })) {
    const original = Object.getOwnPropertyDescriptor(globalThis, name);
    Object.defineProperty(globalThis, name, descriptor);
    t.after(() => {
      if (original) Object.defineProperty(globalThis, name, original);
      else delete globalThis[name];
    });
  }
  delete require.cache[modulePath];
  return { ...require(modulePath), data, storage, env };
}

test('server rendering needs neither storage nor media APIs', () => {
  delete require.cache[modulePath];
  const { loadPreferences, savePreferences } = require(modulePath);
  assert.deepEqual(loadPreferences(), defaults);
  assert.doesNotThrow(() => savePreferences(defaults));
});

test('missing preferences use the current system motion setting at load time', t => {
  const { loadPreferences, env } = browser(t);
  env.matchMedia = () => ({ matches: true });
  assert.deepEqual(loadPreferences(), { ...defaults, reduceMotion: true });
  env.matchMedia = () => ({ matches: false });
  assert.deepEqual(loadPreferences(), defaults);
});

test('saved choices round-trip and explicit false overrides the system default', t => {
  const { loadPreferences, savePreferences, data } = browser(t, {}, {
    matchMedia: () => ({ matches: true }),
  });
  const prefs = {
    tokenDisplayMode: 'name', learnMode: true, reduceMotion: false,
    courtFlipped: true, dismissedHelp: ['help-positions'], onboardingSeen: true,
  };
  savePreferences(prefs);
  assert.deepEqual(JSON.parse(data.get(key)), prefs);
  assert.deepEqual(loadPreferences(), prefs);
});

test('older partial preferences keep valid fields and fill missing defaults', t => {
  const { loadPreferences } = browser(t, { [key]: '{"tokenDisplayMode":"jersey","learnMode":true}' });
  assert.deepEqual(loadPreferences(), { ...defaults, tokenDisplayMode: 'jersey', learnMode: true });
});

test('malformed JSON and non-object records fall back without leaking fields', t => {
  const { loadPreferences, data } = browser(t);
  for (const raw of ['{broken', 'null', 'true', '12', '"old"', '["old"]']) {
    data.set(key, raw);
    assert.deepEqual(loadPreferences(), defaults, raw);
  }
});

test('invalid stored types cannot break help rendering or enable boolean settings', t => {
  const { loadPreferences } = browser(t, { [key]: JSON.stringify({
    tokenDisplayMode: 'unknown', learnMode: 'false', reduceMotion: 1,
    courtFlipped: null, dismissedHelp: null, onboardingSeen: 'yes',
  }) });
  const prefs = loadPreferences();
  // Home renders these help checks immediately after preference hydration.
  assert.doesNotThrow(() => prefs.dismissedHelp.includes('help-positions'));
  assert.deepEqual(prefs, defaults);
});

test('mixed help records retain string ids and unrelated valid settings', t => {
  const { loadPreferences } = browser(t, { [key]: JSON.stringify({
    courtFlipped: true, dismissedHelp: ['help-positions', null, 5, {}, 'help-phases'],
  }) });
  assert.deepEqual(loadPreferences(), {
    ...defaults, courtFlipped: true, dismissedHelp: ['help-positions', 'help-phases'],
  });
});

test('unknown and prototype-shaped fields do not become preferences', t => {
  const { loadPreferences } = browser(t, {
    [key]: '{"extra":true,"__proto__":{"polluted":true},"learnMode":true}',
  });
  assert.deepEqual(loadPreferences(), { ...defaults, learnMode: true });
});

test('fallback help arrays are independent between loads', t => {
  const { loadPreferences } = browser(t);
  loadPreferences().dismissedHelp.push('help-positions');
  assert.deepEqual(loadPreferences(), defaults);
});

test('denied storage reads return usable defaults', t => {
  const { loadPreferences, storage } = browser(t);
  storage.getItem = () => { throw new DOMException('Denied', 'SecurityError'); };
  assert.deepEqual(loadPreferences(), defaults);
});

test('quota and denied storage access do not turn a preference save into an app error', t => {
  const { savePreferences, storage, env } = browser(t);
  storage.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  assert.doesNotThrow(() => savePreferences(defaults));
  Object.defineProperty(env, 'localStorage', {
    get() { throw new DOMException('Denied', 'SecurityError'); },
  });
  assert.doesNotThrow(() => savePreferences(defaults));
});

test('legacy onboarding migrates once and an existing modern record takes precedence', t => {
  const { loadPreferences, data } = browser(t, { 'vball-onboarding-seen': 'true' });
  const migrated = { ...defaults, onboardingSeen: true };
  assert.deepEqual(loadPreferences(), migrated);
  assert.deepEqual(JSON.parse(data.get(key)), migrated);
  data.set(key, JSON.stringify(defaults));
  assert.deepEqual(loadPreferences(), defaults);
});

test('failed migration writes still honor the existing onboarding flag', t => {
  const { loadPreferences, storage } = browser(t, { 'vball-onboarding-seen': 'true' });
  storage.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  assert.deepEqual(loadPreferences(), { ...defaults, onboardingSeen: true });
});
