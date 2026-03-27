# UX/UI Overhaul: "Clean Instrument" Redesign

**Date:** 2026-03-27
**Status:** Approved
**Approach:** Progressive disclosure — court is the hero, controls get out of the way, help is layered
**Audience:** Coaches, players, and newcomers/parents (all three)
**Theme:** Keep dark theme, improve everything else

---

## 1. Court Layout — True Maximum Space

### Problem
The court doesn't fill available space as the viewport changes. Wasted space around it. Court max-width capped at 700px even on large desktops. No tablet-specific layout.

### Design

**Court becomes the dominant visual element:**
- On mobile, court fills edge-to-edge with no padding. SVG scales to fit the largest dimension while maintaining aspect ratio.
- On desktop, court fills the left side completely. Sidebar collapses to an icon rail by default (just icons for rotation, phase, settings, help). Hovering or clicking the rail expands it to ~280px panel. Court gets ~95% of screen when sidebar is collapsed.
- Remove the hardcoded `max-w-[700px]` constraint. Court should scale up on large desktops.

**Dynamic SVG viewBox:**
- SVG viewBox adapts to container size. Player tokens and labels scale proportionally.

**No chrome stealing space:**
- Header shrinks to a minimal floating pill (app name + 2-3 icon buttons) in the top-left corner.
- On mobile, header auto-hides on interaction and reappears on tap.

**Breakpoints:**
- Mobile portrait (<768px): Full-bleed court, floating controls overlay
- Mobile landscape (<768px landscape): Court fills width, controls collapse to a single-row bottom bar
- Tablet (768-1024px): Court with collapsible icon rail, rail defaults to collapsed
- Desktop (>1024px): Court with expandable sidebar rail

---

## 2. Phase Transitions — "What Changed?" Clarity

### Problem
Moving between phases requires going back and forth to understand what moved. Disorienting.

### Design

**Movement trails on transition:**
- When advancing to the next phase, players who moved get a brief ghost trail — faded copy of token at previous position connected by dotted path to new position. Lingers ~2 seconds, then fades. Respects "reduce motion" preference.

**"Changes" badge:**
- Small pill near the phase control showing "3 moved" (count of players who changed position). Tapping it highlights only the moved players.

**Hold-to-compare:**
- Long-press/hold anywhere on the court to temporarily show the previous phase's positions as ghost tokens alongside current ones. Release to return to current.

**Phase stepper replaces toggle buttons:**
- Instead of 3 separate buttons, use a horizontal stepper with connecting lines: `[Serve] --- [Receive] --- [Transition]`. Active phase highlighted. Visual connection makes the sequential nature clear.
- All three steps should be equal width to prevent ragged appearance (current issue: "Serve" vs "Transition" have different widths).

**Auto-scroll description:**
- When phase changes, a one-line description briefly appears at top: "Transition: Players shift to offensive positions" — fades after 2 seconds. Dismissable permanently via settings.

---

## 3. Rotation Navigation — Kill the Dots, Add Clarity

### Problem
The 18-dot progress timeline is confusing. Rotation selector with setter dots is not intuitive.

### Design

**Remove the 18-dot timeline entirely.**
- Replace with a simple linear progress indicator: thin bar showing "Rotation 3 of 6, Phase 2 of 3."

**Rotation selector redesign — carousel:**
- Horizontal strip showing current rotation large and centered, previous/next visible but smaller on either side.
- Swipe or tap arrows to change.
- Each rotation card shows:
  - Rotation number (large)
  - Setter row as text label ("Setter: Back Row" / "Setter: Front Row") — not an ambiguous dot
  - Mini formation thumbnail (tiny 6 dots in approximate court positions)

**Keyboard shortcut hints:**
- On desktop, rotation cards show subtle key hints (1-6) in corner on hover.

**Persistent state pill:**
- Always visible at top of court: `R3 · Receive · 5-1` — always tells user exactly where they are.

---

## 4. Help System — Layered Progressive Disclosure

### Problem
No help dialogs. Newcomers lost. Power users don't want help in their face.

### Design

**Three layers of help:**

**Layer 1: First-time onboarding (revised)**
- Rewrite as 3-step focused walkthrough that highlights actual UI elements with a spotlight effect:
  - Step 1: "This is a volleyball court. 6 players rotate clockwise after winning serve."
  - Step 2: "Each rotation has 3 phases — where players stand when serving, receiving, and transitioning to attack."
  - Step 3: "Tap any player to learn their role. Swipe to advance."
- Short, skippable, re-accessible from settings.

**Layer 2: Contextual `?` icons**
- Small help icons next to each major concept:
  - Next to phase stepper: "What are phases?" — 2-3 sentence explanation
  - Next to rotation selector: "What are rotations?" — explains 6-position cycle, when teams rotate
  - Next to system label: "What's a 5-1?" — system differences
  - Next to position filter roles: "What does an Outside Hitter do?" — role description
- Each `?` opens a small popover (not a full modal). Dismissable by clicking anywhere.
- "Got it, don't show again" option that persists in localStorage.

