# Volleyball Rotation Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first volleyball rotation learning tool where coaches create animated rotation diagrams and share them via compressed URLs.

**Architecture:** Single-page Next.js app with SVG court rendering. All state lives client-side — no backend. Rotation data is static JSON. Team config is encoded in URL hash via lz-string. Framer Motion handles UI animations; custom SVG interpolation handles court movement.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, lz-string, SVG

---

## File Structure

```
src/
  app/
    page.tsx                    — Main app shell, state orchestration
    layout.tsx                  — Root layout, metadata, fonts
    globals.css                 — Tailwind imports, custom styles
  components/
    court/
      Court.tsx                 — SVG court container with dimensions
      PlayerToken.tsx           — Player circle with avatar/number/name
      MovementArrow.tsx         — Animated curved arrow between positions
      ZoneOverlay.tsx           — Colored responsibility area
    controls/
      RotationSelector.tsx      — R1–R6 segmented control
      PhaseToggle.tsx           — Serve/Receive/Transition toggle
      PlaybackControls.tsx      — Play/pause/step buttons + speed
      PositionFilter.tsx        — Role focus dropdown
    setup/
      SetupDrawer.tsx           — Bottom sheet drawer
      PlayerCard.tsx            — Editable player row
      AvatarPicker.tsx          — Preset avatar grid + upload
    sharing/
      ShareButton.tsx           — Copy URL + toast
    info/
      PositionInfo.tsx          — Tooltip/panel for focused position
  hooks/
    useTeam.ts                  — Team state (players, system type)
    useRotation.ts              — Current rotation/phase state
    useAnimation.ts             — Playback timing + auto-play
    useUrlState.ts              — URL encode/decode/sync
  lib/
    types.ts                    — All TypeScript interfaces
    courtMath.ts                — Court coord → SVG coord transforms
    urlCodec.ts                 — lz-string compress/decompress
    rotationEngine.ts           — Get positions for rotation+phase+system
    constants.ts                — Court dimensions, colors, defaults
  data/
    rotations-5-1.ts            — 5-1 all rotation positions
    rotations-6-2.ts            — 6-2 all rotation positions
    avatars.ts                  — Preset avatar definitions
    position-info.ts            — Tips/responsibilities per position
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Initialize Next.js project**

```bash
cd C:/Users/Moe/source/repos/vball-rotations
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This creates the full scaffold.

- [ ] **Step 2: Install dependencies**

```bash
npm install framer-motion lz-string
npm install -D @types/lz-string
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: Server runs on localhost:3000 with default Next.js page.

- [ ] **Step 4: Clean up default content**

Replace `src/app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="min-h-dvh bg-gray-950 text-white">
      <h1 className="text-center pt-8 text-2xl font-bold">VBall Rotations</h1>
    </main>
  );
}
```

Replace `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --court-green: #2d5a3f;
  --court-line: #ffffff;
  --net-color: #d4d4d8;
}

body {
  overscroll-behavior: none;
}
```

Update `src/app/layout.tsx` metadata:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VBall Rotations",
  description: "Interactive volleyball rotation learning tool",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git init
echo "node_modules/\n.next/\n.env*.local" > .gitignore
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Framer Motion, lz-string"
```

---

### Task 2: Types & Constants

**Files:**
- Create: `src/lib/types.ts`, `src/lib/constants.ts`

- [ ] **Step 1: Define core types in `src/lib/types.ts`**

```typescript
export type RotationSystem = '5-1' | '6-2';

export type PlayerRole = 'setter' | 'outside' | 'opposite' | 'middle' | 'libero' | 'ds';

export type RotationNumber = 1 | 2 | 3 | 4 | 5 | 6;

export type Phase = 'serve' | 'receive' | 'transition';

export interface Player {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  avatar: string; // preset key or 'custom:base64'
}

export interface Team {
  name: string;
  system: RotationSystem;
  players: Player[];
}

export interface CourtPosition {
  x: number; // 0-9 court meters
  y: number; // 0-9 court meters (0 = net, 9 = baseline)
}

export interface PlayerPosition {
  playerId: string;
  role: PlayerRole;
  position: CourtPosition;
}

export interface ZoneArea {
  playerId: string;
  role: PlayerRole;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface RotationState {
  rotation: RotationNumber;
  phase: Phase;
  positions: PlayerPosition[];
  zones: ZoneArea[];
}

export interface AppState {
  team: Team;
  system: RotationSystem;
  currentRotation: RotationNumber;
  currentPhase: Phase;
  focusedRole: PlayerRole | null;
  showZones: boolean;
  isPlaying: boolean;
  speed: 'slow' | 'medium' | 'fast';
}
```

