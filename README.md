# VBall Rotations

An interactive volleyball rotation learning tool. Visualize 5-1 and 6-2 systems with animated court diagrams, player movements, and phase breakdowns.

**[Try it live](https://vball.mohammadhameed.dev)**

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## What is this?

VBall Rotations helps players, coaches, and fans understand volleyball rotation systems through interactive court visualizations. Instead of static diagrams, you get animated transitions between phases, clickable player tokens with role-specific info, and the ability to customize your own team lineup.

### Features

**Rotation Systems**
- **5-1 System** with 4 variants: Standard, Spread, Slide-Heavy, and Reverse
- **6-2 System** with full rotation support
- All 6 rotations with 3 phases each (Serve, Receive, Transition)
- Accurate overlap-legal serve positions

**Interactive Court**
- SVG court with animated player tokens (Framer Motion)
- Movement arrows and ghost trails showing transitions between phases
- Zone overlays showing each player's area of responsibility
- Click any player to see their role, zone, and next movement
- Role-based filtering to highlight specific positions

**Learning Tools**
- Volleyball glossary with searchable terms
- Contextual help popovers
- Learn mode with phase descriptions
- Position-specific tips and responsibilities for every rotation

**Customization**
- Edit player names, numbers, and roles
- Toggle libero on/off
- Multiple token display modes (jersey, role abbreviation, name)
- Flip court orientation
- Reduce motion for accessibility

**Sharing**
- Generate shareable URLs with full team configuration
- QR code generation for quick sharing
- Compressed URL state (lz-string)

**Mobile-First**
- Responsive design with dedicated mobile controls
- Swipe gestures for rotation navigation
- Touch-friendly bottom sheet settings drawer
- Safe area support for modern devices

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- npm

### Install & Run

```bash
git clone https://github.com/MoeHameed/vball-rotations.git
cd vball-rotations
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

The app uses `output: "standalone"` in Next.js config, making it ready for containerized deployments.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) (strict mode) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Animation | [Framer Motion 12](https://www.framer.com/motion/) |
| Sharing | [qrcode.react](https://github.com/zpao/qrcode.react) + [lz-string](https://github.com/pieroxy/lz-string) |

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Main application page
│   ├── layout.tsx          # Root layout with metadata
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── compare/            # Side-by-side rotation comparison
│   ├── controls/           # Playback, rotation, phase controls
│   ├── court/              # Court SVG, player tokens, zones, arrows
│   ├── help/               # Glossary, help popovers
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
│   └── useUrlState.ts      # URL sharing/persistence
└── lib/
    ├── rotationEngine.ts   # Core engine: maps players to positions
    ├── constants.ts        # Role colors, default players
    ├── courtMath.ts        # Court coordinate conversions
    └── types.ts            # TypeScript interfaces
```

---

## How the Rotation Data Works

Each rotation system is defined as a map of 6 rotations, each with 3 phases (serve, receive, transition). Every phase contains:

- **positions** — `{ role: { x, y } }` court coordinates for each player
- **zones** — rectangular areas showing each player's responsibility

The rotation engine (`rotationEngine.ts`) maps a team's players to their role slots, handles libero substitution (replacing the back-row middle blocker), and outputs the final positions and zones for rendering.

Variants (Spread, Slide, Reverse) deep-clone the standard data and apply position transformations, so changes to the base data automatically propagate.

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Arrow Left` / `Arrow Right` | Step backward / forward |
| `Space` | Play / Pause |
| `1` - `6` | Jump to rotation |
| `Escape` | Close modal or clear focus |

---

## Contributing

Contributions are welcome. If you find an inaccurate rotation position, a UI bug, or want to add a new rotation system:

1. Fork the repo
2. Create a feature branch (`git checkout -b fix/rotation-3-receive`)
3. Make your changes
4. Run `npm run build` to verify
5. Open a pull request

For rotation data changes, please verify positions against official volleyball overlap rules.

---

## Support

If you find this tool useful, consider supporting development:

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-Support-yellow?logo=buy-me-a-coffee&logoColor=white)](https://buy.stripe.com/3cIaI22p51Ct7jW4gg)

---

## License

[MIT](LICENSE) - use it, fork it, learn from it.
