# UX/UI Overhaul: "Clean Instrument" Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the volleyball rotations app into a polished, modern learning tool with maximum court space, clear phase transitions, contextual help, and professional UI across all viewports.

**Architecture:** Incremental refactor of existing components. No new frameworks. New features (help system, variants, token modes) are additive. Layout changes are primarily in page.tsx and globals.css. New data files for 5-1 variants.

**Tech Stack:** Next.js 16.2, React 19, Tailwind CSS 4, Framer Motion 12, existing dependencies.

**Spec:** `docs/superpowers/specs/2026-03-27-ux-ui-overhaul-design.md`

---

## File Structure

### New Files
- `src/lib/preferences.ts` — localStorage-backed user preferences (token display mode, learn mode, reduce motion, court flip, dismissed help)
- `src/hooks/usePreferences.ts` — React hook wrapping preferences with state
- `src/components/controls/PhaseStepper.tsx` — Replaces PhaseToggle with connected stepper design
- `src/components/controls/RotationCarousel.tsx` — Replaces RotationSelector with carousel + mini formations
- `src/components/controls/MobileBottomBar.tsx` — New mobile bottom navigation bar
- `src/components/controls/DesktopSidebar.tsx` — New collapsible sidebar rail for desktop
- `src/components/court/GhostTrail.tsx` — Ghost token at previous position with dotted path
- `src/components/help/HelpPopover.tsx` — Reusable `?` icon popover component
- `src/components/help/Glossary.tsx` — Full glossary page/modal
- `src/components/info/PlayerInfoSheet.tsx` — Redesigned player info (bottom sheet mobile, panel desktop)
- `src/data/rotations-5-1-spread.ts` — Spread 5-1 variant positions
- `src/data/rotations-5-1-slide.ts` — Slide-heavy 5-1 variant positions
- `src/data/rotations-5-1-reverse.ts` — Reverse 5-1 variant positions
- `src/data/variants.ts` — Variant registry and metadata

### Modified Files
- `src/app/page.tsx` — Complete layout overhaul (mobile + desktop)
- `src/app/globals.css` — New utility classes, fix glass consistency, animations
- `src/lib/types.ts` — Add variant type, token display mode, preferences types
- `src/lib/constants.ts` — Add variant constants
- `src/lib/rotationEngine.ts` — Add variant parameter support
- `src/lib/courtMath.ts` — No changes needed
- `src/hooks/useTeam.ts` — Add variant state
- `src/hooks/useRotation.ts` — Pass variant through, expose movedPlayers computation
- `src/hooks/useUrlState.ts` — Encode rotation/phase/variant/displayMode in URL
- `src/components/court/Court.tsx` — Court flip support
- `src/components/court/PlayerToken.tsx` — 3 display modes, filled circles, front/back row styling, libero shape
- `src/components/court/MovementArrow.tsx` — CSS class transitions instead of inline
- `src/components/court/ZoneOverlay.tsx` — CSS class transitions instead of inline
- `src/components/setup/SetupDrawer.tsx` — Add variant selector, jersey toggle, reset button, scroll indicator, fix input consistency
- `src/components/setup/PlayerCard.tsx` — Fix input border-radius, alignment
- `src/components/info/PositionInfo.tsx` — Gutted and replaced by PlayerInfoSheet
- `src/components/onboarding/Welcome.tsx` — Rewrite as 3-step spotlight walkthrough
- `src/components/compare/CompareView.tsx` — Add variant comparison
- `src/components/sharing/ShareButton.tsx` — Add loading spinner, error toast
- `src/components/controls/PositionFilter.tsx` — Fix sizing
- `src/components/controls/PlaybackControls.tsx` — Simplify (move speed to settings)
- `src/components/controls/ProgressTimeline.tsx` — Delete (replaced by progress bar in state pill)

---

## Task 1: Types, Preferences, and Foundation

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/preferences.ts`
- Create: `src/hooks/usePreferences.ts`

- [ ] **Step 1: Add new types to types.ts**

```typescript
// Add to end of src/lib/types.ts:

export type VariantId = 'standard' | 'spread' | 'slide' | 'reverse';

export type TokenDisplayMode = 'jersey' | 'role' | 'name';

export interface UserPreferences {
  tokenDisplayMode: TokenDisplayMode;
  learnMode: boolean;
  reduceMotion: boolean;
  courtFlipped: boolean;
  dismissedHelp: string[]; // IDs of dismissed help popovers
  onboardingSeen: boolean;
}
```

- [ ] **Step 2: Create preferences.ts**

```typescript
// src/lib/preferences.ts
import { UserPreferences, TokenDisplayMode } from './types';

const STORAGE_KEY = 'vball-preferences';

const DEFAULTS: UserPreferences = {
  tokenDisplayMode: 'role',
  learnMode: false,
  reduceMotion: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  courtFlipped: false,
  dismissedHelp: [],
  onboardingSeen: false,
};

export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return { ...DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Migrate old onboarding flag
      if (localStorage.getItem('vball-onboarding-seen')) {
        const prefs = { ...DEFAULTS, onboardingSeen: true };
        savePreferences(prefs);
        return prefs;
      }
      return { ...DEFAULTS };
    }
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
```

- [ ] **Step 3: Create usePreferences hook**

```typescript
// src/hooks/usePreferences.ts
'use client';

import { useState, useCallback, useEffect } from 'react';
import { UserPreferences, TokenDisplayMode } from '@/lib/types';
import { loadPreferences, savePreferences } from '@/lib/preferences';

