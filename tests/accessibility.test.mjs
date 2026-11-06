import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadSource } from './loadSource.mjs';

const { default: PlayerToken } = loadSource('components/court/PlayerToken');
const { ROLE_COLORS } = loadSource('lib/constants');
const { PlayerCard } = loadSource('components/setup/PlayerCard');
const render = (component, props) => renderToStaticMarkup(React.createElement(component, props));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(v => parseInt(v, 16) / 255)
    .map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return channels.reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
}

test('every rendered role token has readable small text and static tokens are not buttons', () => {
  for (const [role, background] of Object.entries(ROLE_COLORS)) {
    const html = render(PlayerToken, { name: 'Player', number: 7, role, position: { x: 1, y: 1 }, isFocused: false, isDimmed: false, displayMode: 'jersey' });
    assert.match(html, /role="img"/);
    assert.doesNotMatch(html, /role="button"|tabindex/);
    const foreground = html.match(/<text[^>]*fill="(#[a-fA-F0-9]{6})"/)[1];
    const levels = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
    assert.ok((levels[1] + 0.05) / (levels[0] + 0.05) >= 4.5, role);
  }
});

test('player editor fields have associated, distinct labels across repeated cards', () => {
  const player = { id: 'p', name: 'Setter', role: 'setter', number: 1 };
  const html = renderToStaticMarkup(React.createElement('div', null,
    React.createElement(PlayerCard, { player, onUpdate() {} }),
    React.createElement(PlayerCard, { player: { ...player, id: 'p2' }, onUpdate() {} })));
  const controls = [...html.matchAll(/<(?:input|select)\b[^>]*id="([^"]+)"/g)].map(m => m[1]);
  assert.equal(controls.length, 6);
  assert.equal(new Set(controls).size, 6);
  for (const id of controls) assert.ok(html.includes(`for="${id}"`));
});
