import { CourtPosition, Phase, RotationNumber } from '@/lib/types';

export type RoleKey62 = 'S1' | 'S2' | 'OH1' | 'OH2' | 'MB1' | 'MB2' | 'L';

export interface RotationData62 {
  positions: Record<RoleKey62, CourtPosition>;
  zones: Array<{
    role: RoleKey62;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
}

type RotationMap62 = Record<RotationNumber, Record<Phase, RotationData62>>;

// 6-2 Volleyball System Rotations
// Court: (0,0) = front-left at net, (9,9) = back-right at baseline
// Two setters (S1, S2) opposite each other; back-row setter sets, front-row setter hits
// Libero (L) replaces back-row middle blocker
//
// Rotation order: S1, OH1, MB1, S2, OH2, MB2
// Rotations 1-3: S1 is back row and sets; S2 is front row and hits
// Rotations 4-6: S1 is front row and hits; S2 is back row and sets

export const rotations62: RotationMap62 = {
  // ============================================================
  // Rotation 1: S1 in zone 1 (back right, sets), S2 in zone 4 (front left, hits)
  // Front row: S2(4), MB1(3), OH1(2)
  // Back row: OH2(5), L/MB2(6), S1(1)
  // ============================================================
  1: {
    serve: {
      positions: {
        S1:  { x: 7.5, y: 8.5 },
        S2:  { x: 1.5, y: 2 },
        OH1: { x: 7.5, y: 2 },
        OH2: { x: 1.5, y: 7 },
        MB1: { x: 4.5, y: 2 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'S2',  x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH2', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'S1',  x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 7.5, y: 5 },
        S2:  { x: 1.5, y: 2 },
        OH1: { x: 7.5, y: 2 },
        OH2: { x: 2, y: 6.5 },
        MB1: { x: 4.5, y: 1.5 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 7.5 },
      },
      zones: [
        { role: 'S2',  x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OH2', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'S1',  x: 6, y: 3, width: 3, height: 4, label: 'Setter Penetration' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 7, y: 1 },
        S2:  { x: 1, y: 1.5 },
        OH1: { x: 8, y: 2 },
        OH2: { x: 1.5, y: 6 },
        MB1: { x: 4.5, y: 1 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'S2',  x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH1', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S1',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH2', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 2: S1 in zone 6 (back middle, sets), S2 in zone 3 (front middle, hits)
  // Front row: OH2(4), S2(3), OH1(2)
  // Back row: L/MB2(5), S1(6), MB1(1)
  // ============================================================
  2: {
    serve: {
      positions: {
        S1:  { x: 4.5, y: 7 },
        S2:  { x: 4.5, y: 2 },
        OH1: { x: 7.5, y: 2 },
        OH2: { x: 1.5, y: 2 },
        MB1: { x: 7.5, y: 8.5 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 1.5, y: 7 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'S2',  x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'S1',  x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'MB1', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 6.5, y: 4 },
        S2:  { x: 4.5, y: 2 },
        OH1: { x: 7.5, y: 2 },
        OH2: { x: 1.5, y: 2 },
        MB1: { x: 7, y: 7 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'S2',  x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'S1',  x: 4.5, y: 3, width: 4.5, height: 4, label: 'Setter Penetration' },
        { role: 'MB1', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Back Right' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 7, y: 1 },
        S2:  { x: 4.5, y: 1 },
        OH1: { x: 8, y: 2 },
        OH2: { x: 1, y: 1.5 },
        MB1: { x: 7.5, y: 7 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 3, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'S2',  x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH1', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S1',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'MB1', x: 4.5, y: 4, width: 4.5, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 3: S1 in zone 5 (back left, sets), S2 in zone 2 (front right, hits)
  // Front row: MB2(4), OH2(3), S2(2)
  // Back row: S1(5), MB1(6)/L, OH1(1) -- wait, who is back row?
  // Actually: S1(5), L/MB1(6), OH1(1) -- MB1 is in back row zone 6, L replaces
  // Front row: MB2(4), OH2(3), S2(2)
  // ============================================================
  3: {
    serve: {
      positions: {
        S1:  { x: 1.5, y: 7 },
        S2:  { x: 7.5, y: 2 },
        OH1: { x: 7.5, y: 8.5 },
        OH2: { x: 4.5, y: 2 },
        MB1: { x: 4.5, y: 7 },
        MB2: { x: 1.5, y: 2 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'MB2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'S2',  x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'S1',  x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'OH1', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 7, y: 4 },
        S2:  { x: 7.5, y: 2 },
        OH1: { x: 7, y: 6.5 },
        OH2: { x: 4.5, y: 2 },
        MB1: { x: 4.5, y: 7 },
        MB2: { x: 2, y: 1.5 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'MB2', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'S2',  x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'S1',  x: 5, y: 2, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OH1', x: 4.5, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 7, y: 1 },
        S2:  { x: 8, y: 2 },
        OH1: { x: 7, y: 5.5 },
        OH2: { x: 1, y: 1.5 },
        MB1: { x: 4.5, y: 7 },
        MB2: { x: 4.5, y: 1 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'S2',  x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S1',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'OH1', x: 4.5, y: 4, width: 4.5, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 4: S1 in zone 4 (front left, hits), S2 in zone 1 (back right, sets)
  // Front row: S1(4), MB2(3), OH2(2)
  // Back row: MB1(5)/L, OH1(6), S2(1)
  // ============================================================
  4: {
    serve: {
      positions: {
        S1:  { x: 1.5, y: 2 },
        S2:  { x: 7.5, y: 8.5 },
        OH1: { x: 4.5, y: 7 },
        OH2: { x: 7.5, y: 2 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 4.5, y: 2 },
        L:   { x: 1.5, y: 7 },
      },
      zones: [
        { role: 'S1',  x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'OH1', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'S2',  x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 1.5, y: 2 },
        S2:  { x: 7.5, y: 5 },
        OH1: { x: 5, y: 7 },
        OH2: { x: 7.5, y: 2 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 4.5, y: 1.5 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'S1',  x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OH1', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'S2',  x: 6, y: 3, width: 3, height: 4, label: 'Setter Penetration' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 1, y: 1.5 },
        S2:  { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        OH2: { x: 8, y: 2 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 4.5, y: 1 },
        L:   { x: 3, y: 6 },
      },
      zones: [
        { role: 'S1',  x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH2', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S2',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Cover' },
      ],
    },
  },

  // ============================================================
  // Rotation 5: S1 in zone 3 (front middle, hits), S2 in zone 6 (back middle, sets)
  // Front row: OH1(4), S1(3), MB2(2)
  // Back row: L/MB1(5), S2(6), OH2(1)
  // ============================================================
  5: {
    serve: {
      positions: {
        S1:  { x: 4.5, y: 2 },
        S2:  { x: 4.5, y: 7 },
        OH1: { x: 1.5, y: 2 },
        OH2: { x: 7.5, y: 8.5 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 7.5, y: 2 },
        L:   { x: 1.5, y: 7 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'S1',  x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'MB2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'S2',  x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'OH2', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 4.5, y: 2 },
        S2:  { x: 6.5, y: 4 },
        OH1: { x: 1.5, y: 2 },
        OH2: { x: 7, y: 6.5 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 7.5, y: 1.5 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'S1',  x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'MB2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'S2',  x: 4.5, y: 3, width: 4.5, height: 4, label: 'Setter Penetration' },
        { role: 'OH2', x: 4.5, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 4.5, y: 1 },
        S2:  { x: 7, y: 1 },
        OH1: { x: 1, y: 1.5 },
        OH2: { x: 7, y: 5.5 },
        MB1: { x: 1.5, y: 7 },
        MB2: { x: 8, y: 2 },
        L:   { x: 3, y: 6 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'S1',  x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'MB2', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S2',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'OH2', x: 4.5, y: 4, width: 4.5, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 6: S1 in zone 2 (front right, hits), S2 in zone 5 (back left, sets)
  // Front row: MB1(4), OH1(3), S1(2)
  // Back row: S2(5), L/MB2(6), OH2(1)
  // ============================================================
  6: {
    serve: {
      positions: {
        S1:  { x: 7.5, y: 2 },
        S2:  { x: 1.5, y: 7 },
        OH1: { x: 4.5, y: 2 },
        OH2: { x: 7.5, y: 7 },
        MB1: { x: 1.5, y: 2 },
        MB2: { x: 4.5, y: 8.5 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'S1',  x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'S2',  x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'OH2', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        S1:  { x: 7.5, y: 2 },
        S2:  { x: 7, y: 4 },
        OH1: { x: 4.5, y: 2 },
        OH2: { x: 7, y: 6.5 },
        MB1: { x: 2, y: 1.5 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OH1', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'S1',  x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'S2',  x: 5, y: 2, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OH2', x: 4.5, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S1:  { x: 8, y: 2 },
        S2:  { x: 7, y: 1 },
        OH1: { x: 1, y: 1.5 },
        OH2: { x: 7, y: 5.5 },
        MB1: { x: 4.5, y: 1 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'S1',  x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S2',  x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'OH2', x: 4.5, y: 4, width: 4.5, height: 5, label: 'Back Right Defense' },
      ],
    },
  },
};
