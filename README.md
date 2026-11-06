<div align="center">

# VBall Rotations

Interactive volleyball rotation tool

Visualize 5-1 and 6-2 systems with animated court diagrams,<br>player movements, and phase breakdowns.

**Free. Open-source. Mobile-friendly.**

[**Try it live**](https://vball.mohammadhameed.dev) | [Report a Bug](https://github.com/MoeHameed/vball-rotations/issues/new) | [Support Development](https://donate.stripe.com/9B68wOgRb8YbdNNdBH67S04)

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

</div>

---

<div align="center">

<a href="https://vball.mohammadhameed.dev">
  <picture>
    <img src="public/screenshots/desktop-hero.png" alt="VBall Rotations — Desktop view showing setter penetration zone overlay with movement arrows" width="100%">
  </picture>
</a>

<br>

<sup>R1 Receive phase — setter penetration highlighted with zone overlay, movement arrows, and player info panel</sup>

</div>

---

## What is this?

VBall Rotations helps players, coaches, and fans understand volleyball rotation systems through interactive court visualizations. Instead of static diagrams, you get animated transitions between phases, clickable player tokens with role-specific info, and the ability to customize your own team lineup.

<div align="center">
<table>
<tr>
<td width="60%">
<img src="public/screenshots/desktop-transition.png" alt="Desktop transition phase with movement arrows" width="100%">
<br><sup>Transition phase — movement arrows show where players shift from receive positions</sup>
</td>
<td width="40%">
<img src="public/screenshots/mobile-receive.png" alt="Mobile view of receive phase" width="100%">
<br><sup>Mobile — full court with compact controls</sup>
</td>
</tr>
</table>
</div>

---

## Features

### Interactive court with zone overlays

Click any player or filter by position to see their zone of responsibility, movement arrows, and coaching tips. Each rotation and phase has specific positional data.

<div align="center">
<img src="public/screenshots/zones-player-info.png" alt="Zone overlays highlighting outside hitter attack zones with player info" width="85%">
<br><sup>OH filter active — outside attack and right-side hit zones with positional tips in the sidebar</sup>
</div>

<br>

### Player info and coaching tips

Tap any player token to see their role, zone, row assignment, coaching tips, and where they move next. Available in every rotation and phase.

<div align="center">
<img src="public/screenshots/mobile-player-info.png" alt="Mobile player info sheet showing opposite hitter details" width="300">
<br><sup>Mobile player info — zone, row, tips, and next movement</sup>
</div>

<br>

### Volleyball glossary

Searchable reference for volleyball terms, court legend, rotation systems, and all 5-1 variants explained.

<div align="center">
<img src="public/screenshots/glossary.png" alt="Volleyball glossary with searchable terms" width="85%">
</div>

<br>

### Team customization and settings

Customize player names, jersey numbers, and roles. Switch between 5-1 and 6-2 systems, choose rotation variants (Standard, Spread, Slide-Heavy, Reverse), toggle libero, and adjust display preferences.

<div align="center">
<img src="public/screenshots/settings.png" alt="Settings drawer with team customization" width="85%">
</div>

---

### All features

**Rotation Systems**
- 5-1 System with 4 variants: Standard, Spread, Slide-Heavy, Reverse
- 6-2 System with full rotation support
- All 6 rotations with 3 phases each (Serve, Receive, Transition)
- Overlap-legal serve positions

**Interactive Court**
- SVG court with animated player tokens
- Movement arrows and ghost trails between phases
- Zone overlays showing area of responsibility
- Role-based position filtering

**Learning Tools**
- Clickable player tokens with role-specific tips
- Searchable volleyball glossary
- Contextual help popovers
- Learn mode with phase descriptions

**Sharing & Customization**
- Shareable team URLs and QR codes (see [what a link includes](#save-and-share-a-team))
- Editable player names, numbers, roles
- Multiple display modes (jersey, role abbreviation, name)
- Court flip, reduce motion, libero toggle

**Mobile-First**
- Responsive design with dedicated mobile controls
- Swipe gestures for navigation
- Touch-friendly bottom sheet settings
- Safe area support

**Keyboard shortcuts**

Shortcuts are ignored while editing an input, textarea, or select.

| Key | Action |
|-----|--------|
| `Arrow Left` / `Arrow Right` | Step backward / forward |
| `Space` | Play / Pause |
| `1` - `6` | Jump to rotation |
| `Escape` | Close settings, then glossary, or clear the role filter |

---

## Getting started

This checkout is [Jonathan Edwards's fork](https://github.com/justfinethanku/vball-rotations)
of [MoeHameed/vball-rotations](https://github.com/MoeHameed/vball-rotations).
The live demo, screenshots, support links, and donation destination describe the
upstream project; they do not identify a deployment of this fork.

### Prerequisites

- Git
- [Node.js](https://nodejs.org/) **20.9 or later** and npm. Node 18 cannot run
  the installed Next.js 16 release; see the [Next.js system requirements](https://nextjs.org/docs/app/getting-started/installation#system-requirements).
- Network access for npm packages and the Inter font downloaded by
  `next/font/google` during development compilation and production builds.

The application needs no API keys, environment file, database, or account for
local use. The setup and checks below were verified on Linux ARM64 with Node
22.22.2 and npm 10.9.7; the minimum Node version was not tested.

### Install and run

1. Clone this fork and enter its directory:

   ```bash
   git clone https://github.com/justfinethanku/vball-rotations.git
   cd vball-rotations
   ```

2. Install the versions recorded in `package-lock.json`:

   ```bash
   npm ci
   ```

3. Start the local development server:

   ```bash
   npm run dev -- --hostname 127.0.0.1
   ```

4. Open [the local application](http://localhost:3000). The page shows the
   volleyball court and first-visit welcome screen. Stop the server with
   `Ctrl+C` when finished.

If port 3000 is occupied, add `--port 3001` to the server command and open
`http://localhost:3001`. To test on another device on your network, bind to
`0.0.0.0` instead of `127.0.0.1` and use the host's LAN address. Clipboard access
may be unavailable over plain HTTP away from localhost.

### Run the checks

From the repository root, run each check before opening a pull request:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

`npm test` compiles the tested library modules into `.test-build/` and runs the
Node test runner with two test workers. The suite covers shared-link validation,
rotation projection, comparison variants, and preference loading and saving.
`npm run lint` runs ESLint; it is a separate command from the production build.
There is no `typecheck` npm script, so use `npx tsc --noEmit` for a full type check.

### Build and run for production

Stop the development server first, then build and start the production server:

```bash
npm run build
npm start -- --hostname 127.0.0.1
```

Open [the local application](http://localhost:3000) again. `npm start` serves the
existing `.next/` build; rebuild after changing the source. Keep the build output,
`public/`, and installed dependencies available to the server. This repository
uses the default Next.js server configuration, with no configured static export.

For a separately hosted fork, review the hardcoded upstream domain in
[`src/app/layout.tsx`](src/app/layout.tsx), [`src/app/sitemap.ts`](src/app/sitemap.ts),
and [`public/robots.txt`](public/robots.txt) before publishing. Review the external
links in [`SupportModal.tsx`](src/components/help/SupportModal.tsx) as well. This
procedure verifies a local server; it does not provision hosting or change the
upstream deployment.

### Troubleshoot setup

| Symptom | Action |
|---------|--------|
| Next.js rejects the Node version | Run `node --version` in the same terminal, switch to Node 20.9 or later, then rerun `npm ci`. |
| A font download fails during compilation | Check outbound access to Google Fonts; the font is configured in `src/app/layout.tsx`. |
| `npm start` cannot find a production build | Run `npm run build` successfully before starting the server. |
| The welcome screen reappears or display choices reset | Check whether browser storage is disabled or cleared. Storage failures fall back to in-memory settings. |

## Save and share a team

Team edits are held in memory. Reloading a plain URL restores the default team;
it does not restore your edited roster. Use **Share** and save the generated link
before reloading if you want to keep the team.

The generated `#data=` URL fragment and QR code contain the team name, system,
players (IDs, names, jersey numbers, roles, avatars), and libero setting. They do
**not** include the selected 5-1 variant, rotation, phase, playback speed, or
display preferences. A shared link loads the team when the page first mounts;
open or reload the full link to load another team.

The fragment is compressed data, not encryption. Anyone with the link or QR code
can read its roster. There is no server-side team store or revocation mechanism.
The QR encoder loads when the share dialog opens. Copying the URL requires
browser clipboard permission; if copying fails, the QR code remains available.

Display mode, learn mode, reduced motion, court orientation, dismissed help, and
onboarding state are stored separately in this browser's `vball-preferences`
local-storage entry. They are not synchronized across devices. Clearing the
site's browser storage resets those preferences; it does not invalidate saved
team links. See [`preferences.ts`](src/lib/preferences.ts) and
[`urlCodec.ts`](src/lib/urlCodec.ts) for the storage schema and share limits.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) (strict mode) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Animation | [Framer Motion 12](https://www.framer.com/motion/) |
| Sharing | [qrcode.react](https://github.com/zpao/qrcode.react) + [lz-string](https://github.com/pieroxy/lz-string) |

---

## Project structure

```text
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main application page
│   ├── layout.tsx          # Root layout with metadata & SEO
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── compare/            # Side-by-side rotation comparison
│   ├── controls/           # Playback, rotation, phase controls
│   ├── court/              # Court SVG, player tokens, zones, arrows
│   ├── help/               # Glossary, help popovers, support modal
│   ├── info/               # Player info sheet, position tips
│   ├── onboarding/         # Welcome screen
│   ├── setup/              # Settings drawer, player cards
│   └── sharing/            # Share button + QR modal
├── data/
│   ├── rotations-5-1.ts    # 5-1 rotation positions & zones
│   ├── rotations-5-1-*.ts  # Spread, Slide, Reverse variants
│   ├── rotations-6-2.ts    # 6-2 rotation positions & zones
│   ├── position-info.ts    # Role-specific tips per rotation
│   └── variants.ts         # Variant metadata
├── hooks/                  # Custom React hooks
│   ├── useRotation.ts      # Rotation state management
│   ├── useTeam.ts          # Team/player state
│   ├── useAnimation.ts     # Playback animation
│   ├── usePreferences.ts   # User preferences (localStorage)
│   └── useUrlState.ts      # Load team fragment on mount; generate share links
└── lib/
    ├── rotationEngine.ts   # Core engine: maps players to positions
    ├── constants.ts        # Role colors, default players
    ├── courtMath.ts        # Court coordinate conversions
    └── types.ts            # TypeScript interfaces
```

---

## Contributing

Contributions are welcome. If you find an inaccurate rotation position, a UI bug, or want to add a new feature:

1. Fork the repo
2. Create a feature branch (`git checkout -b fix/rotation-3-receive`)
3. Make your changes
4. Run [all local checks](#run-the-checks)
5. Open a pull request

For rotation data changes, please verify positions against official volleyball overlap rules.

---

## Support

If you find this tool useful, consider supporting development:

<div align="center">

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://donate.stripe.com/9B68wOgRb8YbdNNdBH67S04)

</div>

**Found a bug?** [Open an issue](https://github.com/MoeHameed/vball-rotations/issues/new)
**Questions?** [hello@mohammadhameed.dev](mailto:hello@mohammadhameed.dev)

---

## License

[MIT](LICENSE) — use it, fork it, learn from it.
