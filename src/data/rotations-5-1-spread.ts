import { RotationNumber, Phase } from '@/lib/types';
import { RotationData } from './rotations-5-1';
import { rotations51 as standard } from './rotations-5-1';

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const rotations51Spread: RotationMap = (() => {
  const data = deepClone(standard);
  for (const rot of [1, 2, 3, 4, 5, 6] as RotationNumber[]) {
    const trans = data[rot].transition;
    if (trans.positions.OH1.y <= 3) {
      trans.positions.OH1.x = Math.max(0.5, trans.positions.OH1.x - 1);
    }
    if (trans.positions.OH2.y <= 3) {
      trans.positions.OH2.x = Math.max(0.5, trans.positions.OH2.x - 1);
    }
    if (trans.positions.MB1.y <= 3) {
      const setterX = trans.positions.S.x;
      trans.positions.MB1.x = setterX + (trans.positions.MB1.x > setterX ? -0.5 : 0.5);
    }
    if (trans.positions.MB2.y <= 3) {
      const setterX = trans.positions.S.x;
      trans.positions.MB2.x = setterX + (trans.positions.MB2.x > setterX ? -0.5 : 0.5);
    }
  }
  return data;
})();