- [ ] **Step 2: Define constants in `src/lib/constants.ts`**

```typescript
import { PlayerRole } from './types';

// Court dimensions in meters (half court - one team's side)
export const COURT_WIDTH = 9;
export const COURT_DEPTH = 9;
export const ATTACK_LINE_Y = 3; // 3m from net

// SVG viewport
export const SVG_WIDTH = 450;
export const SVG_HEIGHT = 500;
export const SVG_PADDING = 40;

// Court area within SVG
export const COURT_SVG = {
  x: SVG_PADDING,
  y: SVG_PADDING + 20, // space for net
  width: SVG_WIDTH - SVG_PADDING * 2,
  height: SVG_HEIGHT - SVG_PADDING * 2 - 20,
};

export const ROLE_COLORS: Record<PlayerRole, string> = {
  setter: '#EAB308',    // yellow
  outside: '#3B82F6',   // blue
  opposite: '#22C55E',  // green
  middle: '#EF4444',    // red
  libero: '#F97316',    // orange
  ds: '#A855F7',        // purple
};

export const ROLE_LABELS: Record<PlayerRole, string> = {
  setter: 'Setter',
  outside: 'Outside Hitter',
  opposite: 'Opposite',
  middle: 'Middle Blocker',
  libero: 'Libero',
  ds: 'Defensive Specialist',
};

export const ROLE_SHORT: Record<PlayerRole, string> = {
  setter: 'S',
  outside: 'OH',
  opposite: 'OPP',
  middle: 'MB',
  libero: 'L',
  ds: 'DS',
};

export const SPEED_MS: Record<string, number> = {
  slow: 1200,
  medium: 600,
  fast: 300,
};

export const PHASE_PAUSE_MS = 2000;

export const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Setter', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 'p2', name: 'Outside 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'p3', name: 'Outside 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'p4', name: 'Middle 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'p5', name: 'Middle 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'p6', name: 'Opposite', number: 2, role: 'opposite' as const, avatar: 'default' },
  { id: 'p7', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];

// 6-2 needs two setters
export const DEFAULT_PLAYERS_62 = [
  { id: 'p1', name: 'Setter 1', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 'p2', name: 'Setter 2', number: 6, role: 'setter' as const, avatar: 'default' },
  { id: 'p3', name: 'Outside 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'p4', name: 'Outside 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'p5', name: 'Middle 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'p6', name: 'Middle 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'p7', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/constants.ts
git commit -m "feat: add core types and constants"
```

---

### Task 3: Rotation Data (5-1 & 6-2)

**Files:**
- Create: `src/data/rotations-5-1.ts`, `src/data/rotations-6-2.ts`

- [ ] **Step 1: Create 5-1 rotation data in `src/data/rotations-5-1.ts`**

This defines all 6 rotations x 3 phases for the 5-1 system. Positions use court coordinates where (0,0) is front-left at the net and (9,9) is back-right at baseline. Player positions are keyed by role. In a 5-1: 1 setter (S), 2 outside hitters (OH1, OH2), 2 middle blockers (MB1, MB2), 1 opposite (OPP). The libero replaces a middle blocker in back row.

