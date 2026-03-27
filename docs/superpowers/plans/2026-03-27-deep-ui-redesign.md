# Deep UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix critical bugs and transform the UI from a prototype into a polished, production-quality volleyball app with zero wasted space, visual depth, and innovative interactions.

**Architecture:** Fix data bugs first, then rebuild the layout from scratch with a court-dominant design that eliminates dead space. Mobile: court fills viewport between thin header and floating controls overlay. Desktop: centered layout with court and integrated side panel. Add visual polish through gradients, shadows, glassmorphism, and micro-interactions.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion

---

## File Structure

```
Modified files:
  src/hooks/useTeam.ts              — Fix duplicate player IDs on system switch
  src/lib/constants.ts              — New unique IDs for 6-2 defaults
  src/app/page.tsx                  — Complete layout rebuild
  src/app/globals.css               — New utility classes, glassmorphism, gradients
  src/components/court/Court.tsx    — Court visual polish, proper sizing
  src/components/court/PlayerToken.tsx — Visual upgrade, fix undefined radius
  src/components/controls/PositionFilter.tsx — Redesigned as floating pills
  src/components/controls/RotationSelector.tsx — Integrated into state banner
  src/components/controls/PhaseToggle.tsx — Redesigned as step indicator
  src/components/controls/PlaybackControls.tsx — Floating FAB style
  src/components/info/PositionInfo.tsx — Redesigned as overlay card
```

---

### Task 1: Fix Critical Bugs — Duplicate IDs + Undefined Radius

**Files:**
- Modify: `src/lib/constants.ts`
- Modify: `src/hooks/useTeam.ts`

- [ ] **Step 1: Fix DEFAULT_PLAYERS_62 to use unique IDs**

In `src/lib/constants.ts`, the 6-2 default players use IDs `p1`-`p7` which overlap with 5-1 defaults. The `switchSystem` function copies players across systems and adds new ones from defaults, causing ID collisions.

Change `DEFAULT_PLAYERS_62` to use unique IDs that won't collide:

```typescript
export const DEFAULT_PLAYERS_62 = [
  { id: 's1', name: 'Setter 1', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 's2', name: 'Setter 2', number: 6, role: 'setter' as const, avatar: 'default' },
  { id: 'oh1', name: 'OH 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'oh2', name: 'OH 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'mb1', name: 'MB 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'mb2', name: 'MB 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'lib', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];
```

Also update `DEFAULT_PLAYERS` to use semantic IDs:

```typescript
export const DEFAULT_PLAYERS = [
  { id: 's1', name: 'Setter', number: 1, role: 'setter' as const, avatar: 'default' },
  { id: 'oh1', name: 'OH 1', number: 4, role: 'outside' as const, avatar: 'default' },
  { id: 'oh2', name: 'OH 2', number: 10, role: 'outside' as const, avatar: 'default' },
  { id: 'mb1', name: 'MB 1', number: 3, role: 'middle' as const, avatar: 'default' },
  { id: 'mb2', name: 'MB 2', number: 8, role: 'middle' as const, avatar: 'default' },
  { id: 'opp', name: 'Opposite', number: 2, role: 'opposite' as const, avatar: 'default' },
  { id: 'lib', name: 'Libero', number: 7, role: 'libero' as const, avatar: 'default' },
];
```

- [ ] **Step 2: Fix switchSystem to generate unique IDs for new players**

In `src/hooks/useTeam.ts`, rewrite `switchSystem` to be simpler and always produce unique IDs:

```typescript
const switchSystem = useCallback((newSystem: RotationSystem) => {
  setSystem(newSystem);
  setPlayers(prev => {
    // Build a map of existing players by role for preservation
    const byRole: Record<string, Player[]> = {};
    for (const p of prev) {
      if (!byRole[p.role]) byRole[p.role] = [];
      byRole[p.role].push(p);
    }

    const defaults = newSystem === '6-2' ? DEFAULT_PLAYERS_62 : DEFAULT_PLAYERS;

    // For each default slot, try to reuse an existing player of that role
    const used = new Set<string>();
    return defaults.map(def => {
      const candidates = byRole[def.role] || [];
      const reuse = candidates.find(c => !used.has(c.id));
      if (reuse) {
        used.add(reuse.id);
        return { ...reuse, id: def.id }; // keep name/number, use new ID
      }
      return { ...def };
    });
  });
}, []);
```

