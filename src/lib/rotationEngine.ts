import { Player, RotationNumber, Phase, RotationSystem, PlayerPosition, ZoneArea, VariantId } from './types';
import { rotations51, RoleKey51 } from '@/data/rotations-5-1';
import { rotations62, RoleKey62 } from '@/data/rotations-6-2';
import { rotations51Spread } from '@/data/rotations-5-1-spread';
import { rotations51Slide } from '@/data/rotations-5-1-slide';
import { rotations51Reverse } from '@/data/rotations-5-1-reverse';

const VARIANT_DATA: Record<VariantId, typeof rotations51> = {
  standard: rotations51,
  spread: rotations51Spread,
  slide: rotations51Slide,
  reverse: rotations51Reverse,
};

function mapPlayersToRoles51(players: Player[]): Record<RoleKey51, Player | undefined> {
  const mapping: Partial<Record<RoleKey51, Player>> = {};
  const setters = players.filter(p => p.role === 'setter');
  const outsides = players.filter(p => p.role === 'outside');
  const middles = players.filter(p => p.role === 'middle');
  const opposites = players.filter(p => p.role === 'opposite');
  const liberos = players.filter(p => p.role === 'libero');

  if (setters[0]) mapping['S'] = setters[0];
  if (outsides[0]) mapping['OH1'] = outsides[0];
  if (outsides[1]) mapping['OH2'] = outsides[1];
  if (middles[0]) mapping['MB1'] = middles[0];
  if (middles[1]) mapping['MB2'] = middles[1];
  if (opposites[0]) mapping['OPP'] = opposites[0];
  if (liberos[0]) mapping['L'] = liberos[0];

  return mapping as Record<RoleKey51, Player | undefined>;
}

function mapPlayersToRoles62(players: Player[]): Record<RoleKey62, Player | undefined> {
  const mapping: Partial<Record<RoleKey62, Player>> = {};
  const setters = players.filter(p => p.role === 'setter');
  const outsides = players.filter(p => p.role === 'outside');
  const middles = players.filter(p => p.role === 'middle');
  const liberos = players.filter(p => p.role === 'libero');

  if (setters[0]) mapping['S1'] = setters[0];
  if (setters[1]) mapping['S2'] = setters[1];
  if (outsides[0]) mapping['OH1'] = outsides[0];
  if (outsides[1]) mapping['OH2'] = outsides[1];
  if (middles[0]) mapping['MB1'] = middles[0];
  if (middles[1]) mapping['MB2'] = middles[1];
  if (liberos[0]) mapping['L'] = liberos[0];

  return mapping as Record<RoleKey62, Player | undefined>;
}

export function getRotationState(
  players: Player[],
  system: RotationSystem,
  rotation: RotationNumber,
  phase: Phase,
  useLibero: boolean = true,
  variant: VariantId = 'standard'
): { positions: PlayerPosition[]; zones: ZoneArea[] } {
  const positions: PlayerPosition[] = [];
  const zones: ZoneArea[] = [];

  if (system === '5-1') {
    const rotationData = VARIANT_DATA[variant] || rotations51;
    const data = rotationData[rotation][phase];
    const playerMap = mapPlayersToRoles51(players);
    const hasLibero = !!playerMap['L'];

    // Determine which MB the libero replaces (the one sharing position with L)
    const liberoPos = data.positions['L'];
    let backRowMB: RoleKey51 | null = null;
    if (hasLibero && useLibero && liberoPos) {
      for (const mbKey of ['MB1', 'MB2'] as RoleKey51[]) {
        const mbPos = data.positions[mbKey];
        if (mbPos && Math.abs(mbPos.x - liberoPos.x) < 1.5 && Math.abs(mbPos.y - liberoPos.y) < 1.5) {
          backRowMB = mbKey;
          break;
        }
      }
    }

    for (const [roleKey, courtPos] of Object.entries(data.positions)) {
      // Skip the back-row MB when libero replaces them
      if (roleKey === backRowMB) continue;
      // Skip libero when useLibero is disabled
      if (roleKey === 'L' && !useLibero) continue;
      const player = playerMap[roleKey as RoleKey51];
      if (player) {
        positions.push({
          playerId: player.id,
          role: player.role,
          position: courtPos,
        });
      }
    }

    for (const zone of data.zones) {
      if (zone.role === 'L' && !useLibero) continue;
      const player = playerMap[zone.role as RoleKey51];
      if (player) {
        zones.push({
          playerId: player.id,
          role: player.role,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          label: zone.label,
        });
      }
    }
  } else {
    const data = rotations62[rotation][phase];
    const playerMap = mapPlayersToRoles62(players);
    const hasLibero = !!playerMap['L'];

    for (const [roleKey, courtPos] of Object.entries(data.positions)) {
      // Skip MB that libero replaces in back row
      if ((roleKey === 'MB1' || roleKey === 'MB2') && hasLibero) {
        // Check if this MB position overlaps with libero (same spot = replaced)
        const liberoPos = data.positions['L'];
        if (liberoPos && Math.abs(courtPos.x - liberoPos.x) < 1 && Math.abs(courtPos.y - liberoPos.y) < 1) {
          continue;
        }
      }
      const player = playerMap[roleKey as RoleKey62];
      if (player) {
        positions.push({
          playerId: player.id,
          role: player.role,
          position: courtPos,
        });
      }
    }

    for (const zone of data.zones) {
      const player = playerMap[zone.role as RoleKey62];
      if (player) {
        zones.push({
          playerId: player.id,
          role: player.role,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
          label: zone.label,
        });
      }
    }
  }

  return { positions, zones };
}
