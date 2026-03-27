# Volleyball Rotation Learning Tool — Design Spec

## Overview

A mobile-first web app that helps volleyball coaches create interactive rotation diagrams for their team. Coaches set up player profiles and share a compressed URL. Players open the link and see animated court diagrams showing where to stand and move for each rotation, with the ability to focus on their specific position.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Rendering:** SVG primary, Canvas fallback for complex animations
- **Animation:** Framer Motion (for UI) + custom SVG animation (for court)
- **URL Encoding:** lz-string for compressed shareable URLs
- **Deployment:** Vercel

## Rotation Systems

### Launch scope
- **5-1** (1 setter, 5 hitters)
- **6-2** (2 setters who hit from back row)

### Rotation states per system
- 6 rotations (R1–R6) for each system
- Each rotation has: **Serve**, **Serve Receive**, and **Transition** formations
- Base positions (legal lineup) + shifted positions (where players actually move)

## Core Layout (Single Page)

### Top Bar
- App title/logo
- Rotation system selector (5-1 / 6-2)
- "Setup Team" button → opens drawer
- Share button → copies compressed URL to clipboard

### Court View (center, primary)
- SVG volleyball court (scaled to viewport)
- Player tokens: circle with jersey number, name below, role-colored border
- Movement arrows between positions during animations
- Zone overlays showing responsibility areas (semi-transparent colored regions)
- Tap a player token to see position info tooltip

### Bottom Control Bar (fixed on mobile)
- Rotation selector: R1–R6 as segmented control
- Serving / Receiving toggle
- Play/Pause button (auto-plays serve → receive → transition sequence)
- Step forward / Step back buttons
- Position filter dropdown: "All Positions" or specific role (Outside, Opposite, Middle, Setter, Libero)

### Mobile Behavior
- Bottom bar: fixed footer
- Top bar: collapses to icon buttons
- Court view: fills remaining viewport
- Setup drawer: slides up as bottom sheet
- Landscape mode: court rotates to fill width

## Player Setup (Drawer/Sheet)

### Player Profile Fields
- Name (text input)
- Jersey number (number input)
- Position role (dropdown: Setter, Outside Hitter, Opposite, Middle Blocker, Libero, Defensive Specialist)
- Avatar: choose from preset icon library OR upload custom photo (stored as base64 in URL, with size limits)

### Preset Avatars
- ~20 simple illustrated volleyball player icons in various styles/colors
- Default assignment based on position role

### Quick Setup
- Pre-filled default team with generic names ("Setter 1", "Outside 1", etc.)
- "Randomize Names" for fun/demo purposes

## Court Visualization

