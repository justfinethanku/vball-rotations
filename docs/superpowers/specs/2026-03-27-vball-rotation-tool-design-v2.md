# Volleyball Rotation Learning Tool — Design Spec v2

## Changes from v1

This revision addresses UX issues found during testing. Major additions:

1. **Responsive desktop layout** — side panel for controls/info on wider screens
2. **Swipe gestures** — left/right for rotation, up/down for phase on mobile
3. **Rotation-specific position tips** — PositionInfo uses the detailed data from position-info.ts
4. **Compact bottom controls** — consolidated 2-row layout instead of 4 rows
5. **Keyboard navigation** — arrow keys, spacebar for playback
6. **QR code sharing** — in-person practice scanning
7. **Preserve player names on system switch** — don't destroy coach's work
8. **Court visual polish** — net label, subtle gradient, better zone overlays
9. **Onboarding** — first-time welcome overlay explaining the tool
10. **Progress indicator** — timeline dots showing current position in auto-play sequence
11. **"YOU" marker** — pulsing glow on focused player's token
12. **Front-row/back-row context** — rotation buttons show setter position
13. **Centered playback controls** — fix alignment

---

## Updated Layout

### Mobile (< 768px) — same as v1 with improvements
- Sticky header (thinner)
- Court fills available space
- Compact 2-row bottom control bar (not 4 rows)
- Swipe gestures on court area

### Desktop (>= 768px) — NEW side-panel layout
```
┌─────────────────────────────────────────────┐
│  Header: Title | System Toggle | Share | Setup │
├──────────────────────┬──────────────────────┤
│                      │  Rotation Selector    │
│                      │  Phase Toggle          │
│      Court SVG       │  Playback Controls     │
│    (larger, ~600px)  │  Position Filter       │
│                      │  ─────────────────     │
│                      │  Position Info Panel   │
│                      │  (rotation-specific)   │
│                      │  ─────────────────     │
│                      │  Progress Timeline     │
├──────────────────────┴──────────────────────┤
```

Court can be larger on desktop (up to 600px) since controls live in the side panel.

## Updated Bottom Controls (Mobile)

### Compact 2-row layout
Row 1: [Position filter chips (scrollable)]
Row 2: [◀ Step] [R1-R6 selector] [▶ Step] [▶ Play] [Speed]

Phase toggle moves into the court area as a floating overlay (top-right of court) or merges into the rotation selector (R1•Serve, R1•Receive, R1•Trans).

Alternative: Phase shown as a horizontal progress bar under the court with 3 dots (Serve → Receive → Transition), tap to jump.

## Swipe Gestures

On the court SVG area (mobile only):
- **Swipe left** → next rotation (R1 → R2)
- **Swipe right** → previous rotation (R2 → R1)
- **Swipe up** → next phase (Serve → Receive)
- **Swipe down** → previous phase (Receive → Serve)

Provide a subtle swipe hint on first use (fading arrow animation).

## Keyboard Navigation

- **Left/Right arrows** → previous/next rotation
- **Up/Down arrows** → previous/next phase
- **Space** → toggle play/pause
- **1-6 number keys** → jump to rotation
- **Escape** → clear position filter / close drawer
- **?** → toggle help overlay

## Updated Court Visualization

### Visual polish
- Subtle gradient on court surface (darker at edges, lighter center)
- "NET" label centered on the net bar
- Antenna indicators at net edges (small red marks)
- Subtle wood floor texture option (CSS pattern, toggle-able)

### Zone overlays — improved approach
- When no player focused: show zone outlines only (dashed borders, no fill)
- When a player is focused: show ONLY that player's zone with subtle fill + label
- This eliminates the "green on green" visual noise problem

### Player tokens — "YOU" marker
- When a role is focused, that player's token gets:
  - Pulsing glow ring animation (their role color)
  - Slightly larger (already done)
  - "YOU" label replaces the role abbreviation badge

## Updated Position Info

### Use rotation-specific tips from position-info.ts
The `getPositionTip()` function already exists in `src/data/position-info.ts` with 90+ specific tips. The `PositionInfo.tsx` component currently ignores this and uses hardcoded generic tips. Fix: import and use `getPositionTip()`.

### Desktop: side panel (always visible when role focused)
### Mobile: floating card overlaying bottom of court (not below it, pushing content off-screen)

## Rotation Selector Enhancement

Each rotation button shows a subtle indicator of setter position:
- R1: "1" with small "S↓" (setter back row)
- R4: "4" with small "S↑" (setter front row)
- Use a tiny dot: filled = setter front row, hollow = setter back row
- This helps players instantly know which rotations have the setter front vs back

## Preserve Names on System Switch

When switching from 5-1 to 6-2:
- Keep existing outside hitters, middles, libero names/numbers
- Keep the first setter
- Add a new "Setter 2" for the 6-2 system
- Remove the opposite (6-2 doesn't have one)

When switching from 6-2 to 5-1:
- Keep existing outsides, middles, libero, first setter
- Remove second setter
- Add an "Opposite" placeholder

## Sharing — QR Code

### Implementation
- Use a client-side QR code library (qrcode.react or similar lightweight)
- Show QR in a modal when user taps "Share"
- Modal has: QR code + "Copy Link" button + team name/system info
- QR is sized for easy phone scanning (~200x200px)

## Onboarding

### First-time welcome (shown once, stored in localStorage)
- Overlay with 3-4 quick slides:
  1. "Welcome to VBall Rotations" — brief description
  2. "Choose your system" — 5-1 vs 6-2 explanation
  3. "Navigate rotations" — swipe/tap to move through
  4. "Focus on your position" — tap a role to learn
- "Skip" button always visible
- "Don't show again" checkbox

### Contextual help
- Small "?" icon in header that opens a help sheet
- Tooltips on first interaction with each control

## Progress Timeline

### Visual: row of 18 dots (6 rotations × 3 phases)
- Grouped in sets of 3 (one group per rotation)
- Current dot is highlighted in indigo
- Past dots are white
- Future dots are gray
- Tap a dot to jump to that state
- Shows during auto-play and always on desktop side panel

## Non-Goals (still excluded)
- User accounts / login
- Backend / database
- 4-2 rotation system
- Custom rotation creation (drag to position)
- Video recording
- Multi-team management
- Opponent court visualization
- Print/export view (deferred to v3)
- Comparison side-by-side view (deferred to v3)
- Quiz/learning mode (deferred to v3)
