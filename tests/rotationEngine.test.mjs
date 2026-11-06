import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { getRotationState } = require('../.test-build/lib/rotationEngine.js');
const { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } = require('../.test-build/lib/constants.js');
const phases = ['serve', 'receive', 'transition'];
const variants = ['standard', 'spread', 'slide', 'reverse'];
const byId = state => Object.fromEntries(state.positions.map(p => [p.playerId, p.position]));

test('5-1 maps the roster to court slots and marks the substituted middle', () => {
  const state = getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'serve');
  assert.deepEqual(byId(state), {
    s1: { x: 7.5, y: 8.5 }, opp: { x: 7.5, y: 2 },
    mb1: { x: 4.5, y: 2 }, oh1: { x: 1.5, y: 2 },
    oh2: { x: 1.5, y: 7 }, lib: { x: 4.5, y: 7 },
  });
  assert.deepEqual(state.zones.find(z => z.isSubstituted), {
    playerId: 'mb2', role: 'middle', x: 3, y: 4.5,
    width: 3, height: 4.5, label: 'Off Court (Libero Sub)', isSubstituted: true,
  });
});

test('disabling the 5-1 libero restores both middles for every formation', () => {
  for (const variant of variants) for (let rotation = 1; rotation <= 6; rotation++) for (const phase of phases) {
    const state = getRotationState(DEFAULT_PLAYERS, '5-1', rotation, phase, false, variant);
    assert.equal(state.positions.length, 6);
    assert.deepEqual(new Set(state.positions.map(p => p.playerId)), new Set(['s1', 'opp', 'oh1', 'oh2', 'mb1', 'mb2']));
    assert.ok(state.zones.every(z => z.role !== 'libero' && !z.isSubstituted));
  }
});

test('6-2 preserves its two-setter and always-use-available-libero policy', () => {
  const state = getRotationState(DEFAULT_PLAYERS_62, '6-2', 1, 'serve', false, 'reverse');
  assert.deepEqual(byId(state), {
    s1: { x: 7.5, y: 8.5 }, s2: { x: 1.5, y: 2 },
    oh1: { x: 7.5, y: 2 }, oh2: { x: 1.5, y: 7 },
    mb1: { x: 4.5, y: 2 }, lib: { x: 4.5, y: 7 },
  });
  assert.equal(state.zones.find(z => z.isSubstituted)?.playerId, 'mb2');
  for (let rotation = 1; rotation <= 6; rotation++) for (const phase of phases) {
    const expected = getRotationState(DEFAULT_PLAYERS_62, '6-2', rotation, phase);
    for (const variant of variants) {
      assert.deepEqual(getRotationState(DEFAULT_PLAYERS_62, '6-2', rotation, phase, false, variant), expected);
    }
  }
});

test('missing libero never removes a middle and missing players leave empty slots', () => {
  for (const [system, roster] of [['5-1', DEFAULT_PLAYERS], ['6-2', DEFAULT_PLAYERS_62]]) {
    const withoutLibero = roster.filter(p => p.role !== 'libero');
    for (let rotation = 1; rotation <= 6; rotation++) for (const phase of phases) {
      const state = getRotationState(withoutLibero, system, rotation, phase);
      assert.equal(state.positions.length, 6);
      assert.ok(state.positions.some(p => p.playerId === 'mb1'));
      assert.ok(state.positions.some(p => p.playerId === 'mb2'));
      assert.ok(state.zones.every(z => !z.isSubstituted));
      assert.deepEqual(getRotationState([], system, rotation, phase), { positions: [], zones: [] });
    }
  }
  const onlyMiddle = DEFAULT_PLAYERS.filter(p => p.id === 'mb2');
  // The first remaining middle occupies MB1 regardless of its original id.
  assert.deepEqual(byId(getRotationState(onlyMiddle, '5-1', 1, 'serve')), { mb2: { x: 4.5, y: 2 } });
});

test('role order, rather than default ids or jersey metadata, assigns duplicate roles', () => {
  const custom = [...DEFAULT_PLAYERS_62].reverse().map((p, i) => ({ ...p, id: `custom-${i}`, name: 'Custom', number: 99 }));
  const state = getRotationState(custom, '6-2', 1, 'serve', false);
  const setterIds = custom.filter(p => p.role === 'setter').map(p => p.id);
  assert.deepEqual(byId(state)[setterIds[0]], { x: 7.5, y: 8.5 });
  assert.deepEqual(byId(state)[setterIds[1]], { x: 1.5, y: 2 });
  assert.ok(state.positions.every(p => p.playerId.startsWith('custom-')));
  const extras = [...DEFAULT_PLAYERS, { ...DEFAULT_PLAYERS[0], id: 'extra-setter' }, { ...DEFAULT_PLAYERS[0], id: 'ds', role: 'ds' }];
  assert.deepEqual(getRotationState(extras, '5-1', 1, 'serve'), getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'serve'));
});

test('5-1 variants retain distinct coordinates and unknown variants fall back to standard', () => {
  const standard = getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'transition', false);
  const spread = getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'transition', false, 'spread');
  const slide = getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'transition', false, 'slide');
  const reverse = getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'receive', false, 'reverse');
  assert.notDeepEqual(byId(spread).oh1, byId(standard).oh1);
  assert.equal(byId(slide).mb1.x, 8.5);
  assert.equal(byId(slide).mb1.y, 1.5);
  assert.deepEqual(byId(reverse).s1, { x: 2, y: 4 });
  assert.deepEqual(getRotationState(DEFAULT_PLAYERS, '5-1', 1, 'transition', false, 'unknown'), standard);
});

test('deriving positions and zones does not mutate a customized roster', () => {
  const players = DEFAULT_PLAYERS.map(p => Object.freeze({ ...p }));
  Object.freeze(players);
  const before = JSON.stringify(players);
  for (const variant of variants) for (let rotation = 1; rotation <= 6; rotation++) for (const phase of phases) {
    getRotationState(players, '5-1', rotation, phase, true, variant);
    getRotationState(players, '5-1', rotation, phase, false, variant);
  }
  assert.equal(JSON.stringify(players), before);
});
