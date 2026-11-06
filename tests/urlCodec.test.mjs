import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';
import lzString from 'lz-string';

const require = createRequire(import.meta.url);
const { decodeTeam, encodeTeam } = require('../.test-build/urlCodec.js');

function team(system = '5-1') {
  const roles = system === '5-1'
    ? ['setter', 'outside', 'outside', 'middle', 'middle', 'opposite', 'libero']
    : ['setter', 'setter', 'outside', 'outside', 'middle', 'middle', 'libero'];
  return {
    name: 'Équipe 🏐', system, useLibero: false,
    players: roles.map((role, index) => ({
      id: `player-${index}`, name: `Player ${index}`, number: index,
      role, avatar: 'default',
    })),
  };
}

const pack = value => lzString.compressToEncodedURIComponent(JSON.stringify(value));

test('both rotation systems round-trip customized teams', () => {
  for (const system of ['5-1', '6-2']) {
    const original = team(system);
    original.players[0].role = 'ds'; // The settings UI permits role customization.
    original.players[0].number = 999;
    original.players[0].name = '<img src=x onerror=alert(1)> & 🏐';
    assert.deepEqual(decodeTeam(encodeTeam(original)), original);
  }
});

test('legacy links without a libero setting keep the previous default', () => {
  const original = team();
  delete original.useLibero;
  assert.deepEqual(decodeTeam(pack(original)), { ...original, useLibero: true });
});

test('malformed shared links cannot deliver a non-array to the rotation engine', () => {
  for (const value of [null, true, 1, 'team', [], {},
    { ...team(), players: null }, { ...team(), players: {} },
    { ...team(), players: [null] }]) {
    assert.equal(decodeTeam(pack(value)), null);
  }
});

test('team and player fields are checked before entering React state', () => {
  for (const patch of [
    { system: 'unknown' }, { system: { value: '5-1' } },
    { name: {} }, { name: 'x'.repeat(101) }, { useLibero: 'false' },
    { players: [] }, { players: Array(8).fill(team().players[0]) },
  ]) {
    assert.equal(decodeTeam(pack({ ...team(), ...patch })), null);
  }
  for (const patch of [
    { id: '' }, { id: {} }, { id: 'x'.repeat(65) },
    { name: {} }, { name: 'x'.repeat(81) },
    { number: -1 }, { number: 1000 }, { number: 1.5 }, { number: '1' },
    { role: '__proto__' }, { role: 'constructor' }, { role: 'unknown' },
    { avatar: null }, { avatar: 'x'.repeat(65) },
  ]) {
    const value = team();
    value.players[0] = { ...value.players[0], ...patch };
    assert.equal(decodeTeam(pack(value)), null, JSON.stringify(patch));
  }
  const duplicate = team();
  duplicate.players[1].id = duplicate.players[0].id;
  assert.equal(decodeTeam(pack(duplicate)), null);
});

test('unknown data is discarded, including prototype-shaped keys', () => {
  const value = team();
  value.players[0].extra = { unwanted: true };
  const payload = JSON.parse(JSON.stringify({ ...value, extra: true }));
  Object.defineProperty(payload, '__proto__', { value: { polluted: true }, enumerable: true });
  const decoded = decodeTeam(pack(payload));
  assert.deepEqual(decoded, team());
  assert.equal(Object.hasOwn(decoded, '__proto__'), false);
  assert.equal(Object.hasOwn(decoded.players[0], 'extra'), false);
});

test('bad and oversized encodings are rejected before decompression', () => {
  const original = lzString.decompressFromEncodedURIComponent;
  let calls = 0;
  lzString.decompressFromEncodedURIComponent = () => { calls++; return '{}'; };
  try {
    for (const encoded of ['', '%not-a-share', 'A'.repeat(4097)]) {
      assert.equal(decodeTeam(encoded), null);
    }
    assert.equal(calls, 0);
  } finally {
    lzString.decompressFromEncodedURIComponent = original;
  }
});

test('invalid JSON and oversized expanded JSON are rejected', () => {
  assert.equal(decodeTeam(lzString.compressToEncodedURIComponent('{broken')), null);
  const expanded = JSON.stringify({ ...team(), padding: 'x'.repeat(9000) });
  const encoded = lzString.compressToEncodedURIComponent(expanded);
  assert.ok(encoded.length < 4096, 'compressed input fits the input budget');
  assert.equal(decodeTeam(encoded), null);
});

test('maximum supported text fields still round-trip', () => {
  const value = team();
  value.name = '🏐'.repeat(50);
  for (const player of value.players) {
    player.name = 'é'.repeat(80);
    player.avatar = 'a'.repeat(64);
    player.id += 'i'.repeat(64 - player.id.length);
  }
  assert.deepEqual(decodeTeam(encodeTeam(value)), value);
});

test('share generation rejects data that could not be loaded safely', () => {
  const invalid = team();
  invalid.name = 'x'.repeat(101);
  assert.throws(() => encodeTeam(invalid), /team/i);
});