- [ ] **Step 3: Verify build compiles and 6-2 switch works without errors**

Run: `npx next build`
Expected: No errors, no duplicate key warnings in console on 6-2 switch.

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts src/hooks/useTeam.ts
git commit -m "fix: duplicate player IDs on system switch, unique default IDs"
```

---

### Task 2: Layout Rebuild — Court-Dominant, Zero Dead Space

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`

The fundamental problem: the court is inside a constrained max-width box with flex-col stacking, leaving huge gaps. The solution:

**Mobile:** Court fills the entire space between header and a thin floating control overlay. No gap, no padding. Controls float over the bottom of the court with a gradient fade.

**Desktop:** Centered two-column layout with the court taking 60% and the side panel 40%. Court scales to fill its column. No max-width cap — let it breathe.

- [ ] **Step 1: Add new CSS utilities to globals.css**

```css
/* Glassmorphism panel */
.glass {
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Gradient fade for floating controls */
.fade-up {
  background: linear-gradient(to top, rgba(3, 7, 18, 0.95) 60%, transparent 100%);
}

/* Subtle inner shadow for depth */
.inner-glow {
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 -1px 0 rgba(255,255,255,0.05);
}
```

- [ ] **Step 2: Rebuild mobile layout in page.tsx**

Mobile layout structure:
```
<main class="h-dvh flex flex-col overflow-hidden">
  <!-- Thin header: ~40px -->
  <header class="glass border-b border-white/5 px-3 py-1.5 flex items-center justify-between z-30">
    <!-- Logo + system toggle (left) -->
    <!-- Share + Compare + Setup icons (right) -->
  </header>

  <!-- Court fills ALL remaining space -->
  <div class="flex-1 relative overflow-hidden">
    <!-- State banner: "R1 · Serve" floating top-center over court -->
    <div class="absolute top-2 left-1/2 -translate-x-1/2 z-20 glass rounded-full px-4 py-1 text-sm">
      Rotation {n} · {phase}
    </div>

    <!-- Court SVG: fills this container entirely -->
    <div ref={courtRef} class="w-full h-full flex items-center justify-center p-2">
      <Court>{courtContent}</Court>
    </div>

    <!-- Floating controls: gradient fade at bottom -->
    <div class="absolute bottom-0 inset-x-0 z-20 fade-up pt-12 pb-[env(safe-area-inset-bottom)]">
      <div class="px-3 pb-2 space-y-2">
        <!-- Position filter pills -->
        <!-- Rotation + Phase + Play row -->
      </div>
    </div>
  </div>
</main>
```

Key changes:
- `h-dvh` + `overflow-hidden` on main — fills exactly the viewport, no scrolling
- Court container is `flex-1` — takes ALL space between header and nothing (controls float over)
- Controls use `absolute bottom-0` with `fade-up` gradient — they sit on top of the court's bottom area
- State banner ("R1 · Serve") floats as a pill at top-center over the court
- No gaps, no padding waste

- [ ] **Step 3: Rebuild desktop layout in page.tsx**

Desktop layout (md breakpoint):
```
<main class="h-dvh flex flex-col overflow-hidden">
  <header><!-- same as mobile --></header>

  <div class="flex-1 flex overflow-hidden">
    <!-- Court: 60% width, centered vertically -->
    <div class="flex-1 flex items-center justify-center p-4">
      <div class="w-full max-w-[640px]">
        <Court>{courtContent}</Court>
      </div>
    </div>

    <!-- Side panel: fixed 320px, scrollable -->
    <div class="w-[320px] border-l border-white/5 glass p-4 flex flex-col gap-3 overflow-y-auto">
      <!-- State banner card -->
      <!-- Position filter -->
      <!-- Rotation selector -->
      <!-- Phase indicator (step dots) -->
      <!-- Playback controls -->
      <!-- Progress timeline -->
      <!-- Position info (when focused) -->
    </div>
  </div>
</main>
```

Key changes:
- Court max-width increased to 640px (from 550px)
- Side panel has glassmorphism background
- Everything in `h-dvh overflow-hidden` — no page scroll
- Court vertically centered in its column