**Layer 3: Glossary page**
- Accessible from header menu.
- Single scrollable page defining all volleyball terms: rotation, phase, setter, libero, overlap, front row, back row, etc.
- Search/filter at top.

**"Learn mode" toggle in settings:**
- When ON: auto-scroll descriptions stay visible permanently, position info auto-shows for setter on each rotation change.
- OFF by default.

---

## 5. Player Info & Position Responsibilities — Context-Aware

### Problem
Position info doesn't align with actual responsibilities after some rotations. Info is stale/generic.

### Design

**Rotation+phase-aware info:**
- Tapping a player shows what that specific role does in this specific rotation and phase.
- Example: Setter in R1 Serve → "Setter starts in zone 1 (back right). Serves or prepares to penetrate to the net."
- Complete the position-info data for all rotations/phases. Make it the primary display.

**Info card redesign:**
- Mobile: slides up as bottom sheet (30% height), court still visible above. Swipe down to dismiss.
- Desktop: appears in sidebar panel, not overlaid on court.
- Fixes current issue where PositionInfo overlaps court content on mobile (positioned absolute top-12).
- Content structure:
  - Player name + jersey number (top)
  - Role with color badge
  - Current zone (numbered 1-6, volleyball convention)
  - What they're doing — 1-2 sentence phase-specific responsibility
  - Key tip — actionable coaching note
  - Movement preview — "Next phase: moves to zone 3" with arrow indicator

**Multi-player comparison:**
- Tap one player, then tap another — both info cards show side by side.

---

## 6. Jersey Toggle & Player Token Improvements

### Problem
No way to hide jersey numbers when teams don't have jerseys. Tokens don't communicate enough.

### Design

**Token display modes** (cycle via button near court or in settings):
1. **Jersey numbers** — current behavior
2. **Role abbreviations** — S, OH, MB, OPP, L (default — better for learning)
3. **Player names** — first name or initials

Active mode persists in localStorage.

**Token visual improvements:**
- Slightly larger tokens for readability
- Role color fills the entire circle with white text (currently just stroke) — higher contrast
- Subtle drop shadow for depth
- Front row: solid circle. Back row: dashed border. Teaches front/back row distinction visually.
- Libero gets a distinct shape: rounded square instead of circle

**Fix player name truncation:**
- Current code has contradictory truncation (comment says 6, code does 8/10). Standardize to intelligent truncation: show full first name up to 8 chars, ellipsis if longer. No mid-word cuts.

---

## 7. Controls & Button Redesign

### Problem
Buttons don't communicate hierarchy. No consistent style. Touch targets too small on mobile.

### Design

**Action hierarchy:**
1. Primary (always visible): Phase advance/rewind — large, prominent
2. Secondary (visible, subdued): Rotation selector, play/pause
3. Tertiary (tucked away): Share, Compare, Setup, Help — floating action menu

**Mobile bottom bar redesign:**
- Replace floating panel with clean 3-section bar:
  - Left: `< Back` (previous phase/rotation)
  - Center: Current state label (`R3 · Receive`) — tapping opens quick-switcher
  - Right: `Next >` (next phase/rotation)
- Swipe up on bar reveals full control panel. Swipe down to hide.

**Desktop sidebar rail:**
- Collapsed: vertical icon strip (rotation, phase, play, filter, help, settings)
- Tooltip on hover for each icon
- Click icon expands that section inline
- Click again or click court to collapse

**Playback simplified:**
- Play/pause is primary. Speed selector moves to settings (power-user feature).

**Touch targets:**
- All interactive elements minimum 44x44px on mobile. Current rotation buttons are 36px — must be fixed.

**Button consistency:**
- Standardize all buttons to one border-radius system: pills for primary actions, rounded-lg for secondary
- Standardize focus color to indigo (currently mixed blue/indigo)
- All buttons get focus-visible states for keyboard accessibility
- Consistent transition properties across all buttons

---

## 8. 5-1 Variants & System Customization

### Problem
Only one standard 5-1 formation. Different teams run different schemes.

### Design

**Predefined 5-1 variants:**
1. **Standard 5-1** — current default
2. **Spread 5-1** — outsides push wider, middle runs quicker tempo
3. **Slide-heavy 5-1** — middle runs slide attacks behind setter
4. **Reverse 5-1** — setter penetrates to zone 4 instead of 2/3

**Variant selector:**
- In Setup drawer, below system toggle: "Offensive variant" dropdown.
- Each option has one-line description.
- Selecting swaps position data for all 6 rotations x 3 phases.

**Variant comparison:**
- In Compare view, add ability to compare two different variants side by side.

**Data architecture:**
- New files: `rotations-5-1-spread.ts`, `rotations-5-1-slide.ts`, etc.
- Same data shape as existing `rotations-5-1.ts`.
- Rotation engine gets a `variant` parameter.

---

## 9. Quality-of-Life Improvements

### Design

