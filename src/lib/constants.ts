import { PlayerRole } from './types';

export const COURT_WIDTH = 9;
export const COURT_DEPTH = 9;
export const ATTACK_LINE_Y = 3;

export const SVG_WIDTH = 450;
export const SVG_HEIGHT = 500;
export const SVG_PADDING = 40;

export const COURT_SVG = {
  x: SVG_PADDING,
  y: SVG_PADDING + 20,
  width: SVG_WIDTH - SVG_PADDING * 2,
  height: SVG_HEIGHT - SVG_PADDING * 2 - 20,
};

export const ROLE_COLORS: Record<PlayerRole, string> = {
  setter: '#EAB308',
  outside: '#3B82F6',
  opposite: '#22C55E',
  middle: '#EF4444',
  libero: '#F97316',
  ds: '#A855F7',
};

export const ROLE_LABELS: Record<PlayerRole, string> = {
  setter: 'Setter',
  outside: 'Outside Hitter',
  opposite: 'Opposite',
  middle: 'Middle Blocker',
  libero: 'Libero',
  ds: 'Defensive Specialist',
};

export const ROLE_SHORT: Record<PlayerRole, string> = {
  setter: 'S',
  outside: 'OH',
  opposite: 'OPP',
  middle: 'MB',
  libero: 'L',
  ds: 'DS',
};

export const SPEED_MS: Record<string, number> = {
  slow: 1200,
  medium: 600,
  fast: 300,
};

export const PHASE_PAUSE_MS = 2000;

export const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Setter', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 'p2', name: 'OH 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'p3', name: 'OH 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'p4', name: 'MB 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'p5', name: 'MB 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'p6', name: 'Opposite', number: 2, role: 'opposite' as const, avatar: 'default' },
  { id: 'p7', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];

export const DEFAULT_PLAYERS_62 = [
  { id: 'p1', name: 'Setter 1', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 'p2', name: 'Setter 2', number: 6, role: 'setter' as const, avatar: 'default' },
  { id: 'p3', name: 'OH 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'p4', name: 'OH 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'p5', name: 'MB 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'p6', name: 'MB 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'p7', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];