- [ ] **Step 4: Build and verify no dead space on both viewports**

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx src/app/globals.css
git commit -m "feat: court-dominant layout rebuild, zero dead space"
```

---

### Task 3: Header Redesign — Minimal, Branded

**Files:**
- Modify: `src/app/page.tsx` (header section only)

- [ ] **Step 1: Redesign the header**

The header should be ultra-thin (~36px), with branding that has personality:

```tsx
<header className="glass border-b border-white/5 px-3 py-1 flex items-center justify-between z-30 relative">
  {/* Left: Logo */}
  <div className="flex items-center gap-2">
    {/* Volleyball icon */}
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
      <span className="text-[10px] font-black text-white">V</span>
    </div>
    <span className="text-sm font-semibold tracking-tight text-white">
      VBall<span className="text-indigo-400 hidden sm:inline"> Rotations</span>
    </span>
  </div>

  {/* Center: System toggle (more prominent) */}
  <div className="absolute left-1/2 -translate-x-1/2 flex bg-white/8 rounded-full p-0.5">
    <button className={system==='5-1' ? 'bg-indigo-500 text-white px-3 py-0.5 rounded-full text-xs font-bold' : 'px-3 py-0.5 text-xs text-gray-400'}>
      5-1
    </button>
    <button className={system==='6-2' ? 'bg-indigo-500 text-white px-3 py-0.5 rounded-full text-xs font-bold' : 'px-3 py-0.5 text-xs text-gray-400'}>
      6-2
    </button>
  </div>

  {/* Right: Icon buttons */}
  <div className="flex items-center gap-1">
    <!-- Share, Compare, Setup as 28px icon-only buttons -->
  </div>
</header>
```

- [ ] **Step 2: Commit**

---

### Task 4: State Banner — Prominent Rotation/Phase Display

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create a floating state banner on mobile**

Instead of hiding the rotation/phase info, show it as a glassmorphic pill floating over the top of the court:

```tsx
{/* Floating state banner (mobile) */}
<div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-20">
  <div className="glass rounded-full px-4 py-1.5 border border-white/10 shadow-lg flex items-center gap-2">
    <span className="text-xs font-bold text-indigo-400">R{currentRotation}</span>
    <span className="w-px h-3 bg-white/20" />
    <span className="text-xs font-medium text-white capitalize">{currentPhase}</span>
  </div>
</div>
```

- [ ] **Step 2: Create a state card for the desktop side panel**

```tsx
{/* State card (desktop side panel) */}
<div className="rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/20 p-3">
  <div className="text-center">
    <div className="text-2xl font-black text-white">R{currentRotation}</div>
    <div className="text-sm font-medium text-indigo-300 capitalize">{currentPhase}</div>
  </div>
</div>
```

- [ ] **Step 3: Commit**

---

### Task 5: Court Visual Upgrade

**Files:**
- Modify: `src/components/court/Court.tsx`
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Make the court SVG fill its container properly**

Change the Court component to accept optional className and use `viewBox` properly:
- The SVG should have `viewBox="0 0 450 480"` and `className="w-full h-auto max-h-full"` so it scales to fit without cropping
- On mobile in the court-dominant layout, this means the court will be much larger

- [ ] **Step 2: Add court texture and polish**

Replace the plain gradient with a more volleyball-court-like appearance:
- Slightly darker green (#1a8a3e) with a subtle stripe pattern (like real courts have)
- Add center court circle (decorative, very faint)
- Make the attack line more visible — solid white at 0.4 opacity instead of dashed
- Make the net thicker (16px tall instead of 12) with a better pattern

- [ ] **Step 3: Commit**

---

### Task 6: Floating Controls Overlay (Mobile)

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build floating controls with gradient fade**

The controls overlay sits at the bottom of the court, fading from transparent to the background color:

```tsx
<div className="md:hidden absolute bottom-0 inset-x-0 z-20 pointer-events-none">
  <div className="fade-up pt-16 pb-safe pointer-events-auto">
    <div className="px-3 pb-2 space-y-1.5">
      {/* Position filter: horizontal scroll of small pills */}
      <div className="flex gap-1.5 overflow-x-auto hide-scrollbar justify-center">
        {/* Smaller pills: 28px height, text-[11px] */}
      </div>

      {/* Single compact control row */}
      <div className="flex items-center justify-center gap-2">
        <button onClick={stepBackward}>◀</button>

        {/* Rotation selector: pill with numbers */}
        <div className="flex bg-white/10 rounded-full p-0.5">
          {[1,2,3,4,5,6].map(r => (
            <button key={r} className="w-7 h-7 rounded-full text-xs ...">{r}</button>
          ))}
        </div>

        <button onClick={stepForward}>▶</button>

        {/* Phase dots: 3 circles showing current phase */}
        <div className="flex gap-1">
          {phases.map(p => (
            <button key={p} onClick={...}
              className={`w-2.5 h-2.5 rounded-full ${current ? 'bg-indigo-400' : 'bg-white/20'}`}
              title={p}
            />
          ))}
        </div>

        {/* Play button */}
        <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-indigo-500 ...">
          ▶
        </button>
      </div>
    </div>
  </div>