```typescript
import { CourtPosition, Phase, RotationNumber } from '@/lib/types';

// Positions keyed by role identifier
// In 5-1: S, OH1, OH2, MB1, MB2, OPP, L (libero replaces back-row MB)
type RoleKey = 'S' | 'OH1' | 'OH2' | 'MB1' | 'MB2' | 'OPP' | 'L';

export interface RotationData {
  positions: Record<RoleKey, CourtPosition>;
  zones: Array<{
    role: RoleKey;
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  }>;
}

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;

// 5-1 Rotation Data
// Standard 5-1 with setter in each court position rotation
// Rotation 1: Setter in position 1 (back right, serving position)
// Each subsequent rotation moves everyone one position clockwise

export const rotations51: RotationMap = {
  1: {
    // Setter in Zone 1 (back right) — Setter is serving
    serve: {
      positions: {
        S:   { x: 7.5, y: 8 },   // Zone 1, serving
        OH1: { x: 1.5, y: 2 },   // Zone 4, front left
        MB1: { x: 4.5, y: 2 },   // Zone 3, front middle
        OPP: { x: 7.5, y: 2 },   // Zone 2, front right
        OH2: { x: 1.5, y: 7 },   // Zone 5, back left
        MB2: { x: 4.5, y: 7 },   // Zone 6, back middle
        L:   { x: 4.5, y: 7 },   // Libero replaces MB2 in back row
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH2', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Middle' },
        { role: 'S', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        S:   { x: 7.5, y: 5 },   // Moves up toward net, ready to set
        OH1: { x: 1.5, y: 2 },   // Front left, ready to hit
        MB1: { x: 4.5, y: 1.5 }, // Near net, ready for quick
        OPP: { x: 7.5, y: 2 },   // Front right
        OH2: { x: 2, y: 6 },     // Serve receive left
        MB2: { x: 4.5, y: 7 },   // Not on court (libero in)
        L:   { x: 4.5, y: 7 },   // Serve receive middle
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 4, label: 'Hit Zone 4' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick Attack' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 4, label: 'Hit Zone 2' },
        { role: 'OH2', x: 0, y: 4, width: 4, height: 5, label: 'Receive Left' },
        { role: 'L', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'S', x: 6, y: 3, width: 3, height: 3, label: 'Set Position' },
      ],
    },
    transition: {
      positions: {
        S:   { x: 7, y: 1 },     // Setter at net (right side)
        OH1: { x: 1, y: 1.5 },   // Outside approach zone 4
        MB1: { x: 4.5, y: 1 },   // Middle approach
        OPP: { x: 8, y: 2 },     // Right side attack
        OH2: { x: 1.5, y: 6 },   // Back row left
        MB2: { x: 4.5, y: 7 },   // Off court
        L:   { x: 4.5, y: 6 },   // Back row defense
      },
      zones: [
        { role: 'OH1', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick/Slide' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Zone 2 Attack' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OH2', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Defense' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Defense' },
      ],
    },
  },
  2: {
    // Setter in Zone 6 (back middle) — rotated once from R1
    serve: {
      positions: {
        OH1: { x: 1.5, y: 7.5 }, // Zone 5 — serving
        S:   { x: 4.5, y: 7 },   // Zone 6
        OH2: { x: 1.5, y: 2 },   // Zone 4
        MB1: { x: 7.5, y: 2 },   // Zone 2
        OPP: { x: 4.5, y: 2 },   // Zone 3
        MB2: { x: 7.5, y: 7 },   // Zone 1
        L:   { x: 7.5, y: 7 },   // Replaces MB2
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'S', x: 2, y: 5, width: 5, height: 4, label: 'Back Middle' },
        { role: 'L', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        OH1: { x: 2, y: 6 },
        S:   { x: 6.5, y: 4 },   // Penetrating to net
        OH2: { x: 1.5, y: 2 },
        MB1: { x: 7, y: 1.5 },
        OPP: { x: 4.5, y: 2 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 5, y: 7 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 4, label: 'Hit Zone 4' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 2, label: 'Hit Zone 3' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OH1', x: 0, y: 4, width: 4, height: 5, label: 'Receive Left' },
        { role: 'L', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'S', x: 5, y: 2, width: 4, height: 4, label: 'Penetrate to Set' },
      ],
    },
    transition: {
      positions: {
        OH1: { x: 1.5, y: 6 },
        S:   { x: 7, y: 1 },
        OH2: { x: 1, y: 1.5 },
        MB1: { x: 7.5, y: 1.5 },
        OPP: { x: 4.5, y: 1 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'OPP', x: 3, y: 0, width: 3, height: 2, label: 'Zone 3 Attack' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Zone 2 Attack' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Defense' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Defense' },
      ],
    },
  },
  3: {
    // Setter in Zone 5 (back left)
    serve: {
      positions: {
        MB1: { x: 1.5, y: 2 },   // Zone 4
        OH2: { x: 4.5, y: 2 },   // Zone 3
        OPP: { x: 7.5, y: 2 },   // Zone 2 (corrected: OPP not MB1)
        S:   { x: 1.5, y: 7 },   // Zone 5
        OH1: { x: 4.5, y: 7 },   // Zone 6
        MB2: { x: 7.5, y: 8 },   // Zone 1 — serving
        L:   { x: 4.5, y: 7 },   // Replaces OH1? No — libero replaces back-row MB
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'S', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'L', x: 2, y: 5, width: 5, height: 4, label: 'Back Middle' },
        { role: 'MB2', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        MB1: { x: 2, y: 1.5 },
        OH2: { x: 4.5, y: 2 },
        OPP: { x: 7.5, y: 2 },
        S:   { x: 7, y: 4 },     // Penetrating from back left to net right
        OH1: { x: 2, y: 6 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 5, y: 7 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 2, label: 'Quick Attack' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Hit Zone 3' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OH1', x: 0, y: 4, width: 4, height: 5, label: 'Receive Left' },
        { role: 'L', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'S', x: 5, y: 2, width: 4, height: 4, label: 'Penetrate to Set' },
      ],
    },
    transition: {
      positions: {
        MB1: { x: 4.5, y: 1 },
        OH2: { x: 1, y: 1.5 },
        OPP: { x: 8, y: 2 },
        S:   { x: 7, y: 1 },
        OH1: { x: 1.5, y: 6 },
        MB2: { x: 7.5, y: 7 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick/Slide' },
        { role: 'OPP', x: 6, y: 0, width: 3, height: 3, label: 'Zone 2 Attack' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Defense' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Defense' },
      ],
    },
  },
  4: {
    // Setter in Zone 4 (front left) — setter is front row
    serve: {
      positions: {
        OPP: { x: 1.5, y: 7 },   // Zone 5
        OH1: { x: 4.5, y: 7 },   // Zone 6
        MB2: { x: 7.5, y: 7 },   // Zone 1
        S:   { x: 1.5, y: 2 },   // Zone 4
        MB1: { x: 4.5, y: 2 },   // Zone 3
        OH2: { x: 7.5, y: 2 },   // Zone 2
        L:   { x: 4.5, y: 7 },   // Replaces MB2 in back row
      },
      zones: [
        { role: 'S', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OPP', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'L', x: 2, y: 5, width: 5, height: 4, label: 'Back Middle' },
        { role: 'MB2', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        OPP: { x: 2, y: 6 },
        OH1: { x: 5, y: 7 },
        MB2: { x: 7.5, y: 7 },
        S:   { x: 7, y: 1 },     // Setter runs to right side of net
        MB1: { x: 4.5, y: 1.5 },
        OH2: { x: 7.5, y: 2 },
        L:   { x: 5, y: 7 },
      },
      zones: [
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick Attack' },
        { role: 'OH2', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'OPP', x: 0, y: 4, width: 4, height: 5, label: 'Receive/Pipe' },
        { role: 'OH1', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'L', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
      ],
    },
    transition: {
      positions: {
        OPP: { x: 2, y: 5 },
        OH1: { x: 1.5, y: 6 },
        MB2: { x: 7.5, y: 7 },
        S:   { x: 7, y: 1 },
        MB1: { x: 4.5, y: 1 },
        OH2: { x: 1, y: 1.5 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick/Slide' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OPP', x: 0, y: 4, width: 4.5, height: 5, label: 'Pipe/Back Row' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Defense' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Defense' },
      ],
    },
  },
  5: {
    // Setter in Zone 3 (front middle)
    serve: {
      positions: {
        MB2: { x: 1.5, y: 7 },   // Zone 5
        OPP: { x: 4.5, y: 7 },   // Zone 6
        OH1: { x: 7.5, y: 8 },   // Zone 1 — serving
        OH2: { x: 1.5, y: 2 },   // Zone 4
        S:   { x: 4.5, y: 2 },   // Zone 3
        MB1: { x: 7.5, y: 2 },   // Zone 2
        L:   { x: 1.5, y: 7 },   // Replaces MB2
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'S', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'L', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'OPP', x: 2, y: 5, width: 5, height: 4, label: 'Back Middle' },
        { role: 'OH1', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        MB2: { x: 1.5, y: 7 },
        OPP: { x: 5, y: 6 },
        OH1: { x: 7, y: 6 },
        OH2: { x: 1.5, y: 2 },
        S:   { x: 7, y: 1 },     // Setter goes to right side
        MB1: { x: 7.5, y: 1.5 },
        L:   { x: 3, y: 7 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 4, label: 'Hit Zone 4' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'MB1', x: 6, y: 0, width: 3, height: 3, label: 'Hit Zone 2' },
        { role: 'L', x: 0, y: 4, width: 5, height: 5, label: 'Receive Left' },
        { role: 'OPP', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'OH1', x: 5, y: 4, width: 4, height: 5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        MB2: { x: 1.5, y: 7 },
        OPP: { x: 4, y: 5.5 },
        OH1: { x: 7, y: 5.5 },
        OH2: { x: 1, y: 1.5 },
        S:   { x: 7, y: 1 },
        MB1: { x: 4.5, y: 1 },
        L:   { x: 3, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick/Slide' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OPP', x: 2, y: 4, width: 4, height: 4, label: 'Pipe/Back Row' },
        { role: 'OH1', x: 5, y: 4, width: 4, height: 5, label: 'Back Right' },
        { role: 'L', x: 0, y: 4, width: 4, height: 5, label: 'Back Defense' },
      ],
    },
  },
  6: {
    // Setter in Zone 2 (front right)
    serve: {
      positions: {
        OH1: { x: 1.5, y: 7 },   // Zone 5
        MB2: { x: 4.5, y: 8 },   // Zone 6 — serving
        OPP: { x: 7.5, y: 7 },   // Zone 1
        MB1: { x: 1.5, y: 2 },   // Zone 4
        OH2: { x: 4.5, y: 2 },   // Zone 3
        S:   { x: 7.5, y: 2 },   // Zone 2
        L:   { x: 4.5, y: 7 },   // Replaces MB2
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 3, label: 'Front Left' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Front Middle' },
        { role: 'S', x: 6, y: 0, width: 3, height: 3, label: 'Front Right' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Left' },
        { role: 'L', x: 2, y: 5, width: 5, height: 4, label: 'Back Middle' },
        { role: 'OPP', x: 4.5, y: 5, width: 4.5, height: 4, label: 'Back Right' },
      ],
    },
    receive: {
      positions: {
        OH1: { x: 2, y: 6 },
        MB2: { x: 4.5, y: 7 },
        OPP: { x: 7, y: 6 },
        MB1: { x: 2, y: 1.5 },
        OH2: { x: 4.5, y: 2 },
        S:   { x: 7, y: 1 },     // Setter already near net
        L:   { x: 5, y: 7 },
      },
      zones: [
        { role: 'MB1', x: 0, y: 0, width: 3, height: 2, label: 'Quick Attack' },
        { role: 'OH2', x: 3, y: 0, width: 3, height: 3, label: 'Hit Zone 3' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 4, width: 4, height: 5, label: 'Receive Left' },
        { role: 'L', x: 2, y: 4, width: 5, height: 5, label: 'Receive Middle' },
        { role: 'OPP', x: 5, y: 4, width: 4, height: 5, label: 'Receive Right' },
      ],
    },
    transition: {
      positions: {
        OH1: { x: 1.5, y: 6 },
        MB2: { x: 4.5, y: 7 },
        OPP: { x: 7, y: 5.5 },
        MB1: { x: 4.5, y: 1 },
        OH2: { x: 1, y: 1.5 },
        S:   { x: 7, y: 1 },
        L:   { x: 4.5, y: 6 },
      },
      zones: [
        { role: 'OH2', x: 0, y: 0, width: 3, height: 3, label: 'Zone 4 Attack' },
        { role: 'MB1', x: 3, y: 0, width: 3, height: 2, label: 'Quick/Slide' },
        { role: 'S', x: 5, y: 0, width: 4, height: 2, label: 'Set at Net' },
        { role: 'OH1', x: 0, y: 5, width: 4.5, height: 4, label: 'Back Defense' },
        { role: 'L', x: 2, y: 4, width: 5, height: 3, label: 'Back Defense' },
        { role: 'OPP', x: 5, y: 4, width: 4, height: 5, label: 'Pipe/Back Row' },
      ],
    },
  },
};
```

