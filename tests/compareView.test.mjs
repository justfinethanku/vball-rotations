import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadSource } from './loadSource.mjs';

const { CompareView } = loadSource('components/compare/CompareView');
const { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } = loadSource('lib/constants');
const { courtToSvg } = loadSource('lib/courtMath');
const defaults = { isOpen: true, onClose: () => {}, players: DEFAULT_PLAYERS, system: '5-1', useLibero: true };
const render = props => renderToStaticMarkup(React.createElement(CompareView, { ...defaults, ...props }));

test('comparison forwards the selected variant to the rendered receive court', () => {
  const reverse = render({ variant: 'reverse' });
  assert.notEqual(reverse, render({ variant: 'standard' }));
  const setterTokens = [...reverse.matchAll(/<g\b[^>]*aria-label="Setter, S, back row"[^>]*>/g)].map(match => match[0]);
  assert.equal(setterTokens.length, 2);
  const svg = courtToSvg({ x: 2, y: 4 });
  assert.ok(setterTokens[1].includes(`translateX(${svg.x}px) translateY(${svg.y}px)`));
});

test('comparison retains the standard default and 6-2 ignores 5-1 variants', () => {
  assert.equal(render({}), render({ variant: 'standard' }));
  const props = { players: DEFAULT_PLAYERS_62, system: '6-2' };
  assert.equal(render({ ...props, variant: 'reverse' }), render({ ...props, variant: 'standard' }));
});