export function usePreferences() {
  const [prefs, setPrefs] = useState<UserPreferences>(loadPreferences);

  // Persist on every change
  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  const setTokenDisplayMode = useCallback((mode: TokenDisplayMode) => {
    setPrefs(p => ({ ...p, tokenDisplayMode: mode }));
  }, []);

  const toggleLearnMode = useCallback(() => {
    setPrefs(p => ({ ...p, learnMode: !p.learnMode }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setPrefs(p => ({ ...p, reduceMotion: !p.reduceMotion }));
  }, []);

  const toggleCourtFlipped = useCallback(() => {
    setPrefs(p => ({ ...p, courtFlipped: !p.courtFlipped }));
  }, []);

  const dismissHelp = useCallback((id: string) => {
    setPrefs(p => ({
      ...p,
      dismissedHelp: [...new Set([...p.dismissedHelp, id])],
    }));
  }, []);

  const markOnboardingSeen = useCallback(() => {
    setPrefs(p => ({ ...p, onboardingSeen: true }));
  }, []);

  const cycleTokenDisplayMode = useCallback(() => {
    setPrefs(p => {
      const modes: TokenDisplayMode[] = ['jersey', 'role', 'name'];
      const idx = modes.indexOf(p.tokenDisplayMode);
      return { ...p, tokenDisplayMode: modes[(idx + 1) % modes.length] };
    });
  }, []);

  return {
    ...prefs,
    setTokenDisplayMode,
    toggleLearnMode,
    toggleReduceMotion,
    toggleCourtFlipped,
    dismissHelp,
    markOnboardingSeen,
    cycleTokenDisplayMode,
  };
}
```

- [ ] **Step 4: Verify build**

Run: `cd C:/Users/Moe/source/repos/vball-rotations && npx next build 2>&1 | tail -20`
Expected: Build succeeds (new files aren't imported yet)

- [ ] **Step 5: Commit**

```bash
git add src/lib/types.ts src/lib/preferences.ts src/hooks/usePreferences.ts
git commit -m "feat: add user preferences system with token display modes and settings"
```

---

## Task 2: Global CSS Overhaul

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Rewrite globals.css**

Replace entire file with:

```css
@import "tailwindcss";

:root {
  --background: #030712;
  --foreground: #f9fafb;
  --glass-bg: rgba(15, 23, 42, 0.95);
  --glass-border: rgba(255, 255, 255, 0.08);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}

body {
  background: var(--background);
  color: var(--foreground);
  overscroll-behavior: none;
  -webkit-tap-highlight-color: transparent;
}

/* Hide scrollbar on filter chips */
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

/* Glass panel — unified system */
.glass {
  background: var(--glass-bg);
  border-color: var(--glass-border);
}

/* Gradient fade for floating controls */
.fade-up {
  background: linear-gradient(to top, rgba(3, 7, 18, 0.95) 40%, rgba(3, 7, 18, 0.6) 70%, transparent 100%);
}

/* Button press feedback */
.btn-press:active { opacity: 0.7; }

/* Focus-visible ring for all interactive elements */
.focus-ring:focus-visible {
  outline: 2px solid #818cf8;
  outline-offset: 2px;
}

/* Custom selection color */
::selection { background: rgba(99, 102, 241, 0.3); }

/* Smooth rendering */
* {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Safe area padding */
.pb-safe { padding-bottom: max(8px, env(safe-area-inset-bottom)); }

/* Ghost trail animation */
@keyframes ghost-fade {
  0% { opacity: 0.6; }
  100% { opacity: 0; }
}
.ghost-trail {
  animation: ghost-fade 2s ease-out forwards;
}

/* Reduce motion override */
@media (prefers-reduced-motion: reduce) {
  .ghost-trail { animation: none; opacity: 0; }
}

/* Phase description slide-in */
@keyframes slide-down-fade {
  0% { opacity: 0; transform: translateY(-8px); }
  10% { opacity: 1; transform: translateY(0); }
  80% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-4px); }
}
.phase-description {
  animation: slide-down-fade 2.5s ease-out forwards;
}

/* Scroll fade indicator */
.scroll-fade-bottom {
  mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, black 85%, transparent 100%);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: overhaul global CSS — unified glass system, focus rings, ghost animations"
```

---

## Task 3: PlayerToken Redesign — Display Modes, Filled Circles, Front/Back Row

**Files:**
- Modify: `src/components/court/PlayerToken.tsx`
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Add ATTACK_LINE_Y court constant for front/back detection to constants.ts**

Add to `src/lib/constants.ts` at end:

```typescript
export const FRONT_ROW_THRESHOLD = 3; // y <= 3 means front row in court coords
```

- [ ] **Step 2: Rewrite PlayerToken.tsx**

Replace entire file:

```tsx
'use client';

import React from 'react';
import { PlayerRole, CourtPosition, TokenDisplayMode } from '@/lib/types';
import { ROLE_COLORS, ROLE_SHORT, FRONT_ROW_THRESHOLD } from '@/lib/constants';
import { courtToSvg } from '@/lib/courtMath';

interface PlayerTokenProps {
  playerId: string;
  name: string;
  number: number;
  role: PlayerRole;
  position: CourtPosition;
  isFocused: boolean;
  isDimmed: boolean;
  displayMode: TokenDisplayMode;
  onClick?: () => void;
}

export default function PlayerToken({
  playerId,
  name,
  number,
  role,
  position,
  isFocused,
  isDimmed,
  displayMode,
  onClick,
}: PlayerTokenProps) {
  const svg = courtToSvg(position);
  const color = ROLE_COLORS[role];
  const radius = isFocused ? 24 : 20;
  const isBackRow = position.y > FRONT_ROW_THRESHOLD;
  const isLibero = role === 'libero';

  // Determine display text
  let displayText: string;
  switch (displayMode) {
    case 'jersey':
      displayText = String(number);
      break;
    case 'role':
      displayText = ROLE_SHORT[role];
      break;
    case 'name':
      displayText = name.length > 3 ? name.slice(0, 3).toUpperCase() : name.toUpperCase();
      break;
  }

  // Truncate name for label below
  const labelName = name.length > 8 ? name.slice(0, 7) + '\u2026' : name;

  // Clamp "YOU" label to not overflow above SVG
  const youLabelY = Math.max(-(radius + 8), -45);

  return (
    <g
      transform={`translate(${svg.x}, ${svg.y})`}
      opacity={isDimmed ? 0.4 : 1}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.4s ease, opacity 0.4s ease' }}
      role="button"
      aria-label={`${name}, ${ROLE_SHORT[role]}, ${isBackRow ? 'back' : 'front'} row`}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Focused label */}
      {isFocused && (
        <text
          y={youLabelY}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={9}
          fontWeight="bold"
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {isBackRow ? 'BACK ROW' : 'FRONT ROW'}
        </text>
      )}

      {/* Glow ring (focused) */}
      {isFocused && (
        <circle
          r={radius + 5}
          fill="none"
          stroke={color}
          strokeWidth={3}
          opacity={0.6}
        />
      )}

      {/* Main shape — circle for normal, rounded rect for libero */}
      {isLibero ? (
        <rect
          x={-radius}
          y={-radius}
          width={radius * 2}
          height={radius * 2}
          rx={8}
          fill={color}
          stroke="white"
          strokeWidth={isFocused ? 3.5 : 2.5}
          strokeDasharray={isBackRow ? '6 3' : undefined}
        />
      ) : (
        <circle
          r={radius}
          fill={color}
          stroke="white"
          strokeWidth={isFocused ? 3.5 : 2.5}
          strokeDasharray={isBackRow ? '6 3' : undefined}
        />
      )}

      {/* Display text (jersey/role/name) */}
      <text
        textAnchor="middle"
        dominantBaseline="central"
        fill="white"
        fontSize={displayMode === 'name' ? 11 : 14}
        fontWeight="bold"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {displayText}
      </text>

      {/* Name below token */}
      {!isDimmed && (
        <text
          y={radius + 12}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={9}
          opacity={isFocused ? 1 : 0.7}
          style={{ userSelect: 'none', pointerEvents: 'none' }}
        >
          {isFocused ? (name.length > 10 ? name.slice(0, 9) + '\u2026' : name) : labelName}
        </text>
      )}
    </g>
  );
}
```

- [ ] **Step 3: Verify build compiles (token won't render yet since page.tsx hasn't been updated to pass displayMode)**

Run: `npx next build 2>&1 | tail -5`
Expected: Build error on page.tsx (missing displayMode prop) — that's expected, fixed in Task 7.

- [ ] **Step 4: Commit**

```bash
git add src/components/court/PlayerToken.tsx src/lib/constants.ts
git commit -m "feat: redesign player tokens — display modes, filled circles, front/back row, libero shape"
```

---

## Task 4: PhaseStepper — Replace PhaseToggle

**Files:**
- Create: `src/components/controls/PhaseStepper.tsx`

- [ ] **Step 1: Create PhaseStepper.tsx**

```tsx
'use client';

import { Phase } from '@/lib/types';

interface PhaseStepperProps {
  current: Phase;
  onChange: (phase: Phase) => void;
  movedCount?: number;
  compact?: boolean;
}

const PHASES: Phase[] = ['serve', 'receive', 'transition'];
const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serve',
  receive: 'Receive',
  transition: 'Transition',
};
const PHASE_LABELS_SHORT: Record<Phase, string> = {
  serve: 'Srv',
  receive: 'Rcv',
  transition: 'Trans',
};