- [ ] **Step 2: Create 6-2 rotation data in `src/data/rotations-6-2.ts`**

Similar structure but with two setters (S1, S2) where the back-row setter sets and both setters hit from front row. Role keys: S1, S2, OH1, OH2, MB1, MB2, L.

(Full 6-2 data following the same pattern — 6 rotations x 3 phases, with the back-row setter penetrating to set and front-row setter acting as a hitter.)

- [ ] **Step 3: Commit**

```bash
git add src/data/
git commit -m "feat: add 5-1 and 6-2 rotation position data"
```

---

### Task 4: Court Math & URL Codec Utilities

**Files:**
- Create: `src/lib/courtMath.ts`, `src/lib/urlCodec.ts`

- [ ] **Step 1: Create court coordinate transforms in `src/lib/courtMath.ts`**

```typescript
import { COURT_SVG, COURT_WIDTH, COURT_DEPTH } from './constants';
import { CourtPosition } from './types';

/** Convert court coordinates (0-9m) to SVG pixel coordinates */
export function courtToSvg(pos: CourtPosition): { x: number; y: number } {
  return {
    x: COURT_SVG.x + (pos.x / COURT_WIDTH) * COURT_SVG.width,
    y: COURT_SVG.y + (pos.y / COURT_DEPTH) * COURT_SVG.height,
  };
}

/** Generate a smooth curved path between two SVG points for movement arrows */
export function getArrowPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  // Curve control point offset perpendicular to line
  const cx = (from.x + to.x) / 2 - dy * 0.2;
  const cy = (from.y + to.y) / 2 + dx * 0.2;
  return `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;
}

