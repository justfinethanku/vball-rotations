import { COURT_SVG, COURT_WIDTH, COURT_DEPTH, ATTACK_LINE_Y } from './constants';
import { CourtPosition } from './types';

export function courtToSvg(pos: CourtPosition): { x: number; y: number } {
  return {
    x: COURT_SVG.x + (pos.x / COURT_WIDTH) * COURT_SVG.width,
    y: COURT_SVG.y + (pos.y / COURT_DEPTH) * COURT_SVG.height,
  };
}

export function getArrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const cx = (from.x + to.x) / 2 - dy * 0.2;
  const cy = (from.y + to.y) / 2 + dx * 0.2;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

export function getAttackLineY(): number {
  return COURT_SVG.y + (ATTACK_LINE_Y / COURT_DEPTH) * COURT_SVG.height;
}
