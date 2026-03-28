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
//
// R1 lineup (Z1→Z6): S, OPP, MB1, OH1, OH2, MB2
// Opposites: S↔OH1, OPP↔OH2, MB1↔MB2
//
// Correct rotation cycle:
// R1: S(1) OPP(2) MB1(3) OH1(4) OH2(5) MB2(6)  — MB1 front, MB2 back
// R2: OPP(1) MB1(2) OH1(3) OH2(4) MB2(5) S(6)   — MB1 front, MB2 back
// R3: MB1(1) OH1(2) OH2(3) MB2(4) S(5) OPP(6)   — MB2 front, MB1 back
// R4: OH1(1) OH2(2) MB2(3) S(4) OPP(5) MB1(6)   — MB2 front, MB1 back
// R5: OH2(1) MB2(2) S(3) OPP(4) MB1(5) OH1(6)   — MB2 front, MB1 back
// R6: MB2(1) S(2) OPP(3) MB1(4) OH1(5) OH2(6)   — MB1 front, MB2 back

export const rotations51: RotationMap = {
  // ============================================================
  // Rotation 1: S in Zone 1 (back right)
  // Front row (Z2,Z3,Z4): OPP(2), MB1(3), OH1(4)
  // Back row (Z5,Z6,Z1): OH2(5), MB2(6), S(1)
  // ============================================================
  1: {
    serve: {
      positions: {
        S:   { x: 7.5, y: 8.5 },  // Z1 — serving
        OPP: { x: 7.5, y: 2 },    // Z2 — front right
        MB1: { x: 4.5, y: 2 },    // Z3 — front middle
        OH1: { x: 1.5, y: 2 },    // Z4 — front left
        OH2: { x: 1.5, y: 7 },    // Z5 — back left
        MB2: { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 4.5, y: 7 },    // replaces MB2
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'OH2', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'S',   x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7.5, y: 5 },    // penetrating toward net
        OPP: { x: 7.5, y: 2 },    // front right, ready to attack
        MB1: { x: 4.5, y: 1.5 },  // at net, ready for quick
        OH1: { x: 1.5, y: 2 },    // front left, ready to attack
        OH2: { x: 2, y: 6.5 },    // passing in back left
        MB2: { x: 4.5, y: 7 },    // back middle defense
        L:   { x: 4.5, y: 7.5 },  // primary passer
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
        S:   { x: 7, y: 1 },      // at net, setting position
        OPP: { x: 8, y: 2 },      // right side attack
        MB1: { x: 4.5, y: 1 },    // at net, middle attack
        OH1: { x: 1, y: 1.5 },    // left side attack
        OH2: { x: 1.5, y: 6 },    // back left defense
        MB2: { x: 4.5, y: 7 },    // back middle defense
        L:   { x: 4.5, y: 6 },    // back center defense
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
  // Rotation 2: OPP in Zone 1, S in Zone 6
  // Front row (Z2,Z3,Z4): MB1(2), OH1(3), OH2(4)
  // Back row (Z5,Z6,Z1): MB2(5), S(6), OPP(1)
  // ============================================================
  2: {
    serve: {
      positions: {
        OPP: { x: 7.5, y: 8.5 },  // Z1 — serving
        MB1: { x: 7.5, y: 2 },    // Z2 — front right
        OH1: { x: 4.5, y: 2 },    // Z3 — front middle
        OH2: { x: 1.5, y: 2 },    // Z4 — front left
        MB2: { x: 1.5, y: 7 },    // Z5 — back left
        S:   { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 1.5, y: 7 },    // replaces MB2
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'OH1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'S',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'OPP', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        OPP: { x: 7, y: 6.5 },    // back right defense/passing
        MB1: { x: 7, y: 1.5 },    // at net, ready for attack
        OH1: { x: 4.5, y: 1.5 },  // at net center
        OH2: { x: 1.5, y: 2 },    // front left
        MB2: { x: 1.5, y: 7 },    // back left
        S:   { x: 6.5, y: 4 },    // penetrating to net
        L:   { x: 3, y: 7.5 },    // primary passer
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OH1', x: 3, y: 0, width: 3, height: 3, label: 'Quick/Slide' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'S',   x: 3, y: 3, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'OPP', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        OPP: { x: 7, y: 5.5 },    // back right defense
        MB1: { x: 4.5, y: 1 },    // middle attack at net
        OH1: { x: 4.5, y: 1.5 },  // near center
        OH2: { x: 1, y: 1.5 },    // outside attack
        MB2: { x: 1.5, y: 7 },    // back left defense
        S:   { x: 7, y: 1 },      // setting at net
        L:   { x: 3, y: 6 },      // back center defense
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'OH1', x: 3, y: 0, width: 3, height: 3, label: 'Slide Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'OPP', x: 6, y: 4, width: 3, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 3: MB1 in Zone 1, OPP in Zone 6
  // Front row (Z2,Z3,Z4): OH1(2), OH2(3), MB2(4)
  // Back row (Z5,Z6,Z1): S(5), OPP(6), MB1(1)
  // MB1 is back row — libero replaces MB1
  // ============================================================
  3: {
    serve: {
      positions: {
        MB1: { x: 7.5, y: 8.5 },  // Z1 — serving (back row)
        OH1: { x: 7.5, y: 2 },    // Z2 — front right
        OH2: { x: 4.5, y: 2 },    // Z3 — front middle
        MB2: { x: 1.5, y: 2 },    // Z4 — front left
        S:   { x: 1.5, y: 7 },    // Z5 — back left
        OPP: { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 7.5, y: 7 },    // replaces MB1 in back row
      },
      zones: [
        { role: 'MB2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'S',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'OPP', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'L',   x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        MB1: { x: 7.5, y: 7 },    // back row defense
        OH1: { x: 7.5, y: 2 },    // front right
        OH2: { x: 4.5, y: 2 },    // front center
        MB2: { x: 2, y: 1.5 },    // at net left, quick attack
        S:   { x: 7, y: 4 },      // penetrating to net
        OPP: { x: 5, y: 6.5 },    // back row passing
        L:   { x: 3, y: 7.5 },    // primary passer
      },
      zones: [
        { role: 'MB2', x: 0, y: 0, width: 3, height: 3, label: 'Quick Attack (Z4)' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Hit Zone 3' },
        { role: 'OH1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'S',   x: 5, y: 2, width: 4, height: 4, label: 'Setter Penetration' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OPP', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
      ],
    },
    transition: {
      positions: {
        MB1: { x: 7.5, y: 7 },    // back row, stays defense
        OH1: { x: 8, y: 2 },      // right side attack
        OH2: { x: 1, y: 1.5 },    // outside attack
        MB2: { x: 4.5, y: 1 },    // middle attack at net
        S:   { x: 7, y: 1 },      // setting at net
        OPP: { x: 4, y: 5.5 },    // back row defense
        L:   { x: 3, y: 6 },      // back center defense
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OH1', x: 6, y: 0, width: 2, height: 3, label: 'Right Side Hit' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'OPP', x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 4: OH1 in Zone 1, MB1 in Zone 6
  // Front row (Z2,Z3,Z4): OH2(2), MB2(3), S(4)
  // Back row (Z5,Z6,Z1): OPP(5), MB1(6), OH1(1)
  // MB1 is back row — libero replaces MB1
  // ============================================================
  4: {
    serve: {
      positions: {
        OH1: { x: 7.5, y: 8.5 },  // Z1 — serving
        OH2: { x: 7.5, y: 2 },    // Z2 — front right
        MB2: { x: 4.5, y: 2 },    // Z3 — front middle
        S:   { x: 1.5, y: 2 },    // Z4 — front left
        OPP: { x: 1.5, y: 7 },    // Z5 — back left
        MB1: { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 4.5, y: 7 },    // replaces MB1
      },
      zones: [
        { role: 'S',   x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'OPP', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'OH1', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        OH1: { x: 5, y: 7 },      // back right, passing
        OH2: { x: 7.5, y: 2 },    // front right
        MB2: { x: 4.5, y: 1.5 },  // at net, ready for quick
        S:   { x: 7, y: 1 },      // setter at net (already front row)
        OPP: { x: 2, y: 6.5 },    // back left passing
        MB1: { x: 4.5, y: 7 },    // back row defense
        L:   { x: 5, y: 7.5 },    // primary passer
      },
      zones: [
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OPP', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OH1', x: 3, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        OH1: { x: 1.5, y: 6 },    // back left defense
        OH2: { x: 1, y: 1.5 },    // outside attack left
        MB2: { x: 4.5, y: 1 },    // middle attack at net
        S:   { x: 7, y: 1 },      // set at net
        OPP: { x: 2, y: 5.5 },    // back row defense
        MB1: { x: 4.5, y: 7 },    // back row defense
        L:   { x: 4.5, y: 6 },    // back center defense
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Outside Attack' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OPP', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'L',   x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Cover' },
      ],
    },
  },

  // ============================================================
  // Rotation 5: OH2 in Zone 1, OH1 in Zone 6
  // Front row (Z2,Z3,Z4): MB2(2), S(3), OPP(4)
  // Back row (Z5,Z6,Z1): MB1(5), OH1(6), OH2(1)
  // MB1 is back row — libero replaces MB1
  // ============================================================
  5: {
    serve: {
      positions: {
        OH2: { x: 7.5, y: 8.5 },  // Z1 — serving
        MB2: { x: 7.5, y: 2 },    // Z2 — front right
        S:   { x: 4.5, y: 2 },    // Z3 — front middle
        OPP: { x: 1.5, y: 2 },    // Z4 — front left
        MB1: { x: 1.5, y: 7 },    // Z5 — back left
        OH1: { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 1.5, y: 7 },    // replaces MB1
      },
      zones: [
        { role: 'OPP', x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'S',   x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'MB2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'L',   x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'OH1', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'OH2', x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        OH2: { x: 7, y: 6.5 },    // back right, passing
        MB2: { x: 7.5, y: 1.5 },  // at net right, attack
        S:   { x: 7, y: 1 },      // setter at net (front row)
        OPP: { x: 1.5, y: 2 },    // front left
        MB1: { x: 1.5, y: 7 },    // back left defense
        OH1: { x: 5, y: 6.5 },    // back middle passing
        L:   { x: 3, y: 7.5 },    // primary passer
      },
      zones: [
        { role: 'OPP', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'MB2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L',   x: 0, y: 4.5, width: 4.5, height: 4.5, label: 'Receive Left' },
        { role: 'OH1', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OH2', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        OH2: { x: 7, y: 5.5 },    // back right defense
        MB2: { x: 4.5, y: 1 },    // middle attack at net
        S:   { x: 7, y: 1 },      // set at net
        OPP: { x: 1, y: 1.5 },    // left side attack
        MB1: { x: 1.5, y: 7 },    // back left defense
        OH1: { x: 4, y: 5.5 },    // back center defense
        L:   { x: 3, y: 6 },      // back left defense
      },
      zones: [
        { role: 'OPP', x: 0, y: 0, width: 3, height: 3, label: 'Left Side Attack' },
        { role: 'MB2', x: 3, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'L',   x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'OH1', x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
        { role: 'OH2', x: 6, y: 4, width: 3, height: 5, label: 'Back Right Defense' },
      ],
    },
  },

  // ============================================================
  // Rotation 6: MB2 in Zone 1, OH2 in Zone 6
  // Front row (Z2,Z3,Z4): S(2), OPP(3), MB1(4)
  // Back row (Z5,Z6,Z1): OH1(5), OH2(6), MB2(1)
  // MB2 is back row — libero replaces MB2
  // ============================================================
  6: {
    serve: {
      positions: {
        MB2: { x: 7.5, y: 8.5 },  // Z1 — serving
        S:   { x: 7.5, y: 2 },    // Z2 — front right
        OPP: { x: 4.5, y: 2 },    // Z3 — front middle
        MB1: { x: 1.5, y: 2 },    // Z4 — front left
        OH1: { x: 1.5, y: 7 },    // Z5 — back left
        OH2: { x: 4.5, y: 7 },    // Z6 — back middle
        L:   { x: 7.5, y: 7 },    // replaces MB2
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left (Z4)' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle (Z3)' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 3, label: 'Front Right (Z2)' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Back Left (Z5)' },
        { role: 'OH2', x: 3, y: 4.5, width: 3, height: 4.5, label: 'Back Middle (Z6)' },
        { role: 'L',   x: 6, y: 4.5, width: 3, height: 4.5, label: 'Serve Zone (Z1)' },
      ],
    },
    receive: {
      positions: {
        MB2: { x: 7.5, y: 7 },    // back row defense
        S:   { x: 7, y: 1 },      // setter at net (front row)
        OPP: { x: 4.5, y: 2 },    // front center
        MB1: { x: 2, y: 1.5 },    // at net left, attack
        OH1: { x: 2, y: 6.5 },    // back left passing
        OH2: { x: 5, y: 7 },      // back middle
        L:   { x: 5, y: 7.5 },    // primary passer
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Hit Zone 4' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Quick Attack' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4.5, width: 3, height: 4.5, label: 'Receive Left' },
        { role: 'L',   x: 3, y: 4.5, width: 3, height: 4.5, label: 'Receive Middle' },
        { role: 'OH2', x: 5, y: 4.5, width: 4, height: 4.5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        MB2: { x: 7.5, y: 7 },    // back row defense
        S:   { x: 7, y: 1 },      // set at net
        OPP: { x: 8, y: 2 },      // right side attack
        MB1: { x: 4.5, y: 1 },    // middle attack at net
        OH1: { x: 1.5, y: 6 },    // back left defense
        OH2: { x: 4.5, y: 6 },    // back center defense
        L:   { x: 4.5, y: 6 },    // back center defense
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Middle Attack' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Right Side Hit' },
        { role: 'S',   x: 6, y: 0, width: 3, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4, width: 3, height: 5, label: 'Back Left Defense' },
        { role: 'OH2', x: 3, y: 4, width: 3, height: 5, label: 'Back Center Defense' },
        { role: 'L',   x: 6, y: 4, width: 3, height: 5, label: 'Back Right Defense' },
      ],
    },
  },
};