/** Get SVG Y coordinate for the attack line (3m from net) */
export function getAttackLineY(): number {
  return COURT_SVG.y + (ATTACK_LINE_Y / COURT_DEPTH) * COURT_SVG.height;
}
```

- [ ] **Step 2: Create URL codec in `src/lib/urlCodec.ts`**

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/courtMath.ts src/lib/urlCodec.ts
git commit -m "feat: add court math transforms and URL codec"
```

---

### Task 5: Rotation Engine

**Files:**
- Create: `src/lib/rotationEngine.ts`

- [ ] **Step 1: Build the rotation engine that maps team players to positions**

```typescript
import { Player, PlayerRole, RotationNumber, Phase, RotationSystem, PlayerPosition, ZoneArea } from './types';
import { rotations51, RotationData } from '@/data/rotations-5-1';
// import { rotations62 } from '@/data/rotations-6-2'; // Added in 6-2 task

type RoleKey = string;

/** Map team players to rotation role keys based on their role */
function mapPlayersToRoles(players: Player[], system: RotationSystem): Record<RoleKey, Player> {
  const mapping: Record<RoleKey, Player> = {};
  const byRole: Record<string, Player[]> = {};

  for (const p of players) {
    if (!byRole[p.role]) byRole[p.role] = [];
    byRole[p.role].push(p);
  }

  if (system === '5-1') {
    if (byRole.setter?.[0]) mapping['S'] = byRole.setter[0];
    if (byRole.outside?.[0]) mapping['OH1'] = byRole.outside[0];
    if (byRole.outside?.[1]) mapping['OH2'] = byRole.outside[1];
    if (byRole.middle?.[0]) mapping['MB1'] = byRole.middle[0];
    if (byRole.middle?.[1]) mapping['MB2'] = byRole.middle[1];
    if (byRole.opposite?.[0]) mapping['OPP'] = byRole.opposite[0];
    if (byRole.libero?.[0]) mapping['L'] = byRole.libero[0];
  }
  // 6-2 mapping added in 6-2 task

  return mapping;
}

/** Get positions for a given rotation, phase, and system */
export function getRotationState(
  players: Player[],
  system: RotationSystem,
  rotation: RotationNumber,
  phase: Phase
): { positions: PlayerPosition[]; zones: ZoneArea[] } {
  const rotationData = system === '5-1' ? rotations51 : rotations51; // TODO: swap for 6-2
  const data: RotationData = rotationData[rotation][phase];
  const playerMap = mapPlayersToRoles(players, system);

  const positions: PlayerPosition[] = [];
  const zones: ZoneArea[] = [];

  for (const [roleKey, courtPos] of Object.entries(data.positions)) {
    const player = playerMap[roleKey];
    if (player) {
      positions.push({
        playerId: player.id,
        role: player.role,
        position: courtPos,
      });
    }
  }

  for (const zone of data.zones) {
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

  return { positions, zones };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/rotationEngine.ts
git commit -m "feat: add rotation engine for mapping players to positions"
```

