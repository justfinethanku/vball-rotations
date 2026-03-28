import { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from './constants';
import { Team, RotationSystem, VariantId } from './types';

const STORAGE_KEY = 'vball-team';
const DEFAULT_TEAM_NAME = 'My Team';

function isRotationSystem(value: unknown): value is RotationSystem {
  return value === '5-1' || value === '6-2';
}

function isVariantId(value: unknown): value is VariantId {
  return value === 'standard' || value === 'spread' || value === 'slide' || value === 'reverse';
}

function getDefaultPlayers(system: RotationSystem) {
  const defaults = system === '6-2' ? DEFAULT_PLAYERS_62 : DEFAULT_PLAYERS;
  return defaults.map(player => ({ ...player }));
}

export function normalizeTeam(raw?: Partial<Team> | null): Team {
  const system = isRotationSystem(raw?.system) ? raw.system : '5-1';

  return {
    name: typeof raw?.name === 'string' ? raw.name : DEFAULT_TEAM_NAME,
    system,
    players: Array.isArray(raw?.players)
      ? raw.players.map(player => ({ ...player }))
      : getDefaultPlayers(system),
    useLibero: typeof raw?.useLibero === 'boolean' ? raw.useLibero : true,
    variant: isVariantId(raw?.variant) ? raw.variant : 'standard',
  };
}

export function loadStoredTeam(): Team | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeTeam(JSON.parse(raw) as Partial<Team>);
  } catch {
    return null;
  }
}

export function saveStoredTeam(team: Team): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(team));
}
