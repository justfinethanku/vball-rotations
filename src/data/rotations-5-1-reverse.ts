import { RotationNumber, Phase } from '@/lib/types';
import { RotationData } from './rotations-5-1';
import { rotations51 as standard } from './rotations-5-1';

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const rotations51Reverse: RotationMap = (() => {
  const data = deepClone(standard);
  for (const rot of [1, 2, 3, 4, 5, 6] as RotationNumber[]) {
    const trans = data[rot].transition;
    const recv = data[rot].receive;

    // Setter penetrates to left side (zone 4) instead of right
    if (trans.positions.S.y <= 3) {
      trans.positions.S.x = 2;
    } else if (trans.positions.S.y <= 4) {
      trans.positions.S.x = 2;
      trans.positions.S.y = 2;
    }

    if (recv.positions.S.y > 3) {
      recv.positions.S.x = 2;
      recv.positions.S.y = Math.min(recv.positions.S.y, 4);
    }
  }
  return data;
})();