---

### Task 6: React Hooks (useTeam, useRotation, useAnimation, useUrlState)

**Files:**
- Create: `src/hooks/useTeam.ts`, `src/hooks/useRotation.ts`, `src/hooks/useAnimation.ts`, `src/hooks/useUrlState.ts`

- [ ] **Step 1-4: Create all four hooks**

(Each hook with full implementation — useState/useCallback for team management, rotation state, animation timing with setInterval, and URL hash sync on load/change.)

- [ ] **Step 5: Commit**

```bash
git add src/hooks/
git commit -m "feat: add React hooks for team, rotation, animation, and URL state"
```

---

### Task 7: SVG Court Components

**Files:**
- Create: `src/components/court/Court.tsx`, `src/components/court/PlayerToken.tsx`, `src/components/court/MovementArrow.tsx`, `src/components/court/ZoneOverlay.tsx`

- [ ] **Step 1-4: Build all court SVG components**

Court.tsx renders the SVG container with court lines, net, attack line, zone numbers. PlayerToken renders animated circles with number/name. MovementArrow renders curved animated paths. ZoneOverlay renders semi-transparent rectangles.

- [ ] **Step 5: Commit**

---

### Task 8: Control Components

**Files:**
- Create: `src/components/controls/RotationSelector.tsx`, `src/components/controls/PhaseToggle.tsx`, `src/components/controls/PlaybackControls.tsx`, `src/components/controls/PositionFilter.tsx`

