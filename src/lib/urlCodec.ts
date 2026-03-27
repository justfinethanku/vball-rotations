import lzString from 'lz-string';
import { Team } from './types';

export function encodeTeam(team: Team): string {
  const json = JSON.stringify(team);
  return lzString.compressToEncodedURIComponent(json);
}

export function decodeTeam(encoded: string): Team | null {
  try {
    const json = lzString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as Team;
  } catch {
    return null;
  }
}