</div>
```

Phase toggle becomes 3 small dots — visual phase indicator that's tappable. Much more compact than text buttons.

- [ ] **Step 2: Commit**

---

### Task 7: Side Panel Redesign (Desktop)

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/controls/PositionFilter.tsx`
- Modify: `src/components/controls/PlaybackControls.tsx`
- Modify: `src/components/controls/ProgressTimeline.tsx`
- Modify: `src/components/info/PositionInfo.tsx`

- [ ] **Step 1: Redesign the side panel with visual hierarchy**

The side panel should feel like a polished control panel:
- State card at top (from Task 4)
- Controls grouped in subtle cards with thin borders
- PositionFilter as a grid of small colored squares (not a scrollable row)
- PlaybackControls as a centered group with a large play button
- ProgressTimeline as a visual bar (not dots)
- PositionInfo as a highlighted card when active

- [ ] **Step 2: PositionFilter as grid on desktop**

On desktop, show position filter as a 2-row grid of small color-coded buttons:
```
[All] [S] [OH] [MB] [OPP] [L]
```
Use `md:grid md:grid-cols-6 md:gap-1` instead of flex overflow scroll.

- [ ] **Step 3: ProgressTimeline as visual bar**

Replace the dots with a segmented progress bar:
- 18 thin vertical segments grouped in 6 groups of 3
- Current segment is filled indigo, previous are white, future are gray
- R1-R6 labels above each group
- Total width fills the side panel

- [ ] **Step 4: Commit**

---

### Task 8: Player Token Visual Polish

**Files:**
- Modify: `src/components/court/PlayerToken.tsx`

- [ ] **Step 1: Add drop shadow and improve token appearance**

- Add a subtle drop shadow to tokens: `<filter>` with `feDropShadow`
- Make the circle fill use a subtle gradient (lighter at top-left, darker at bottom-right) for a 3D effect
- Increase font-weight of the jersey number
- When a token is the serving player in serve phase, add a small "🏐" indicator or a white star

- [ ] **Step 2: Fix the undefined radius edge case**

In the pulsing glow ring animation, the `r` attribute uses template literals that can produce undefined. Add a fallback:

```tsx
<animate
  attributeName="r"
  values={`${radius + 4};${radius + 8};${radius + 4}`}
  dur="1.5s"
  repeatCount="indefinite"
/>
```

Make sure `radius` is always a number (add `const radius = isFocused ? 24 : 20;` at the top without conditional chains).

- [ ] **Step 3: Commit**

---

### Task 9: Micro-interactions and Final Polish

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: Various component files

- [ ] **Step 1: Add button press feedback**

All interactive buttons should have `active:scale-95` for press feedback. Add to globals:

```css
.btn-press {
  @apply transition-all active:scale-95;
}
```

Apply to all buttons in controls.

- [ ] **Step 2: Add page transitions**

When rotation changes, add a subtle container transition. Use framer-motion `layoutId` on the state banner for smooth number transitions.

- [ ] **Step 3: Add hover states for desktop**

All interactive elements should have hover states:
- Buttons: `hover:bg-white/15` or `hover:brightness-110`
- Player tokens: `hover:scale-105` via CSS (for desktop mouse users)
- Cards: `hover:border-white/20`

- [ ] **Step 4: Final build verification**

Run `npx next build` and test on mobile (390x844) and desktop (1440x900).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: micro-interactions, button feedback, hover states, polish"
```