- [ ] **Step 1-4: Build all control components**
- [ ] **Step 5: Commit**

---

### Task 9: Setup Drawer & Player Editor

**Files:**
- Create: `src/components/setup/SetupDrawer.tsx`, `src/components/setup/PlayerCard.tsx`, `src/components/setup/AvatarPicker.tsx`

- [ ] **Step 1-3: Build setup drawer with player editing**
- [ ] **Step 4: Commit**

---

### Task 10: Share Button & Position Info

**Files:**
- Create: `src/components/sharing/ShareButton.tsx`, `src/components/info/PositionInfo.tsx`

- [ ] **Step 1-2: Build share and info components**
- [ ] **Step 3: Commit**

---

### Task 11: Main Page Assembly

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Wire all components together in the main page**

Connect hooks, pass props, layout with top bar / court / bottom controls. Mobile-first responsive design.

- [ ] **Step 2: Commit**

---

### Task 12: 6-2 Rotation Data & Integration

**Files:**
- Create: `src/data/rotations-6-2.ts`
- Modify: `src/lib/rotationEngine.ts`

- [ ] **Step 1: Add 6-2 data and update engine**
- [ ] **Step 2: Commit**

---

### Task 13: Position Info Data

**Files:**
- Create: `src/data/position-info.ts`

- [ ] **Step 1: Add per-rotation tips for each position**
- [ ] **Step 2: Commit**

---

### Task 14: Polish & Mobile Testing

- [ ] **Step 1: Test on Chrome DevTools mobile emulation**
- [ ] **Step 2: Fix any layout/interaction issues**
- [ ] **Step 3: Final commit**
