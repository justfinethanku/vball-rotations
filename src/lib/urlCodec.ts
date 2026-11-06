import lzString from 'lz-string';
import type { Player, PlayerRole, Team } from './types';

// Share links describe a small roster, not arbitrary compressed documents.
const MAX_ENCODED_LENGTH = 4096;
const MAX_JSON_LENGTH = 8192;
const ROLES: readonly PlayerRole[] = ['setter', 'outside', 'opposite', 'middle', 'libero', 'ds'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

function parseTeam(value: unknown): Team | null {
  if (!isRecord(value)
    || !isText(value.name, 100)
    || (value.system !== '5-1' && value.system !== '6-2')
    || (value.useLibero !== undefined && typeof value.useLibero !== 'boolean')
    || !Array.isArray(value.players)
    || value.players.length < 1 || value.players.length > 7) return null;

  const players: Player[] = [];
  const ids = new Set<string>();
  for (const player of value.players) {
    if (!isRecord(player)
      || !isText(player.id, 64) || !player.id || ids.has(player.id)
      || !isText(player.name, 80)
      || typeof player.number !== 'number' || !Number.isInteger(player.number)
      || player.number < 0 || player.number > 999
      || typeof player.role !== 'string' || !ROLES.includes(player.role as PlayerRole)
      || !isText(player.avatar, 64)) return null;

    ids.add(player.id);
    // Copy only known fields so untrusted extras never enter application state.
    players.push({
      id: player.id, name: player.name, number: player.number,
      role: player.role as PlayerRole, avatar: player.avatar,
    });
  }

  return {
    name: value.name, system: value.system, players,
    useLibero: typeof value.useLibero === 'boolean' ? value.useLibero : true,
  };
}

export function encodeTeam(team: Team): string {
  const validated = parseTeam(team);
  if (!validated) throw new Error('Team cannot be shared: invalid team data');
  const json = JSON.stringify(validated);
  if (json.length > MAX_JSON_LENGTH) throw new Error('Team is too large to share');
  const encoded = lzString.compressToEncodedURIComponent(json);
  if (encoded.length > MAX_ENCODED_LENGTH) throw new Error('Team is too large to share');
  return encoded;
}

export function decodeTeam(encoded: string): Team | null {
  if (!encoded || encoded.length > MAX_ENCODED_LENGTH || !/^[A-Za-z0-9+$-]+$/.test(encoded)) {
    return null;
  }
  try {
    const json = lzString.decompressFromEncodedURIComponent(encoded);
    if (!json || json.length > MAX_JSON_LENGTH) return null;
    return parseTeam(JSON.parse(json));
  } catch {
    return null;
  }
}