### SVG Court
- Standard volleyball court proportions (9m x 18m, divided by net)
- Only show one side (the team's side) with net at top
- Zone lines for positions 1–6 labeled
- Attack line (3m line) clearly marked

### Player Tokens
- Circle avatar (40-60px) with:
  - Jersey number centered
  - Name below
  - Color-coded border by role (e.g., setter=yellow, outside=blue, middle=red, opposite=green, libero=orange)
- Highlighted/enlarged when position filter is active for that role
- Dimmed when position filter is active for a different role

### Movement Arrows
- Curved SVG paths showing movement direction
- Color-matched to player
- Animated dash pattern showing flow direction
- Visible during step-through and auto-play

### Zone Overlays
- Semi-transparent colored regions showing responsibility areas
- Toggle-able via a "Show Zones" button
- Labeled (e.g., "Zone 1", "Pipe", "Outside approach")

## Animation System

### Auto-Play Mode
- Plays full sequence: Base Position → Serve/Receive Formation → Transition → next rotation
- Configurable speed (slow/medium/fast)
- Smooth SVG transitions (300-600ms per movement)
- Pause at each state for ~2 seconds (configurable)

### Step-Through Mode
- Manual forward/back between states
- States: Base → Serve/Receive → Transition → (next rotation's) Base
- Arrow indicators show what changed

### Position Focus Mode
- Select a position role from the filter
- That player's token is highlighted and enlarged
- All other players are dimmed (30% opacity)
- Only the focused player's arrows and zone are shown prominently
- Info panel appears showing the focused position's responsibilities for the current rotation

## Position Information

### Per-rotation info for each position
- Where to stand (base, serve, receive)
- What to do (approach, cover, block)
- Key tips (e.g., "Setter releases to net after pass")

### Displayed as
- Tooltip on player tap (mobile)
- Side panel on desktop when position filter is active
- Included in the shareable URL data

## URL Sharing

### Data Encoded
- Rotation system type (5-1 or 6-2)
- Player profiles (name, number, role, avatar reference)
- Any custom position notes
- Current view state (optional — which rotation is shown)

### Encoding Strategy
- Serialize state to JSON
- Compress with lz-string (base64 URL-safe)
- Append as URL hash: `https://app.vercel.app/#data=<compressed>`
- Estimated URL length: 200-500 chars for text-only, longer with custom avatars

### Share Flow
1. Coach taps "Share"
2. URL copied to clipboard
3. Toast confirmation: "Link copied! Share with your team."
4. Optional: "Share as QR Code" for in-person practice

## Data Model

```typescript
interface Team {
  name: string;
  system: '5-1' | '6-2';
  players: Player[];
}

interface Player {
  id: string;
  name: string;
  number: number;
  role: PlayerRole;
  avatar: string; // preset key or base64
}

type PlayerRole = 'setter' | 'outside' | 'opposite' | 'middle' | 'libero' | 'ds';

interface RotationState {
  rotation: 1 | 2 | 3 | 4 | 5 | 6;
  phase: 'base' | 'serve' | 'receive' | 'transition';
  positions: PlayerPosition[];
  zones: ZoneOverlay[];
}

interface PlayerPosition {
  playerId: string;
  x: number; // court coordinates (0-9)
  y: number; // court coordinates (0-9)
}

interface ZoneOverlay {
  playerId: string;
  area: { x: number; y: number; width: number; height: number };
  label: string;
}
```

## Rotation Data

### Pre-built rotation data for 5-1 and 6-2
- All 6 rotations with serve, receive, and transition positions
- Standard formations based on common coaching diagrams
- Zone responsibility data for each rotation/phase

### Stored as static JSON
- `/data/rotations/5-1.json`
- `/data/rotations/6-2.json`
- Positions defined in court coordinate system

## Component Architecture

```
app/
  page.tsx              — Main single-page app
  layout.tsx            — Root layout with metadata
components/
  CourtView/
    Court.tsx           — SVG court container
    PlayerToken.tsx     — Individual player circle
    MovementArrow.tsx   — Animated arrow paths
    ZoneOverlay.tsx     — Responsibility area overlay
    NetLine.tsx         — Net visualization
  Controls/
    RotationSelector.tsx — R1-R6 segmented control
    PhaseToggle.tsx     — Serve/Receive toggle
    PlaybackControls.tsx — Play/pause/step
    PositionFilter.tsx  — Position focus dropdown
    SpeedControl.tsx    — Animation speed
  Setup/
    SetupDrawer.tsx     — Slide-up drawer/sheet
    PlayerCard.tsx      — Individual player editor
    AvatarPicker.tsx    — Preset avatar grid + upload
    SystemSelector.tsx  — 5-1/6-2 picker
  Sharing/
    ShareButton.tsx     — Copy URL + QR code
    UrlEncoder.tsx      — lz-string encode/decode
  Info/
    PositionInfo.tsx    — Position tips panel
    RotationGuide.tsx   — General rotation explainer
hooks/
  useRotation.ts        — Current rotation state management
  useAnimation.ts       — Animation timing/playback
  useUrlState.ts        — URL encode/decode + sync
  useTeam.ts            — Team/player state management
data/
  rotations/
    5-1.json            — 5-1 rotation positions
    6-2.json            — 6-2 rotation positions
  avatars/              — Preset avatar SVGs
lib/
  courtMath.ts          — Coordinate transforms
  urlCodec.ts           — lz-string compression
  rotationEngine.ts     — Rotation logic + interpolation
```

## Non-Goals (for now)
- User accounts / login
- Backend / database
- 4-2 rotation system
- Custom rotation creation from scratch
- Video recording of animations
- Multi-team management
- Opponent court visualization