- **Pinch-to-zoom on court.** Mobile users can zoom into crowded positions. Double-tap to reset.
- **Orientation lock hint.** On mobile portrait, one-time hint: "Rotate for a wider view."
- **Undo/redo for setup changes.** Simple undo for name/number/role edits.
- **Quick-reset button.** "Reset to defaults" in Setup drawer.
- **Reduce motion toggle.** Respects `prefers-reduced-motion` by default. Disables trails, ghosts, fades.
- **Shareable deep links.** URL encoding extended to include rotation, phase, variant, display mode.
- **Swipe gesture hint.** Small hand-swiping animation on first use. Gone after 3 successful swipes.
- **Court orientation option.** Flip-court toggle (bench view vs bird's-eye). Default: bench view (current).

---

## 10. Bug Fixes & Visual Polish

All issues discovered during the UI/UX audit, folded into this redesign.

### Header & Navigation
- **Fix horizontal overflow** in header on desktop. Inflexible flex layout causes unnecessary scrollbar. Redesign header as floating pill to eliminate this entirely.
- **Glass panel color inconsistency.** `.glass` uses near-opaque dark while interactive elements use much lighter `bg-white/10`. Unify the glass system.

### Accessibility
- **Add focus-visible states** to all interactive elements (PhaseToggle, RotationSelector, Setup buttons). Currently missing.
- **Replace color-only indicators.** Setter position dot in rotation selector uses only color. Add text label per Section 3 design.
- **Fix color contrast.** `text-indigo-400` on dark backgrounds may fail WCAG AA. Audit and increase to indigo-300 where needed.
- **Dimmed player opacity** too aggressive at 0.25. Increase to 0.4 so dimmed players remain recognizable.
- **SVG text accessibility.** Add aria-labels to player token groups for screen reader support.

### Typography & Spacing
- **Section labels at 10px** (`text-[10px]`) are too small. Minimum 12px for any text.
- **Inconsistent input styling.** PlayerCard uses `rounded border`, SetupDrawer uses `rounded-lg border`. Standardize to `rounded-lg`.
- **Player name truncation contradictions.** Comment says 6 chars, code does 8/10. Standardize per Section 6.
- **Phase button widths ragged.** "Serve" vs "Transition" are different widths. Use equal-width stepper per Section 2.

### Touch & Interaction
- **Rotation buttons 36px.** Below 44px minimum. Fix per Section 7.
- **Progress timeline dots 6-8px** with 14px touch area. Removing timeline per Section 3 eliminates this.
- **Setup drawer no scroll indicator.** Add subtle fade gradient at bottom when content overflows.
- **PlayerCard inputs wrap poorly.** `items-end` with `flex-wrap` causes misalignment. Fix alignment strategy.

### Animation & Performance
- **Mismatched transition durations.** PlayerToken has 0.4s transform and 0.3s opacity. Synchronize to single duration.
- **SVG inline transitions** on ZoneOverlay and MovementArrow may cause jank. Use CSS classes instead of inline styles for better GPU compositing.

### Visual Consistency
- **Button border-radius mixed.** Some `rounded-lg`, some `rounded-full`. Standardize per Section 7.
- **Icon sizes inconsistent.** Header 16px, Playback 20px. Define icon size scale (16/20/24) and apply consistently by context.
- **Setup drawer drag handle** uses gray-600 on gray-900 — low contrast. Lighten to gray-400.
- **Welcome modal overlay** nearly black on dark background. Increase backdrop blur, reduce opacity for more depth.

### Loading & Error States
- **Share button** shows no spinner during loading. Add loading indicator.
- **Share URL generation** silently fails (console.warn only). Show user-facing error toast.

### Responsive Gaps
- **No mobile landscape support.** Controls eat 60% of vertical space. Collapse to single-row bar per Section 1.
- **No tablet optimization.** 768px tablet gets same 300px sidebar as 1440px desktop. Add collapsible rail per Section 1.
- **Court container** may overflow on phones <375px. Remove fixed max-width, use fluid sizing.

### Edge Cases
- **Focused player "YOU" label** overflows above SVG on top-edge tokens. Clamp position to stay within viewBox.
- **Glow ring** on focused player barely visible (opacity 0.4, strokeWidth 2). Increase to opacity 0.6, strokeWidth 3.

---

## What's NOT Changing

- Dark theme (Tailwind gray-950, indigo accents)
- Tech stack (Next.js, React, Tailwind, Framer Motion)
- Data model shape (PlayerPosition, ZoneArea, etc.)
- URL sharing mechanism (extended, not replaced)
- 6-2 system support (maintained as-is, variants scoped out for now)
- Core rotation engine logic
- Keyboard navigation (maintained and improved)

---

## Success Criteria

1. Court fills maximum available space at every viewport from 320px to 2560px
2. A volleyball newcomer can understand what they're looking at within 30 seconds via onboarding
3. Phase transitions clearly show what moved without requiring back-and-forth navigation
4. All interactive elements meet 44px minimum touch target on mobile
5. WCAG AA contrast compliance on all text
6. All controls have visible focus states for keyboard navigation
7. Jersey numbers can be hidden; role abbreviations shown instead
8. At least 4 predefined 5-1 variants available
9. No horizontal scroll anywhere at any viewport
10. App feels polished and modern — consistent spacing, typography, button styles, and animations throughout
