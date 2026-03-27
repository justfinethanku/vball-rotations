import { CourtPosition, Phase, RotationNumber } from '@/lib/types';

export type RoleKey51 = 'S' | 'OH1' | 'OH2' | 'MB1' | 'MB2' | 'OPP' | 'L';

export interface RotationData {
  positions: Record<RoleKey51, CourtPosition>;
  zones: Array<{
    role: RoleKey51;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
}

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;

// 5-1 Volleyball System Rotations
// Court: (0,0) = front-left at net, (9,9) = back-right at baseline
// Libero (L) replaces the back-row middle blocker

export const rotations51: RotationMap = {
  // ============================================================
  // Rotation 1: Setter in Zone 1 (back right)
  // Front row: OH1(4), MB1(3), OPP(2)
  // Back row: OH2(5), L/MB2(6), S(1)
  // ============================================================
  1: {
    serve: {
      positions: {
        S:   { x: 7.5, y: 8.5 },
        OH1: { x: 1.5, y: 2 },
        MB1: { x: 4.5, y: 2 },
        OPP: { x: 7.5, y: 2 },
        OH2: { x: 1.5, y: 7 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH2', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'S',   x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7.5, y: 5 },
        OH1: { x: 1.5, y: 2 },
        MB1: { x: 4.5, y: 1.5 },
        OPP: { x: 7.5, y: 2 },
        OH2: { x: 2, y: 6.5 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 7.5 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OH2', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'S',   x: 6, y: 3, width: 3, height: 4, label: 'Setter Penetration' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 1, y: 1.5 },
        MB1: { x: 4.5, y: 1 },
        OPP: { x: 8, y: 2 },
        OH2: { x: 1.5, y: 6 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OPP', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH2', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 2: Setter in Zone 6 (back middle)
  // Front row: OH2(4), OPP(3), MB1(2)
  // Back row: OH1(5), S(6), L/MB2(1)
  // ============================================================
  2: {
    serve: {
      positions: {
        S:   { x: 4.5, y: 7 },
        OH1: { x: 1.5, y: 8.5 },
        MB1: { x: 7.5, y: 2 },
        OPP: { x: 4.5, y: 2 },
        OH2: { x: 1.5, y: 2 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 7.5, y: 7 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
        { role: 'S',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'L',   x: 6, y: 4.5, width: 3, height: 4.5, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 6.5, y: 4 },
        OH1: { x: 2, y: 6.5 },
        MB1: { x: 7, y: 1.5 },
        OPP: { x: 4.5, y: 2 },
        OH2: { x: 1.5, y: 2 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 5, y: 7.5 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'S',   x: 3, y: 3, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        MB1: { x: 7.5, y: 1.5 },
        OPP: { x: 4.5, y: 1 },
        OH2: { x: 1, y: 1.5 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Right Side Hit' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 3: Setter in Zone 5 (back left)
  // Front row: MB1(4), OH2(3), OPP(2)
  // Back row: S(5), OH1(6), L/MB2(1)
  // ============================================================
  3: {
    serve: {
      positions: {
        S:   { x: 1.5, y: 7 },
        OH1: { x: 4.5, y: 7 },
        MB1: { x: 1.5, y: 2 },
        OPP: { x: 7.5, y: 2 },
        OH2: { x: 4.5, y: 2 },
        MB2: { x: 7.5, y: 8.5 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'S',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'MB2', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7, y: 4 },
        OH1: { x: 2, y: 6.5 },
        MB1: { x: 2, y: 1.5 },
        OPP: { x: 7.5, y: 2 },
        OH2: { x: 4.5, y: 2 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 5, y: 7.5 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'S',   x: 5, y: 2, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        MB1: { x: 4.5, y: 1 },
        OPP: { x: 8, y: 2 },
        OH2: { x: 1, y: 1.5 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Right Side Hit' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 4: Setter in Zone 4 (front left, setter is front row)
  // Front row: S(4), MB1(3), OH2(2)
  // Back row: OPP(5), OH1(6), L/MB2(1)
  // ============================================================
  4: {
    serve: {
      positions: {
        S:   { x: 1.5, y: 2 },
        OH1: { x: 4.5, y: 7 },
        MB1: { x: 4.5, y: 2 },
        OPP: { x: 1.5, y: 7 },
        OH2: { x: 7.5, y: 2 },
        MB2: { x: 7.5, y: 8.5 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'S',   x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OPP', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'MB2', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 5, y: 7 },
        MB1: { x: 4.5, y: 1.5 },
        OPP: { x: 2, y: 6.5 },
        OH2: { x: 7.5, y: 2 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 5, y: 7.5 },
      },
      zones: [
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OPP', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OH1', x: 3, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        MB1: { x: 4.5, y: 1 },
        OPP: { x: 2, y: 5.5 },
        OH2: { x: 1, y: 1.5 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'OPP', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Cover' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 5: Setter in Zone 3 (front middle)
  // Front row: OH2(4), S(3), MB1(2)
  // Back row: L/MB2(5), OPP(6), OH1(1)
  // ============================================================
  5: {
    serve: {
      positions: {
        S:   { x: 4.5, y: 2 },
        OH1: { x: 7.5, y: 8.5 },
        MB1: { x: 7.5, y: 2 },
        OPP: { x: 4.5, y: 7 },
        OH2: { x: 1.5, y: 2 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 1.5, y: 7 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'S',   x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'OPP', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'OH1', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 7, y: 6.5 },
        MB1: { x: 7.5, y: 1.5 },
        OPP: { x: 5, y: 6.5 },
        OH2: { x: 1.5, y: 2 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 3, y: 7.5 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OPP', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OH1', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 7, y: 5.5 },
        MB1: { x: 4.5, y: 1 },
        OPP: { x: 4, y: 5.5 },
        OH2: { x: 1, y: 1.5 },
        MB2: { x: 1.5, y: 7 },
        L:   { x: 3, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'L',   x: 0, y: 4, width: 4.5, height: 5, label: 'Back Left Defense' },
        { role: 'OPP', x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
        { role: 'OH1', x: 5, y: 4, width: 4, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 6: Setter in Zone 2 (front right)
  // Front row: MB1(4), OH2(3), S(2)
  // Back row: OH1(5), L/MB2(6), OPP(1)
  // ============================================================
  6: {
    serve: {
      positions: {
        S:   { x: 7.5, y: 2 },
        OH1: { x: 1.5, y: 7 },
        MB1: { x: 1.5, y: 2 },
        OPP: { x: 7.5, y: 7 },
        OH2: { x: 4.5, y: 2 },
        MB2: { x: 4.5, y: 8.5 },
        L:   { x: 4.5, y: 7 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle' },
        { role: 'OPP', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 2, y: 6.5 },
        MB1: { x: 2, y: 1.5 },
        OPP: { x: 7, y: 6.5 },
        OH2: { x: 4.5, y: 2 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 5, y: 7.5 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OPP', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        MB1: { x: 4.5, y: 1 },
        OPP: { x: 7, y: 5.5 },
        OH2: { x: 1, y: 1.5 },
        MB2: { x: 4.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
        { role: 'OPP', x: 6, y: 4, width: 3, height: 5, label: 'Back Right Defense' },
      ],
    },
  },
};