export default function PhaseStepper({ current, onChange, movedCount, compact = false }: PhaseStepperProps) {
  const labels = compact ? PHASE_LABELS_SHORT : PHASE_LABELS;
  const currentIdx = PHASES.indexOf(current);

  return (
    <div className="flex items-center gap-0">
      {PHASES.map((phase, i) => {
        const isActive = phase === current;
        const isPast = i < currentIdx;

        return (
          <div key={phase} className="flex items-center">
            {/* Connector line before (except first) */}
            {i > 0 && (
              <div
                className="h-0.5 transition-colors duration-200"
                style={{
                  width: compact ? 12 : 20,
                  backgroundColor: isPast || isActive ? '#6366f1' : 'rgba(255,255,255,0.15)',
                }}
              />
            )}

            {/* Phase button */}
            <button
              onClick={() => onChange(phase)}
              className={`focus-ring relative flex items-center justify-center rounded-full font-semibold transition-all btn-press ${
                isActive
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : isPast
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'bg-white/10 text-gray-400 hover:text-white hover:bg-white/15'
              }`}
              style={{
                minWidth: compact ? 56 : 80,
                height: compact ? 36 : 40,
                fontSize: compact ? 11 : 13,
              }}
            >
              {labels[phase]}

              {/* Moved badge — only on active phase */}
              {isActive && movedCount !== undefined && movedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-bold text-black">
                  {movedCount}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/controls/PhaseStepper.tsx
git commit -m "feat: add PhaseStepper component with connected stepper design and moved badge"
```

---

## Task 5: RotationCarousel — Replace RotationSelector

**Files:**
- Create: `src/components/controls/RotationCarousel.tsx`

- [ ] **Step 1: Create RotationCarousel.tsx**

```tsx
'use client';

import { RotationNumber, RotationSystem } from '@/lib/types';

interface RotationCarouselProps {
  current: RotationNumber;
  onChange: (rotation: RotationNumber) => void;
  system: RotationSystem;
  compact?: boolean;
}

const ROTATIONS: RotationNumber[] = [1, 2, 3, 4, 5, 6];

// Setter front row in 5-1 system
const SETTER_FRONT_51: Record<RotationNumber, boolean> = {
  1: false, 2: false, 3: false, 4: true, 5: true, 6: true,
};

export default function RotationCarousel({ current, onChange, system, compact = false }: RotationCarouselProps) {
  const getSetterRow = (r: RotationNumber): string => {
    if (system === '6-2') return r <= 3 ? 'S1 Back' : 'S1 Front';
    return SETTER_FRONT_51[r] ? 'Setter: Front' : 'Setter: Back';
  };

  if (compact) {
    // Mobile: compact pill selector
    return (
      <div className="flex bg-white/10 rounded-full p-1 gap-0.5">
        {ROTATIONS.map(r => (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`focus-ring w-11 h-11 rounded-full text-sm font-bold btn-press transition-all ${
              current === r
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label={`Rotation ${r}, ${getSetterRow(r)}`}
          >
            {r}
          </button>
        ))}
      </div>
    );
  }

  // Desktop: carousel with setter info
  return (
    <div className="flex gap-1.5">
      {ROTATIONS.map(r => {
        const isActive = current === r;
        const setterRow = getSetterRow(r);

        return (
          <button
            key={r}
            onClick={() => onChange(r)}
            className={`focus-ring flex-1 flex flex-col items-center gap-0.5 rounded-lg py-2 transition-all btn-press ${
              isActive
                ? 'bg-indigo-500/20 border border-indigo-500/40 text-white'
                : 'bg-white/5 border border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <span className="text-base font-bold">R{r}</span>
            <span className={`text-[10px] leading-tight ${isActive ? 'text-indigo-300' : 'text-gray-500'}`}>
              {setterRow}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/controls/RotationCarousel.tsx
git commit -m "feat: add RotationCarousel with setter row labels replacing dot indicators"
```

---

## Task 6: GhostTrail Component — Phase Transition Visualization

**Files:**
- Create: `src/components/court/GhostTrail.tsx`

- [ ] **Step 1: Create GhostTrail.tsx**

```tsx
'use client';

import { PlayerRole, CourtPosition } from '@/lib/types';
import { ROLE_COLORS } from '@/lib/constants';
import { courtToSvg, getArrowPath } from '@/lib/courtMath';

interface GhostTrailProps {
  from: CourtPosition;
  to: CourtPosition;
  role: PlayerRole;
  reduceMotion: boolean;
}

export default function GhostTrail({ from, to, role, reduceMotion }: GhostTrailProps) {
  if (reduceMotion) return null;

  const fromSvg = courtToSvg(from);
  const toSvg = courtToSvg(to);
  const color = ROLE_COLORS[role];
  const path = getArrowPath(fromSvg, toSvg);

  return (
    <g className="ghost-trail" style={{ pointerEvents: 'none' }}>
      {/* Ghost circle at previous position */}
      <circle
        cx={fromSvg.x}
        cy={fromSvg.y}
        r={16}
        fill={color}
        opacity={0.3}
        strokeDasharray="4 2"
        stroke={color}
        strokeWidth={1.5}
      />

      {/* Dotted path from old to new */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeDasharray="4 4"
        opacity={0.4}
      />
    </g>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/court/GhostTrail.tsx
git commit -m "feat: add GhostTrail component for phase transition visualization"
```

---

## Task 7: HelpPopover Component

**Files:**
- Create: `src/components/help/HelpPopover.tsx`

- [ ] **Step 1: Create HelpPopover.tsx**

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface HelpPopoverProps {
  id: string;
  title: string;
  content: string;
  dismissed: boolean;
  onDismiss: (id: string) => void;
}

export function HelpPopover({ id, title, content, dismissed, onDismiss }: HelpPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (dismissed) return null;

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-gray-400 text-[10px] font-bold hover:bg-white/20 hover:text-white transition-colors"
        aria-label={`Help: ${title}`}
      >
        ?
      </button>

      {isOpen && (
        <div className="absolute z-50 top-7 left-1/2 -translate-x-1/2 w-64 rounded-xl border border-white/10 bg-gray-800 p-3 shadow-2xl shadow-black/40">
          <h4 className="text-sm font-semibold text-white mb-1">{title}</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{content}</p>
          <button
            onClick={() => { onDismiss(id); setIsOpen(false); }}
            className="mt-2 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Got it, don't show again
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/help/HelpPopover.tsx
git commit -m "feat: add HelpPopover component for contextual help system"
```

---

## Task 8: Glossary Component

**Files:**
- Create: `src/components/help/Glossary.tsx`

- [ ] **Step 1: Create Glossary.tsx**

```tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface GlossaryProps {
  isOpen: boolean;
  onClose: () => void;
}

const TERMS = [
  { term: 'Rotation', definition: 'One of 6 positions in the serve order. Teams rotate clockwise each time they win serve back from the opponent.' },
  { term: 'Phase', definition: 'Each rotation has 3 phases: Serve (starting positions), Receive (where players pass from), and Transition (where players move to attack/defend).' },
  { term: 'Setter (S)', definition: 'The playmaker who delivers the ball to hitters. In a 5-1, one setter plays all rotations. In a 6-2, two setters alternate.' },
  { term: 'Outside Hitter (OH)', definition: 'Primary attacker from the left side (zone 4). Also a key passer in serve receive.' },
  { term: 'Middle Blocker (MB)', definition: 'Quick attacker at the net who runs fast-tempo sets. Also the primary blocker on defense.' },
  { term: 'Opposite (OPP)', definition: 'Right-side attacker (zone 2) who plays opposite the setter in the rotation. In a 6-2, this role doesn\'t exist.' },
  { term: 'Libero (L)', definition: 'Defensive specialist who wears a different jersey. Cannot attack above the net or set from in front of the attack line. Substitutes freely for back-row players.' },
  { term: 'Front Row', definition: 'The 3 players closest to the net (zones 2, 3, 4). Only front-row players can attack above the net at the net.' },
  { term: 'Back Row', definition: 'The 3 players farthest from the net (zones 1, 5, 6). Can only attack from behind the 3-meter line.' },
  { term: 'Overlap', definition: 'An illegal positioning fault. Adjacent players in the serve order must maintain correct left-right and front-back relationships until the serve is contacted.' },
  { term: '5-1 System', definition: 'Offensive system with 1 setter and 5 hitters. The setter sets from all rotations, penetrating from the back row when needed.' },
  { term: '6-2 System', definition: 'Offensive system with 2 setters. The back-row setter always sets, giving 3 front-row attackers in every rotation.' },
  { term: 'Penetration', definition: 'When the setter moves from their back-row position to the net to run the offense after the serve is contacted.' },
  { term: 'Zone', definition: 'Court positions numbered 1-6. Zone 1 is back-right, going counter-clockwise: 2 (front-right), 3 (front-center), 4 (front-left), 5 (back-left), 6 (back-center).' },
  { term: 'Attack Line', definition: 'The 3-meter line. Back-row players must jump from behind this line to attack above the net.' },
];

export function Glossary({ isOpen, onClose }: GlossaryProps) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? TERMS.filter(t =>
        t.term.toLowerCase().includes(search.toLowerCase()) ||
        t.definition.toLowerCase().includes(search.toLowerCase())
      )
    : TERMS;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-gray-900 md:inset-4 md:rounded-2xl md:m-auto md:max-w-lg md:max-h-[80vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">Volleyball Glossary</h2>
              <button
                onClick={onClose}
                className="focus-ring p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close glossary"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search terms..."
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Terms */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              <div className="space-y-3">
                {filtered.map(({ term, definition }) => (
                  <div key={term} className="rounded-lg bg-white/5 p-3">
                    <h3 className="text-sm font-semibold text-indigo-300">{term}</h3>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">{definition}</p>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">No matching terms</p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/help/Glossary.tsx
git commit -m "feat: add volleyball glossary modal with search"
```

---

## Task 9: PlayerInfoSheet — Redesigned Context-Aware Info

**Files:**
- Create: `src/components/info/PlayerInfoSheet.tsx`

- [ ] **Step 1: Create PlayerInfoSheet.tsx**

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Player, PlayerRole, RotationNumber, Phase, RotationSystem, PlayerPosition } from '@/lib/types';
import { ROLE_COLORS, ROLE_LABELS, ROLE_SHORT, FRONT_ROW_THRESHOLD } from '@/lib/constants';
import { getPositionTip } from '@/data/position-info';

interface PlayerInfoSheetProps {
  player: Player | null;
  role: PlayerRole | null;
  rotation: RotationNumber;
  phase: Phase;
  system: RotationSystem;
  position: PlayerPosition | null;
  nextPhasePosition: PlayerPosition | null;
  onClose: () => void;
}

const ROLE_BRIEF: Record<PlayerRole, string> = {
  setter: 'Runs the offense. Delivers sets to hitters.',
  outside: 'Primary attacker from the left side. Key passer.',
  middle: 'Quick attacker and primary blocker at the net.',
  opposite: 'Right-side attacker. Blocks the outside hitter.',
  libero: 'Defensive specialist. Cannot attack above the net.',
  ds: 'Back-row substitute. Serves and plays defense.',
};

const PHASE_LABELS: Record<Phase, string> = {
  serve: 'Serving',
  receive: 'Serve Receive',
  transition: 'Transition',
};

// Map court coords to zone numbers (approximate)
function getZoneNumber(x: number, y: number): number {
  const isBack = y > FRONT_ROW_THRESHOLD;
  if (isBack) {
    if (x < 3) return 5;
    if (x > 6) return 1;
    return 6;
  }
  if (x < 3) return 4;
  if (x > 6) return 2;
  return 3;
}

export function PlayerInfoSheet({
  player,
  role,
  rotation,
  phase,
  system,
  position,
  nextPhasePosition,
  onClose,
}: PlayerInfoSheetProps) {
  if (!role) return null;

  const color = ROLE_COLORS[role];
  const label = ROLE_LABELS[role];
  const positionTip = getPositionTip(system, rotation, phase, role);
  const brief = positionTip.responsibility || ROLE_BRIEF[role];
  const tip = positionTip.tip;

  const currentZone = position ? getZoneNumber(position.position.x, position.position.y) : null;
  const isBackRow = position ? position.position.y > FRONT_ROW_THRESHOLD : null;

  // Next phase movement preview
  let movementPreview: string | null = null;
  if (nextPhasePosition && position) {
    const nextZone = getZoneNumber(nextPhasePosition.position.x, nextPhasePosition.position.y);
    if (nextZone !== currentZone) {
      movementPreview = `Next: moves to Zone ${nextZone}`;
    }
  }

  const content = (
    <div
      className="rounded-xl border bg-gray-900/95 backdrop-blur-lg shadow-2xl shadow-black/30 overflow-hidden"
      style={{ borderColor: `${color}40` }}
    >
      {/* Color header bar */}
      <div className="h-1" style={{ backgroundColor: color }} />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ backgroundColor: color }}
            >
              {ROLE_SHORT[role]}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {player ? `${player.name} · #${player.number}` : label}
              </div>
              <div className="text-[11px] text-gray-400">
                {label} · R{rotation} · {PHASE_LABELS[phase]}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="focus-ring p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close info"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Zone + Row info */}
        {currentZone !== null && (
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
              Zone {currentZone}
            </span>
            <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              isBackRow ? 'bg-orange-500/20 text-orange-300' : 'bg-green-500/20 text-green-300'
            }`}>
              {isBackRow ? 'Back Row' : 'Front Row'}
            </span>
          </div>
        )}

        {/* Responsibility */}
        <p className="text-xs text-gray-300 mb-2 leading-relaxed">{brief}</p>

        {/* Phase-specific tip */}
        {tip && (
          <div
            className="rounded-lg px-3 py-2 text-xs text-white/90 leading-relaxed"
            style={{ backgroundColor: `${color}18` }}
          >
            {tip}
          </div>
        )}

        {/* Movement preview */}
        {movementPreview && (
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-indigo-300">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            {movementPreview}
          </div>
        )}
      </div>
    </div>
  );

  return content;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/info/PlayerInfoSheet.tsx
git commit -m "feat: add PlayerInfoSheet with zone info, movement preview, context-aware tips"
```

---

## Task 10: Variant System — Data and Engine

**Files:**
- Create: `src/data/variants.ts`
- Create: `src/data/rotations-5-1-spread.ts`
- Create: `src/data/rotations-5-1-slide.ts`
- Create: `src/data/rotations-5-1-reverse.ts`
- Modify: `src/lib/rotationEngine.ts`
- Modify: `src/hooks/useTeam.ts`

- [ ] **Step 1: Create variants.ts registry**

```typescript
// src/data/variants.ts
import { VariantId } from '@/lib/types';

export interface VariantMeta {
  id: VariantId;
  name: string;
  description: string;
  system: '5-1' | '6-2';
}

export const VARIANTS: VariantMeta[] = [
  { id: 'standard', name: 'Standard 5-1', description: 'Traditional setter penetration to zone 2/3', system: '5-1' },
  { id: 'spread', name: 'Spread 5-1', description: 'Wider outside spacing, quicker middle tempo', system: '5-1' },
  { id: 'slide', name: 'Slide-Heavy 5-1', description: 'Middle runs slides behind the setter', system: '5-1' },
  { id: 'reverse', name: 'Reverse 5-1', description: 'Setter penetrates to zone 4 side', system: '5-1' },
];

export function getVariantsForSystem(system: '5-1' | '6-2'): VariantMeta[] {
  return VARIANTS.filter(v => v.system === system);
}
```

- [ ] **Step 2: Create rotations-5-1-spread.ts**

This file follows the exact same shape as `rotations-5-1.ts`. The key differences: outsides positioned wider (x positions pushed to 0.5 and 8.5 in transition), middles closer to setter.

```typescript
// src/data/rotations-5-1-spread.ts
import { CourtPosition, Phase, RotationNumber } from '@/lib/types';
import { RoleKey51, RotationData } from './rotations-5-1';

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;

// Spread 5-1: Wider OH spacing, MB closer to setter for quick tempo
// Only transition positions differ significantly from standard
export { type RoleKey51 } from './rotations-5-1';

// Import standard as base and override transition positions
import { rotations51 as standard } from './rotations-5-1';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const rotations51Spread: RotationMap = (() => {
  const data = deepClone(standard);

  // Spread adjustments: widen OH positions in transition phases
  for (const rot of [1, 2, 3, 4, 5, 6] as RotationNumber[]) {
    const trans = data[rot].transition;
    // Push OHs wider
    if (trans.positions.OH1.y <= 3) { // front row OH
      trans.positions.OH1.x = Math.max(0.5, trans.positions.OH1.x - 1);
    }
    if (trans.positions.OH2.y <= 3) {
      trans.positions.OH2.x = Math.max(0.5, trans.positions.OH2.x - 1);
    }
    // Pull MB closer to setter
    if (trans.positions.MB1.y <= 3) {
      const setterX = trans.positions.S.x;
      trans.positions.MB1.x = setterX + (trans.positions.MB1.x > setterX ? -0.5 : 0.5);
    }
  }

  return data;
})();
```

- [ ] **Step 3: Create rotations-5-1-slide.ts**

```typescript
// src/data/rotations-5-1-slide.ts
import { Phase, RotationNumber } from '@/lib/types';
import { RoleKey51, RotationData } from './rotations-5-1';
import { rotations51 as standard } from './rotations-5-1';

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;
export { type RoleKey51 } from './rotations-5-1';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const rotations51Slide: RotationMap = (() => {
  const data = deepClone(standard);

  // Slide-heavy: MB transitions to behind setter for slide attacks
  for (const rot of [1, 2, 3, 4, 5, 6] as RotationNumber[]) {
    const trans = data[rot].transition;
    // Move front-row MB behind (to the right of) setter
    if (trans.positions.MB1.y <= 3) {
      const setterX = trans.positions.S.x;
      trans.positions.MB1.x = Math.min(8.5, setterX + 1.5);
      trans.positions.MB1.y = 1.5; // tight to net for slide
    }
  }

  return data;
})();
```

- [ ] **Step 4: Create rotations-5-1-reverse.ts**

```typescript
// src/data/rotations-5-1-reverse.ts
import { Phase, RotationNumber } from '@/lib/types';
import { RoleKey51, RotationData } from './rotations-5-1';
import { rotations51 as standard } from './rotations-5-1';

type RotationMap = Record<RotationNumber, Record<Phase, RotationData>>;
export { type RoleKey51 } from './rotations-5-1';

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export const rotations51Reverse: RotationMap = (() => {
  const data = deepClone(standard);

  // Reverse: Setter penetrates to zone 4 (left side) instead of 2/3
  for (const rot of [1, 2, 3, 4, 5, 6] as RotationNumber[]) {
    const recv = data[rot].receive;
    const trans = data[rot].transition;

    // Flip setter transition position to left side
    if (trans.positions.S.y <= 3) {
      // Front-row setter: move to left-center
      trans.positions.S.x = 2;
    } else if (trans.positions.S.y <= 4) {
      // Penetrating setter: go to zone 4 area
      trans.positions.S.x = 2;
      trans.positions.S.y = 2;
    }

    // Adjust receive penetration target
    if (recv.positions.S.y > 3) {
      // Back-row setter preparing to penetrate left
      recv.positions.S.x = Math.max(1.5, recv.positions.S.x - 2);
    }
  }

  return data;
})();
```

- [ ] **Step 5: Update rotationEngine.ts to support variants**

```typescript
// Replace the imports at top of src/lib/rotationEngine.ts:
import { Player, PlayerRole, RotationNumber, Phase, RotationSystem, PlayerPosition, ZoneArea, VariantId } from './types';
import { rotations51, RoleKey51 } from '@/data/rotations-5-1';
import { rotations62, RoleKey62 } from '@/data/rotations-6-2';
import { rotations51Spread } from '@/data/rotations-5-1-spread';
import { rotations51Slide } from '@/data/rotations-5-1-slide';
import { rotations51Reverse } from '@/data/rotations-5-1-reverse';

// Add variant lookup after imports:
const VARIANT_DATA: Record<VariantId, typeof rotations51> = {
  standard: rotations51,
  spread: rotations51Spread,
  slide: rotations51Slide,
  reverse: rotations51Reverse,
};
```

Then update the `getRotationState` function signature and the 5-1 branch:

```typescript
export function getRotationState(
  players: Player[],
  system: RotationSystem,
  rotation: RotationNumber,
  phase: Phase,
  useLibero: boolean = true,
  variant: VariantId = 'standard'
): { positions: PlayerPosition[]; zones: ZoneArea[] } {
  // ... existing code, but change the 5-1 branch:
  if (system === '5-1') {
    const rotationData = VARIANT_DATA[variant] || rotations51;
    const data = rotationData[rotation][phase];
    // ... rest unchanged
```

- [ ] **Step 6: Update useTeam.ts to include variant**

Add to `src/hooks/useTeam.ts`:

```typescript
// Add import:
import { VariantId } from '@/lib/types';

// Add state in useTeam:
const [variant, setVariant] = useState<VariantId>('standard');

// Add to return:
// variant, setVariant,
```

- [ ] **Step 7: Commit**

```bash
git add src/data/variants.ts src/data/rotations-5-1-spread.ts src/data/rotations-5-1-slide.ts src/data/rotations-5-1-reverse.ts src/lib/rotationEngine.ts src/hooks/useTeam.ts
git commit -m "feat: add 5-1 variant system with spread, slide-heavy, and reverse presets"
```

---

## Task 11: useRotation — Expose movedPlayers and nextPhasePositions

**Files:**
- Modify: `src/hooks/useRotation.ts`

- [ ] **Step 1: Add movedPlayers and nextPhasePositions computations**

Add these useMemo blocks after the existing `previousPositions` memo in `src/hooks/useRotation.ts`:

```typescript
// Add import for VariantId at top
import { RotationNumber, Phase, PlayerRole, Player, RotationSystem, PlayerPosition, ZoneArea, VariantId } from '@/lib/types';

// Update function signature to accept variant
export function useRotation(players: Player[], system: RotationSystem, useLibero: boolean = true, variant: VariantId = 'standard') {

// Update positions/zones memo to pass variant
const { positions, zones } = useMemo(
  () => getRotationState(players, system, currentRotation, currentPhase, useLibero, variant),
  [players, system, currentRotation, currentPhase, useLibero, variant]
);

// Update previousPositions memo to pass variant
const previousPositions = useMemo((): PlayerPosition[] | null => {
  const currentPhaseIndex = PHASES.indexOf(currentPhase);
  if (currentPhaseIndex > 0) {
    const prevPhaseVal = PHASES[currentPhaseIndex - 1];
    return getRotationState(players, system, currentRotation, prevPhaseVal, useLibero, variant).positions;
  }
  if (currentRotation > 1) {
    const prevRot = (currentRotation - 1) as RotationNumber;
    return getRotationState(players, system, prevRot, 'transition', useLibero, variant).positions;
  }
  return null;
}, [players, system, currentRotation, currentPhase, useLibero, variant]);

// Add after previousPositions:

// Count of players who moved from previous phase
const movedPlayers = useMemo((): number => {
  if (!previousPositions) return 0;
  let count = 0;
  for (const pos of positions) {
    const prev = previousPositions.find(p => p.playerId === pos.playerId);
    if (!prev) continue;
    const dx = Math.abs(pos.position.x - prev.position.x);
    const dy = Math.abs(pos.position.y - prev.position.y);
    if (dx > 0.3 || dy > 0.3) count++;
  }
  return count;
}, [positions, previousPositions]);

// Next phase positions for movement preview in info card
const nextPhasePositions = useMemo((): PlayerPosition[] | null => {
  const currentPhaseIndex = PHASES.indexOf(currentPhase);
  if (currentPhaseIndex < PHASES.length - 1) {
    const nextPhaseVal = PHASES[currentPhaseIndex + 1];
    return getRotationState(players, system, currentRotation, nextPhaseVal, useLibero, variant).positions;
  }
  // Last phase — next is first phase of next rotation
  if (currentRotation < 6) {
    const nextRot = (currentRotation + 1) as RotationNumber;
    return getRotationState(players, system, nextRot, 'serve', useLibero, variant).positions;
  }
  return null;
}, [players, system, currentRotation, currentPhase, useLibero, variant]);
```

Add `movedPlayers` and `nextPhasePositions` to the return object.

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useRotation.ts
git commit -m "feat: expose movedPlayers count and nextPhasePositions from useRotation"
```

---

## Task 12: Onboarding Rewrite — 3-Step Spotlight Walkthrough

**Files:**
- Modify: `src/components/onboarding/Welcome.tsx`

- [ ] **Step 1: Rewrite Welcome.tsx**

Replace entire file:

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'This is a Volleyball Court',
    description: '6 players per side. Teams rotate clockwise each time they win serve back. There are 6 rotations total.',
    visual: (
      <div className="flex items-center justify-center py-4">
        <div className="relative w-40 h-48 rounded-lg border-2 border-white/30 bg-green-900/30">
          {/* Net */}
          <div className="absolute top-1/3 inset-x-0 h-0.5 bg-white/50" />
          <span className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-white/40">NET</span>
          {/* Players */}
          {[[25,20],[50,20],[75,20],[25,65],[50,65],[75,65]].map(([x,y], i) => (
            <div key={i} className="absolute w-5 h-5 rounded-full bg-indigo-500 border border-white/50"
              style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
            >
              <span className="flex items-center justify-center h-full text-[8px] font-bold text-white">{i+1}</span>
            </div>
          ))}
          {/* Rotation arrow */}
          <svg className="absolute -right-6 top-1/2 -translate-y-1/2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83" strokeLinecap="round"/>
            <path d="M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    ),
  },
  {
    title: '3 Phases per Rotation',
    description: 'Each rotation has Serve (starting positions), Receive (passing formation), and Transition (attacking/defending). Swipe or tap to move through them.',
    visual: (
      <div className="flex items-center justify-center gap-0 py-4">
        {[
          { label: 'Serve', active: true },
          { label: 'Receive', active: false },
          { label: 'Transition', active: false },
        ].map((p, i) => (
          <div key={p.label} className="flex items-center">
            {i > 0 && <div className="w-4 h-0.5 bg-white/20" />}
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              p.active ? 'bg-indigo-500 text-white' : 'bg-white/10 text-gray-400'
            }`}>
              {p.label}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: 'Tap to Learn',
    description: 'Tap any player to see their role, zone, and what they should do. Use the ? icons for help anytime. Swipe left/right to navigate.',
    visual: (
      <div className="flex items-center justify-center gap-4 py-4">
        {[
          { label: 'S', color: '#EAB308' },
          { label: 'OH', color: '#3B82F6' },
          { label: 'MB', color: '#EF4444' },
          { label: 'OPP', color: '#22C55E' },
          { label: 'L', color: '#F97316' },
        ].map(({ label, color }) => (
          <div
            key={label}
            className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
        ))}
      </div>
    ),
  },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
};

export default function Welcome({ onComplete }: WelcomeProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const isLast = current === steps.length - 1;

  const goNext = () => {
    if (isLast) { onComplete(); return; }
    setDirection(1);
    setCurrent(s => s + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/95 backdrop-blur-sm">
      <div className="max-w-sm w-full mx-4 flex flex-col items-center">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${
              i === current ? 'w-8 bg-indigo-500' : i < current ? 'w-4 bg-indigo-500/50' : 'w-4 bg-gray-700'
            }`} />
          ))}
        </div>

        {/* Card */}
        <div className="w-full bg-gray-900 rounded-2xl border border-white/10 p-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-lg font-bold text-white mb-2">{steps[current].title}</h2>
              {steps[current].visual}
              <p className="text-sm text-gray-400 leading-relaxed mt-2">{steps[current].description}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between w-full mt-5">
          <button
            onClick={onComplete}
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors px-3 py-2 focus-ring rounded-lg"
          >
            Skip
          </button>
          <button
            onClick={goNext}
            className="focus-ring px-5 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition-colors"
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/onboarding/Welcome.tsx
git commit -m "feat: rewrite onboarding as 3-step walkthrough with court visuals"
```

---

## Task 13: SetupDrawer — Variant Selector, Token Toggle, Reset, Polish

**Files:**
- Modify: `src/components/setup/SetupDrawer.tsx`
- Modify: `src/components/setup/PlayerCard.tsx`

- [ ] **Step 1: Update SetupDrawer.tsx**

Replace entire file with updated version adding variant selector, token display mode, reduce motion, reset button, scroll indicator, and consistent styling:

```tsx
'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Player, RotationSystem, VariantId, TokenDisplayMode } from '@/lib/types';
import { PlayerCard } from './PlayerCard';
import { getVariantsForSystem } from '@/data/variants';
import { DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';

interface SetupDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  players: Player[];
  teamName: string;
  system: RotationSystem;
  useLibero: boolean;
  variant: VariantId;
  tokenDisplayMode: TokenDisplayMode;
  reduceMotion: boolean;
  learnMode: boolean;
  courtFlipped: boolean;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onTeamNameChange: (name: string) => void;
  onSystemChange: (system: RotationSystem) => void;
  onUseLiberoChange: (value: boolean) => void;
  onVariantChange: (variant: VariantId) => void;
  onTokenDisplayModeChange: (mode: TokenDisplayMode) => void;
  onReduceMotionToggle: () => void;
  onLearnModeToggle: () => void;
  onCourtFlipToggle: () => void;
  onResetPlayers: () => void;
  onReplayOnboarding: () => void;
}

const TOKEN_MODE_LABELS: Record<TokenDisplayMode, string> = {
  jersey: 'Jersey Numbers',
  role: 'Role Abbreviations',
  name: 'Player Names',
};

export function SetupDrawer({
  isOpen, onClose, players, teamName, system, useLibero,
  variant, tokenDisplayMode, reduceMotion, learnMode, courtFlipped,
  onUpdatePlayer, onTeamNameChange, onSystemChange, onUseLiberoChange,
  onVariantChange, onTokenDisplayModeChange, onReduceMotionToggle,
  onLearnModeToggle, onCourtFlipToggle, onResetPlayers, onReplayOnboarding,
}: SetupDrawerProps) {
  const variants = getVariantsForSystem(system);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl bg-gray-900 shadow-2xl"
            style={{ maxHeight: '90vh' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y" dragConstraints={{ top: 0 }} dragElastic={0.2}
            onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-10 rounded-full bg-gray-400" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <button onClick={onClose}
                className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 pb-8 scroll-fade-bottom">
              {/* Team name */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-400">Team Name</label>
                <input type="text" value={teamName} onChange={e => onTeamNameChange(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-indigo-500" />
              </div>

              {/* System toggle */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-400">Rotation System</label>
                <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                  {(['5-1', '6-2'] as RotationSystem[]).map(s => (
                    <button key={s} onClick={() => onSystemChange(s)}
                      className={`focus-ring flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                        system === s ? 'bg-indigo-500 text-white shadow' : 'text-gray-400 hover:text-white'
                      }`}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Variant selector (5-1 only, when more than 1 variant) */}
              {variants.length > 1 && (
                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium text-gray-400">Offensive Variant</label>
                  <select value={variant} onChange={e => onVariantChange(e.target.value as VariantId)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-indigo-500">
                    {variants.map(v => (
                      <option key={v.id} value={v.id} className="bg-gray-900">{v.name} — {v.description}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Use Libero toggle */}
              {system === '5-1' && (
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-white">Use Libero</label>
                    <p className="text-xs text-gray-400">Replaces back-row middle</p>
                  </div>
                  <button type="button" role="switch" aria-checked={useLibero}
                    onClick={() => onUseLiberoChange(!useLibero)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                      useLibero ? 'bg-indigo-500' : 'bg-gray-600'
                    }`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      useLibero ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </button>
                </div>
              )}

              {/* Divider */}
              <div className="h-px bg-white/10 my-4" />

              {/* Display Settings */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Display</h3>

              {/* Token display mode */}
              <div className="mb-4">
                <label className="mb-1 block text-xs font-medium text-gray-400">Player Labels</label>
                <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                  {(['jersey', 'role', 'name'] as TokenDisplayMode[]).map(mode => (
                    <button key={mode} onClick={() => onTokenDisplayModeChange(mode)}
                      className={`focus-ring flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                        tokenDisplayMode === mode ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'
                      }`}>{TOKEN_MODE_LABELS[mode]}</button>
                  ))}
                </div>
              </div>

              {/* Toggle switches */}
              {[
                { label: 'Learn Mode', desc: 'Show extra tips and descriptions', value: learnMode, toggle: onLearnModeToggle },
                { label: 'Reduce Motion', desc: 'Disable animations', value: reduceMotion, toggle: onReduceMotionToggle },
                { label: 'Flip Court', desc: 'View from opposite side', value: courtFlipped, toggle: onCourtFlipToggle },
              ].map(({ label, desc, value, toggle }) => (
                <div key={label} className="mb-3 flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-white">{label}</label>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </div>
                  <button type="button" role="switch" aria-checked={value} onClick={toggle}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                      value ? 'bg-indigo-500' : 'bg-gray-600'
                    }`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                      value ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`} />
                  </button>
                </div>
              ))}

              {/* Divider */}
              <div className="h-px bg-white/10 my-4" />

              {/* Players */}
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Players</h3>
              <div className="space-y-2 mb-4">
                {players.map(player => (
                  <PlayerCard key={player.id} player={player} onUpdate={updates => onUpdatePlayer(player.id, updates)} />
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={onResetPlayers}
                  className="focus-ring flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                  Reset to Defaults
                </button>
                <button onClick={onReplayOnboarding}
                  className="focus-ring flex-1 rounded-lg bg-white/5 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-colors">
                  Replay Tutorial
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Fix PlayerCard.tsx input styling consistency**

In `src/components/setup/PlayerCard.tsx`, replace all `rounded border` with `rounded-lg border` and `focus:border-blue-500` with `focus:border-indigo-500`.

- [ ] **Step 3: Commit**

```bash
git add src/components/setup/SetupDrawer.tsx src/components/setup/PlayerCard.tsx
git commit -m "feat: overhaul SetupDrawer — variant selector, display settings, reset, polish"
```

---

## Task 14: ShareButton — Loading Spinner and Error Toast

**Files:**
- Modify: `src/components/sharing/ShareButton.tsx`

- [ ] **Step 1: Add loading spinner and error feedback**

In `src/components/sharing/ShareButton.tsx`, update the button to show a spinner when loading and add a simple error state:

Replace the button element (lines 53-73) with:

```tsx
<button
  onClick={handleOpen}
  disabled={isLoading}
  className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all disabled:opacity-50"
  aria-label="Share"
>
  {isLoading ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )}
</button>
```

Also add an `[error, setError]` state and show a brief error message if share fails:

In the catch block of handleOpen: `setError('Failed to generate link');` and auto-clear after 3s.

- [ ] **Step 2: Commit**

```bash
git add src/components/sharing/ShareButton.tsx
git commit -m "fix: add loading spinner and error feedback to ShareButton"
```

---

## Task 15: Main Page Overhaul — The Big Integration

This is the largest task. It rewires page.tsx to use all the new components, implements the new layout (full-bleed court, collapsible sidebar, mobile bottom bar), and integrates preferences.

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Rewrite page.tsx**

Replace the entire file. Key changes:
- Import new components (PhaseStepper, RotationCarousel, GhostTrail, HelpPopover, Glossary, PlayerInfoSheet, usePreferences)
- Remove imports for deleted/replaced components (PhaseToggle, RotationSelector, ProgressTimeline, PositionInfo)
- Full-bleed court layout with no max-width cap
- Collapsible desktop sidebar
- New mobile bottom bar
- Ghost trails on phase transitions
- Help popovers
- State pill
- Pass displayMode to PlayerToken
- Court flip support
- Phase description auto-display

```tsx
'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useTeam } from '@/hooks/useTeam';
import { useRotation } from '@/hooks/useRotation';
import { useAnimation } from '@/hooks/useAnimation';
import { useUrlState } from '@/hooks/useUrlState';
import { usePreferences } from '@/hooks/usePreferences';
import Court from '@/components/court/Court';
import PlayerToken from '@/components/court/PlayerToken';
import MovementArrow from '@/components/court/MovementArrow';
import ZoneOverlay from '@/components/court/ZoneOverlay';
import GhostTrail from '@/components/court/GhostTrail';
import RotationCarousel from '@/components/controls/RotationCarousel';
import PhaseStepper from '@/components/controls/PhaseStepper';
import PlaybackControls from '@/components/controls/PlaybackControls';
import PositionFilter from '@/components/controls/PositionFilter';
import { SetupDrawer } from '@/components/setup/SetupDrawer';
import { CompareView } from '@/components/compare/CompareView';
import { ShareButton } from '@/components/sharing/ShareButton';
import Welcome from '@/components/onboarding/Welcome';
import { PlayerInfoSheet } from '@/components/info/PlayerInfoSheet';
import { HelpPopover } from '@/components/help/HelpPopover';
import { Glossary } from '@/components/help/Glossary';
import { ROLE_COLORS, DEFAULT_PLAYERS, DEFAULT_PLAYERS_62 } from '@/lib/constants';
import { Team, RotationNumber, Phase } from '@/lib/types';

// ─── Swipe hook ────────────────────────────────────────────────
function useSwipe(
  ref: React.RefObject<HTMLElement | null>,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  minDistance = 50
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let startX = 0, startY = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) < minDistance || Math.abs(dy) > Math.abs(dx)) return;
      if (dx < 0) onSwipeLeft(); else onSwipeRight();
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => { el.removeEventListener('touchstart', onTouchStart); el.removeEventListener('touchend', onTouchEnd); };
  }, [ref, onSwipeLeft, onSwipeRight, minDistance]);
}

// ─── Phase descriptions ─────────────────────────────────────────
const PHASE_DESCRIPTIONS: Record<Phase, string> = {
  serve: 'Serve: Players in starting positions for the serve',
  receive: 'Receive: Formation for passing the opponent\'s serve',
  transition: 'Transition: Players shift to attack/defense positions',
};

// ─── Main page ─────────────────────────────────────────────────
export default function Home() {
  const [setupOpen, setSetupOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [phaseDescKey, setPhaseDescKey] = useState(0); // triggers re-animation
  const courtRef = useRef<HTMLDivElement>(null);

  const prefs = usePreferences();

  useEffect(() => {
    if (!prefs.onboardingSeen) setShowWelcome(true);
  }, [prefs.onboardingSeen]);

  const {
    system, players, teamName, setTeamName, updatePlayer, switchSystem,
    getTeam, setPlayers, useLibero, setUseLibero, variant, setVariant,
  } = useTeam();

  const {
    currentRotation, currentPhase, focusedRole, focusedPlayerId,
    positions, zones, previousPositions, movedPlayers, nextPhasePositions,
    setCurrentRotation, setCurrentPhase, stepForward, stepBackward,
    toggleFocusedRole, toggleFocusedPlayer,
  } = useRotation(players, system, useLibero, variant);

  const { isPlaying, speed, setSpeed, togglePlay } = useAnimation(stepForward);

  // Track phase changes for description animation
  const prevPhaseRef = useRef(currentPhase);
  useEffect(() => {
    if (prevPhaseRef.current !== currentPhase) {
      prevPhaseRef.current = currentPhase;
      setPhaseDescKey(k => k + 1);
    }
  }, [currentPhase]);

  const handleLoadTeam = useCallback((team: Team) => {
    switchSystem(team.system);
    setPlayers(team.players);
    setTeamName(team.name);
    setUseLibero(team.useLibero ?? true);
  }, [switchSystem, setPlayers, setTeamName, setUseLibero]);

  const { shareUrl } = useUrlState(getTeam, handleLoadTeam);

  useSwipe(courtRef, stepForward, stepBackward);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      switch (e.key) {
        case 'ArrowLeft': e.preventDefault(); stepBackward(); break;
        case 'ArrowRight': e.preventDefault(); stepForward(); break;
        case ' ': e.preventDefault(); togglePlay(); break;
        case 'Escape':
          if (setupOpen) setSetupOpen(false);
          else if (glossaryOpen) setGlossaryOpen(false);
          else if (focusedRole) toggleFocusedRole(focusedRole);
          break;
        case '1': case '2': case '3': case '4': case '5': case '6':
          setCurrentRotation(parseInt(e.key) as RotationNumber); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stepForward, stepBackward, togglePlay, focusedRole, toggleFocusedRole, setCurrentRotation, setupOpen, glossaryOpen]);

  const handleResetPlayers = useCallback(() => {
    setPlayers([...(system === '6-2' ? DEFAULT_PLAYERS_62 : DEFAULT_PLAYERS)]);
  }, [system, setPlayers]);

  const handleReplayOnboarding = useCallback(() => {
    setSetupOpen(false);
    setShowWelcome(true);
  }, []);

  // Get focused player's position for info sheet
  const focusedPosition = focusedPlayerId ? positions.find(p => p.playerId === focusedPlayerId) ?? null : null;
  const focusedNextPosition = focusedPlayerId && nextPhasePositions
    ? nextPhasePositions.find(p => p.playerId === focusedPlayerId) ?? null : null;
  const focusedPlayer = focusedPlayerId ? players.find(p => p.id === focusedPlayerId) ?? null : null;

  // Ghost trails: show when players moved from previous positions
  const ghostTrails = useMemo(() => {
    if (!previousPositions || prefs.reduceMotion) return [];
    return positions
      .map(pos => {
        const prev = previousPositions.find(p => p.playerId === pos.playerId);
        if (!prev) return null;
        const dx = Math.abs(pos.position.x - prev.position.x);
        const dy = Math.abs(pos.position.y - prev.position.y);
        if (dx < 0.3 && dy < 0.3) return null;
        return { from: prev.position, to: pos.position, role: pos.role, id: pos.playerId };
      })
      .filter(Boolean) as { from: any; to: any; role: any; id: string }[];
  }, [positions, previousPositions, prefs.reduceMotion]);

  // Court content (shared between layouts)
  const courtContent = (
    <>
      {/* Zone overlays */}
      {zones.map(zone => {
        const isZoneFocused = focusedPlayerId
          ? zone.playerId === focusedPlayerId
          : focusedRole !== null && zone.role === focusedRole;
        const isDimmed = focusedPlayerId
          ? zone.playerId !== focusedPlayerId
          : focusedRole !== null && zone.role !== focusedRole;
        return (
          <ZoneOverlay key={`zone-${zone.playerId}`}
            x={zone.x} y={zone.y} width={zone.width} height={zone.height}
            color={ROLE_COLORS[zone.role]} label={zone.label}
            isDimmed={isDimmed} isFocusedZone={isZoneFocused} />
        );
      })}

      {/* Ghost trails */}
      {ghostTrails.map(trail => (
        <GhostTrail key={`ghost-${trail.id}-${phaseDescKey}`}
          from={trail.from} to={trail.to} role={trail.role}
          reduceMotion={prefs.reduceMotion} />
      ))}

      {/* Movement arrows */}
      {previousPositions && positions.map(pos => {
        const prevPos = previousPositions.find(p => p.playerId === pos.playerId);
        if (!prevPos) return null;
        const dx = Math.abs(pos.position.x - prevPos.position.x);
        const dy = Math.abs(pos.position.y - prevPos.position.y);
        if (dx < 0.3 && dy < 0.3) return null;
        const isDimmed = focusedPlayerId
          ? pos.playerId !== focusedPlayerId
          : focusedRole !== null && pos.role !== focusedRole;
        return (
          <MovementArrow key={`arrow-${pos.playerId}`}
            from={prevPos.position} to={pos.position}
            color={ROLE_COLORS[pos.role]} isDimmed={isDimmed} />
        );
      })}

      {/* Player tokens */}
      {positions.map(pos => {
        const player = players.find(p => p.id === pos.playerId);
        if (!player) return null;
        const isFocused = focusedPlayerId
          ? pos.playerId === focusedPlayerId
          : focusedRole === pos.role;
        const isDimmed = focusedPlayerId
          ? pos.playerId !== focusedPlayerId
          : focusedRole !== null && pos.role !== focusedRole;
        return (
          <PlayerToken key={pos.playerId}
            playerId={pos.playerId} name={player.name} number={player.number}
            role={pos.role} position={pos.position}
            isFocused={isFocused} isDimmed={isDimmed}
            displayMode={prefs.tokenDisplayMode}
            onClick={() => toggleFocusedPlayer(pos.playerId, pos.role)} />
        );
      })}
    </>
  );

  return (
    <main className="h-dvh flex flex-col overflow-hidden bg-gray-950">
      {/* ── Header — minimal floating pill ── */}
      <header className="glass border-b border-white/5 px-3 py-1.5 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="text-[10px] font-black text-white">V</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            VBall<span className="text-indigo-300 hidden sm:inline"> Rotations</span>
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Token mode cycle button */}
          <button onClick={prefs.cycleTokenDisplayMode}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label={`Display: ${prefs.tokenDisplayMode}`} title={`Showing: ${prefs.tokenDisplayMode}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
            </svg>
          </button>
          <button onClick={() => setGlossaryOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Glossary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </button>
          <ShareButton onShare={shareUrl} teamName={teamName} system={system} />
          <button onClick={() => setCompareOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Compare">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/></svg>
          </button>
          <button onClick={() => setSetupOpen(true)}
            className="focus-ring p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 btn-press transition-all"
            aria-label="Settings">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* ── Court Area ── */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center" ref={courtRef}>
          {/* State pill — always visible */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="glass rounded-full px-4 py-1.5 border border-white/10 shadow-lg shadow-black/20 flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-300">R{currentRotation}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-xs font-medium text-white/90 capitalize">{currentPhase}</span>
              <span className="w-px h-3 bg-white/20" />
              <span className="text-[10px] text-gray-400">{system}</span>
              {variant !== 'standard' && (
                <>
                  <span className="w-px h-3 bg-white/20" />
                  <span className="text-[10px] text-indigo-400 capitalize">{variant}</span>
                </>
              )}
            </div>
          </div>

          {/* Phase description (auto-fading) */}
          {prefs.learnMode ? (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <div className="glass rounded-lg px-3 py-1 border border-white/10 text-xs text-gray-300">
                {PHASE_DESCRIPTIONS[currentPhase]}
              </div>
            </div>
          ) : (
            <div key={phaseDescKey} className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none phase-description">
              <div className="glass rounded-lg px-3 py-1 border border-white/10 text-xs text-gray-300">
                {PHASE_DESCRIPTIONS[currentPhase]}
              </div>
            </div>
          )}

          {/* Court SVG — fills the space */}
          <div className="w-full h-full flex items-center justify-center px-1 md:p-4"
            style={prefs.courtFlipped ? { transform: 'scaleY(-1)' } : undefined}>
            <div className="w-full" style={{ maxWidth: sidebarExpanded ? '700px' : '900px', transition: 'max-width 0.3s ease' }}>
              <Court>{courtContent}</Court>
            </div>
          </div>

          {/* ── Mobile floating controls ── */}
          <div className="md:hidden absolute bottom-0 inset-x-0 z-20 fade-up pt-16 pb-safe pointer-events-none">
            <div className="px-4 space-y-2.5 pointer-events-auto">
              {/* Rotation selector */}
              <div className="flex items-center justify-center gap-2">
                <button onClick={stepBackward}
                  className="focus-ring w-11 h-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 btn-press flex items-center justify-center"
                  aria-label="Previous">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <RotationCarousel current={currentRotation} onChange={setCurrentRotation} system={system} compact />

                <button onClick={stepForward}
                  className="focus-ring w-11 h-11 rounded-full text-white/70 hover:text-white hover:bg-white/10 btn-press flex items-center justify-center"
                  aria-label="Next">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>

              {/* Phase stepper + Play */}
              <div className="flex items-center justify-center gap-3">
                <PhaseStepper current={currentPhase} onChange={setCurrentPhase} movedCount={movedPlayers} compact />
                <button onClick={togglePlay}
                  className="focus-ring w-11 h-11 rounded-full bg-indigo-500 text-white flex items-center justify-center btn-press shadow-lg shadow-indigo-500/40 hover:bg-indigo-400 transition-all"
                  aria-label={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><rect x="5" y="4" width="4" height="14" rx="1" fill="currentColor"/><rect x="13" y="4" width="4" height="14" rx="1" fill="currentColor"/></svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 22 22" fill="none"><path d="M7 4L17 11L7 18V4Z" fill="currentColor"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Player Info — mobile bottom sheet */}
          {focusedRole && (
            <div className="md:hidden absolute bottom-40 left-2 right-2 z-20">
              <PlayerInfoSheet
                player={focusedPlayer} role={focusedRole}
                rotation={currentRotation} phase={currentPhase} system={system}
                position={focusedPosition} nextPhasePosition={focusedNextPosition}
                onClose={() => toggleFocusedRole(focusedRole)} />
            </div>
          )}
        </div>

        {/* ── Side Panel (desktop) ── */}
        <div className={`hidden md:flex md:flex-col md:shrink-0 border-l border-white/5 glass overflow-y-auto transition-all duration-300 ${
          sidebarExpanded ? 'md:w-[300px]' : 'md:w-[300px]'
        }`}>
          <div className="p-4 space-y-4">
            {/* Position filter */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Position</span>
                <HelpPopover id="help-positions" title="What are positions?"
                  content="Each player has a role: Setter runs the offense, Outside Hitters attack from the left, Middle Blockers are quick attackers and primary blockers, Opposite attacks from the right, and the Libero is a defensive specialist."
                  dismissed={prefs.dismissedHelp.includes('help-positions')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <PositionFilter focusedRole={focusedRole} onToggle={toggleFocusedRole} system={system} />
            </div>

            {/* Rotation selector */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Rotation</span>
                <HelpPopover id="help-rotations" title="What are rotations?"
                  content="There are 6 rotations in volleyball. Teams rotate clockwise each time they win serve back. Each rotation determines the serving order and which players are in the front vs back row."
                  dismissed={prefs.dismissedHelp.includes('help-rotations')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <RotationCarousel current={currentRotation} onChange={setCurrentRotation} system={system} />
            </div>

            {/* Phase stepper */}
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-xs uppercase tracking-wider text-gray-500 font-medium">Phase</span>
                <HelpPopover id="help-phases" title="What are phases?"
                  content="Each rotation has 3 phases. Serve: where players stand for the serve. Receive: formation for passing. Transition: where players move to attack or defend after the ball is in play."
                  dismissed={prefs.dismissedHelp.includes('help-phases')}
                  onDismiss={prefs.dismissHelp} />
              </div>
              <PhaseStepper current={currentPhase} onChange={setCurrentPhase} movedCount={movedPlayers} />
            </div>

            {/* Playback */}
            <PlaybackControls isPlaying={isPlaying} speed={speed}
              onTogglePlay={togglePlay} onStepForward={stepForward} onStepBackward={stepBackward}
              onSpeedChange={setSpeed} />

            {/* Position info (desktop) */}
            {focusedRole && (
              <PlayerInfoSheet
                player={focusedPlayer} role={focusedRole}
                rotation={currentRotation} phase={currentPhase} system={system}
                position={focusedPosition} nextPhasePosition={focusedNextPosition}
                onClose={() => toggleFocusedRole(focusedRole)} />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CompareView isOpen={compareOpen} onClose={() => setCompareOpen(false)} players={players} system={system} useLibero={useLibero} />
      <SetupDrawer isOpen={setupOpen} onClose={() => setSetupOpen(false)}
        players={players} teamName={teamName} system={system} useLibero={useLibero}
        variant={variant} tokenDisplayMode={prefs.tokenDisplayMode}
        reduceMotion={prefs.reduceMotion} learnMode={prefs.learnMode} courtFlipped={prefs.courtFlipped}
        onUpdatePlayer={updatePlayer} onTeamNameChange={setTeamName}
        onSystemChange={switchSystem} onUseLiberoChange={setUseLibero}
        onVariantChange={setVariant} onTokenDisplayModeChange={prefs.setTokenDisplayMode}
        onReduceMotionToggle={prefs.toggleReduceMotion} onLearnModeToggle={prefs.toggleLearnMode}
        onCourtFlipToggle={prefs.toggleCourtFlipped}
        onResetPlayers={handleResetPlayers} onReplayOnboarding={handleReplayOnboarding} />
      <Glossary isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      {showWelcome && (
        <Welcome onComplete={() => { setShowWelcome(false); prefs.markOnboardingSeen(); }} />
      )}
    </main>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `cd C:/Users/Moe/source/repos/vball-rotations && npx next build 2>&1 | tail -30`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: complete page.tsx overhaul — new layout, ghost trails, help system, preferences"
```

---

## Task 16: Fix Remaining Build Issues and Integration

**Files:** Various — depends on build errors.

- [ ] **Step 1: Run build and fix any TypeScript errors**

Run: `npx next build 2>&1 | head -60`

Common expected fixes:
- `useTeam` doesn't expose `variant`/`setVariant` yet — add to hook return
- `useRotation` doesn't expose `movedPlayers`/`nextPhasePositions` yet — add to return
- Import paths for deleted `ProgressTimeline` — already removed from page.tsx
- `PlaybackControls` speed selector — keep it for now since removing is a separate concern

Fix each error, rebuild, iterate.

- [ ] **Step 2: Commit all fixes**

```bash
git add -u
git commit -m "fix: resolve build errors from integration"
```

---

## Task 17: Visual QA and Polish Pass

**Files:** Various

- [ ] **Step 1: Run dev server and test in browser**

Run: `npx next dev`

Check each of these in the browser:
1. Court fills available space on mobile (no wasted margins)
2. Court scales up on large desktop (no 700px cap)
3. State pill is always visible with correct info
4. Phase stepper shows connected steps with moved count badge
5. Rotation carousel shows setter row text (not dots)
6. Ghost trails appear on phase change and fade
7. Player tokens show role abbreviations by default
8. Libero has rounded-square shape
9. Back-row players have dashed borders
10. Help `?` popovers open/close correctly
11. Glossary modal opens from header
12. Player info sheet shows zone number, movement preview
13. Setup drawer has variant selector, token toggle, all settings
14. Onboarding is 3 steps
15. No horizontal scrollbar on desktop
16. Mobile controls don't overlap court excessively

- [ ] **Step 2: Fix any visual issues found**

Address each issue with targeted edits.

- [ ] **Step 3: Commit polish**

```bash
git add -u
git commit -m "fix: visual QA polish pass"
```

---

## Task 18: Final Accessibility Pass

**Files:** Various

- [ ] **Step 1: Add focus-ring class to all remaining interactive elements**

Grep for `<button` elements missing `focus-ring` class and add it.

- [ ] **Step 2: Verify WCAG contrast**

Check that `text-indigo-300` is used instead of `text-indigo-400` on dark backgrounds. Update any instances that fail contrast.

- [ ] **Step 3: Verify all buttons have aria-labels**

Grep for buttons without `aria-label`.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "fix: accessibility — focus rings, contrast, aria labels"
```

---

## Summary

| Task | Description | Dependencies |
|------|-------------|-------------|
| 1 | Types, Preferences, Foundation | None |
| 2 | Global CSS Overhaul | None |
| 3 | PlayerToken Redesign | Task 1 (types) |
| 4 | PhaseStepper | Task 1 (types) |
| 5 | RotationCarousel | Task 1 (types) |
| 6 | GhostTrail | None |
| 7 | HelpPopover | None |
| 8 | Glossary | None |
| 9 | PlayerInfoSheet | Task 1 (types) |
| 10 | Variant System | Task 1 (types) |
| 11 | useRotation updates | Task 1, 10 |
| 12 | Onboarding Rewrite | None |
| 13 | SetupDrawer Overhaul | Task 1, 10 |
| 14 | ShareButton Polish | None |
| 15 | Main Page Integration | Tasks 1-14 |
| 16 | Build Fix | Task 15 |
| 17 | Visual QA | Task 16 |
| 18 | Accessibility | Task 17 |

**Parallel tracks:**
- Track A (Tasks 1-3): Foundation + tokens
- Track B (Tasks 4-8): New components (all independent)
- Track C (Tasks 9-11): Info + data layer
- Track D (Tasks 12-14): Modals + polish
- Integration (Tasks 15-18): Sequential
