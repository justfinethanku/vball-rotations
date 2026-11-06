import { Player, PlayerRole, RotationNumber, Phase, RotationSystem, PlayerPosition, ZoneArea, VariantId } from './types';
import { rotations51, RoleKey51 } from '../data/rotations-5-1';
import { rotations62, RoleKey62 } from '../data/rotations-6-2';
import { rotations51Spread } from '../data/rotations-5-1-spread';
import { rotations51Slide } from '../data/rotations-5-1-slide';
import { rotations51Reverse } from '../data/rotations-5-1-reverse';

const VARIANT_DATA: Record<VariantId, typeof rotations51> = {
  standard: rotations51,
  spread: rotations51Spread,
  slide: rotations51Slide,
  reverse: rotations51Reverse,
};

type RoleKey = RoleKey51 | RoleKey62;

// Each formation slot takes the nth player of its role in roster order.
const ROLE_SLOTS: Record<RotationSystem, [RoleKey, PlayerRole, number][]> = {
  '5-1': [
    ['S', 'setter', 0], ['OH1', 'outside', 0], ['OH2', 'outside', 1],
    ['MB1', 'middle', 0], ['MB2', 'middle', 1], ['OPP', 'opposite', 0], ['L', 'libero', 0],
  ],
  '6-2': [
    ['S1', 'setter', 0], ['S2', 'setter', 1], ['OH1', 'outside', 0], ['OH2', 'outside', 1],
    ['MB1', 'middle', 0], ['MB2', 'middle', 1], ['L', 'libero', 0],
  ],
};

function mapPlayersToRoles(players: Player[], system: RotationSystem): Partial<Record<RoleKey, Player>> {
  const byRole: Partial<Record<PlayerRole, Player[]>> = {};
  for (const player of players) {
    (byRole[player.role] ??= []).push(player);
  }

  const mapping: Partial<Record<RoleKey, Player>> = {};
  for (const [slot, role, index] of ROLE_SLOTS[system]) {
    mapping[slot] = byRole[role]?.[index];
  }
  return mapping;
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
  const data = system === '5-1'
    ? (VARIANT_DATA[variant] || rotations51)[rotation][phase]
    : rotations62[rotation][phase];
  const playerMap = mapPlayersToRoles(players, system);

  // The settings toggle applies only to 5-1; 6-2 always uses an available libero.
  const liberoEnabled = system === '6-2' || useLibero;
  const substitutionDistance = system === '5-1' ? 1.5 : 1;
  const liberoPos = data.positions.L;
  let backRowMB: 'MB1' | 'MB2' | null = null;
  if (playerMap.L && liberoEnabled && liberoPos) {
    for (const mbKey of ['MB1', 'MB2'] as const) {
      const mbPos = data.positions[mbKey];
      if (mbPos && Math.abs(mbPos.x - liberoPos.x) < substitutionDistance && Math.abs(mbPos.y - liberoPos.y) < substitutionDistance) {
        backRowMB = mbKey;
        break;
      }
    }
  }

  for (const [roleKey, courtPos] of Object.entries(data.positions)) {
    if (roleKey === backRowMB || (roleKey === 'L' && !liberoEnabled)) continue;
    const player = playerMap[roleKey as RoleKey];
    if (player) {
      positions.push({ playerId: player.id, role: player.role, position: courtPos });
    }
  }

  for (const zone of data.zones) {
    if (zone.role === 'L' && !liberoEnabled) continue;
    const player = playerMap[zone.role];
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

  // Retain an informational zone for the middle replaced by the libero.
  if (backRowMB) {
    const liberoZone = data.zones.find(z => z.role === 'L');
    const mbPlayer = playerMap[backRowMB];
    if (liberoZone && mbPlayer) {
      zones.push({
        playerId: mbPlayer.id,
        role: mbPlayer.role,
        x: liberoZone.x,
        y: liberoZone.y,
        width: liberoZone.width,
        height: liberoZone.height,
        label: 'Off Court (Libero Sub)',
        isSubstituted: true,
      });
    }
  }

  return { positions, zones };
}
