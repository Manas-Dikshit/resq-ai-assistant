---
name: ResQAI
description: Dark command-deck interface for real-time disaster monitoring and emergency response in Odisha, India.
colors:
  signal-teal: "hsl(168 80% 45%)"
  signal-teal-deep: "hsl(200 80% 50%)"
  deck-black: "hsl(220 20% 7%)"
  deck-black-deep: "hsl(220 25% 4%)"
  panel: "hsl(220 18% 10%)"
  panel-raised: "hsl(220 15% 16%)"
  panel-sunken: "hsl(220 15% 14%)"
  ink: "hsl(210 20% 92%)"
  ink-muted: "hsl(215 15% 55%)"
  ink-soft: "hsl(210 20% 85%)"
  hairline: "hsl(220 15% 18%)"
  hairline-strong: "hsl(220 15% 22%)"
  critical-red: "hsl(0 72% 51%)"
  caution-amber: "hsl(38 92% 50%)"
  safe-green: "hsl(145 65% 42%)"
  flood-blue: "hsl(210 80% 55%)"
  fire-orange: "hsl(15 90% 55%)"
  quake-violet: "hsl(280 60% 55%)"
  sidebar-void: "hsl(220 18% 8%)"
typography:
  display:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 700
    fontSize: "1.5rem"
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  hero:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 700
    fontSize: "3rem"
    lineHeight: 1
    letterSpacing: "-0.03em"
  title:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 700
    fontSize: "0.75rem"
    lineHeight: 1.3
    letterSpacing: "0.1em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "0.875rem"
    lineHeight: 1.5
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontWeight: 700
    fontSize: "0.5625rem"
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  hair: "2px"
  tight: "4px"
  snug: "8px"
  base: "12px"
  roomy: "16px"
  section: "24px"
  page: "32px"
components:
  button-primary:
    backgroundColor: "{colors.signal-teal}"
    textColor: "{colors.deck-black}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "hsl(168 80% 45% / 0.9)"
    textColor: "{colors.deck-black}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-destructive:
    backgroundColor: "{colors.critical-red}"
    textColor: "hsl(0 0% 100%)"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  button-outline:
    backgroundColor: "{colors.deck-black}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "40px"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  badge-live:
    backgroundColor: "hsl(145 65% 42% / 0.1)"
    textColor: "{colors.safe-green}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  badge-demo:
    backgroundColor: "hsl(38 92% 50% / 0.1)"
    textColor: "{colors.caution-amber}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  input:
    backgroundColor: "{colors.deck-black}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "40px"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.md}"
    padding: "6px 12px"
---

# Design System: ResQAI

## Overview

**Creative North Star: "The Command Deck"**

ResQAI is read like an operations console, not a marketing site. The screen is a dark instrument panel: near-black ground, one signal-teal channel carrying live status, and mono-spaced labels that read like telemetry. Every surface is built for a responder glancing at a phone in bad weather or an operator watching a wall display for six hours. Calm urgency beats spectacle — the interface stays quiet until something is actually wrong.

The system is dark-only by construction. `:root` defines a single dark palette and Tailwind runs with `darkMode: ["class"]`; there is no light theme to fall back to. Depth comes from tonal layering (background → card → secondary → accent) plus a small set of glass surfaces, not from heavy shadows. Color is functional: red, amber, and green mean severity, not decoration. Teal is the one brand signal and it is deliberately rare.

Density is high but rhythmic. Panels use 12–24px internal padding, headers use uppercase mono labels at 9–12px, and body copy stays at 14px Inter. Numbers get the mono face so they align in tables and readouts. Motion is short (150–300ms), eased, and always communicates a state change; nothing loops for atmosphere except slow status pulses.

**Key Characteristics:**
- Dark, telemetry-first surfaces with a single teal signal channel
- Mono for labels, numbers, and headings; Inter for prose
- Severity color is semantic: red = critical, amber = caution/sample, green = safe/live
- Tonal layering and glass instead of drop shadows
- Compact 4/8px rhythm tuned for dashboards, not landing pages
- Honest data states: live, cached, and sample are visually distinct

## Colors

A near-black deck with one cold teal signal and three severity channels; everything else is a neutral step.

### Primary
- **Signal Teal** (`hsl(168 80% 45%)`): the only brand accent. Used for primary actions, live-status text, focus rings, active nav, and the “live” dot. It should read as a channel indicator, not a paint job.
- **Signal Deep** (`hsl(200 80% 50%)`): the cool end of `--gradient-primary`, used only inside gradient text and the hero CTA glow.

### Neutral
- **Deck Black** (`hsl(220 20% 7%)`): page background and the base of every gradient.
- **Panel** (`hsl(220 18% 10%)`): cards, popovers, map popups.
- **Panel Raised** (`hsl(220 15% 16%)`): hover fills, secondary buttons, inset controls.
- **Panel Sunken** (`hsl(220 15% 14%)`): muted chips and quiet sections.
- **Hairline** (`hsl(220 15% 18%)`): the default 1px border on every card and divider.
- **Ink** (`hsl(210 20% 92%)`): primary text.
- **Ink Muted** (`hsl(215 15% 55%)`): secondary text, timestamps, helper copy. Minimum contrast against Panel is the floor — do not go lighter.
- **Sidebar Void** (`hsl(220 18% 8%)`): admin sidebar, one step darker than the page.

### Tertiary (semantic severity)
- **Critical Red** (`hsl(0 72% 51%)`): destructive actions, critical alerts, “near full” shelter state.
- **Caution Amber** (`hsl(38 92% 50%)`): warnings, moderate occupancy, and every sample/demo badge.
- **Safe Green** (`hsl(145 65% 42%)`): online, live, available capacity.
- **Flood Blue** (`hsl(210 80% 55%)`), **Fire Orange** (`hsl(15 90% 55%)`), **Quake Violet** (`hsl(280 60% 55%)`): disaster-type encoding only. Never use these for generic UI.

### Named Rules
**The One Signal Rule.** Signal Teal occupies ≤10% of any screen. If two elements compete for it, one is wrong.

**The Severity Means Something Rule.** Red, amber, and green are reserved for operational state. Decorative use of a severity hue is a bug, not a style choice.

**The Sample Is Amber Rule.** Any synthetic, seeded, or illustrative data wears `DemoDataBadge` in Caution Amber. No sample data ships unlabeled.

## Typography

**Display Font:** JetBrains Mono (with `ui-monospace, monospace`)
**Body Font:** Inter (with `ui-sans-serif, system-ui, sans-serif`)
**Label Font:** JetBrains Mono

**Character:** A terminal voice for the machine and a humanist voice for the human. Mono carries every number, status, and heading so the console reads as instrumentation; Inter carries sentences so instructions stay readable at 14px.

### Hierarchy
- **Hero** (700, 48–96px, 1.0, −0.03em): landing hero only (`text-5xl md:text-7xl lg:text-8xl`). One per page.
- **Display** (700, 24–32px, 1.2, −0.02em): page titles and panel headlines.
- **Title** (700, 12px, 1.3, 0.1em, uppercase): panel headers, section labels, table heads.
- **Body** (400, 14px, 1.5): descriptions and instructions; cap long text at ~70ch.
- **Label** (700, 9–11px, 1.2, 0.08em, uppercase): badges, timestamps, axis ticks, telemetry captions.

### Named Rules
**The Numbers Are Mono Rule.** Any value a user compares — counts, percentages, coordinates, timestamps — uses the display face and `tabular-nums` where available.

**The Uppercase Is Small Rule.** Uppercase tracking is for ≤12px labels only. Never set a sentence in uppercase.

## Layout

The app is a fixed shell with a scrolling content region: a 56px-ish top bar (`px-4 py-2`, `glass-strong`, bottom hairline), an optional left sidebar (admin), and a main area that owns scroll. The dashboard uses a two-column split — map/primary canvas on the left, a 320–360px insight rail on the right — collapsing to a single column below `lg`.

Spacing follows a 4px base with a 4/8/12/16/24/32 rhythm. Panel padding is 12–16px for dense telemetry, 24px for editorial cards. Grids use `gap-3`/`gap-4` inside panels and `gap-6` between major regions. Content max width is unbounded on dashboards (operators want the wall), but reading surfaces cap at 70ch.

Breakpoints are Tailwind defaults: `sm 640`, `md 768`, `lg 1024`, `xl 1280`, `2xl 1400` (container). Mobile is a first-class responder target: touch targets ≥44px, the insight rail becomes a bottom sheet or stacked section, and the map keeps a usable height (≥60vh).

## Elevation & Depth

Depth is tonal first. Surfaces step from Deck Black to Panel to Panel Raised; borders do the separating work. Shadows are rare and almost always a colored glow tied to state, never a generic drop shadow.

Glass is the one exception: `glass` (60% panel, 16px blur) and `glass-strong` (85% panel, 24px blur) are used for the top bar, map overlays, and floating legends so map tiles stay legible underneath. Do not stack glass on glass.

### Shadow Vocabulary
- **Signal Glow** (`0 0 30px hsl(168 80% 45% / 0.2)`): focus/hero emphasis on teal elements.
- **Critical Glow** (`0 0 30px hsl(0 72% 51% / 0.3)`): active SOS or critical alert.
- **Caution Glow** (`0 0 20px hsl(38 92% 50% / 0.25)`): warning banners.
- **Popup Lift** (`0 20px 40px hsl(0 0% 0% / 0.5)`): Leaflet popups only.

### Named Rules
**The Flat-By-Default Rule.** Panels are flat at rest. A shadow appears only as a response to state (hover, focus, alert) or to lift a map popup above tiles.

## Shapes

Corners are gently squared, never pill-shaped except for badges and status dots. The base radius is 8px (`--radius: 0.5rem`): cards and primary containers use 8px, controls 6px, small chips 4px, floating map popups 12px, and badges/avatars fully round. Borders are always 1px and use Hairline; hover raises to Hairline Strong.

The form language is rectangular and gridded — panels align to a strict grid, dividers run edge to edge, and the only circles are status dots, avatars, and map markers. Clipping is minimal; no diagonal cuts or decorative masks.

## Components

### Buttons
- **Shape:** 6px radius, 40px default height, 36px small, 44px large.
- **Primary:** Signal Teal fill, Deck Black text, `0 16px` padding. One primary action per view.
- **Hover / Focus:** hover drops fill to 90% opacity; focus-visible adds a 2px Signal Teal ring with a 2px offset. Transitions are `transition-colors` at 150ms.
- **Secondary:** Panel Raised fill, Ink text. **Outline:** transparent fill with a Hairline border. **Ghost:** no fill until hover, then Panel Raised. **Destructive:** Critical Red fill, white text. **Link:** Signal Teal text, underline on hover.
- **Icon buttons:** 40×40px, Lucide icon at 16px, accessible name required.

### Chips & Badges
- **Style:** fully round, 1px border, tinted background at 10% of the semantic hue, text at full hue, 9–12px mono uppercase.
- **Live:** Safe Green tint with a 2px pulsing dot. **Sample:** Caution Amber tint with a flask icon (`DemoDataBadge`). **Severity:** red/amber/green tints matching operational state.
- **State:** filter chips may toggle to a filled semantic tint; status chips never toggle.

### Cards / Containers
- **Corner Style:** 8px.
- **Background:** Panel on Deck Black.
- **Shadow Strategy:** none at rest (see Elevation & Depth).
- **Border:** 1px Hairline.
- **Internal Padding:** 12–16px for telemetry, 24px for editorial.

### Inputs / Fields
- **Style:** 1px Hairline border, Deck Black fill, 6px radius, 40px height, 14px Inter text.
- **Focus:** border shifts to Signal Teal plus a 2px ring at 40% opacity; no layout shift.
- **Error / Disabled:** error uses Critical Red border and helper text; disabled drops to 50% opacity and blocks pointer events.

### Navigation
- **Top bar:** `glass-strong`, 1px bottom hairline, 12px mono links, Ink Muted default, Ink on hover, Panel Raised hover fill. Active route uses Signal Teal text.
- **Sidebar (admin):** Sidebar Void background, 12px mono items, 6px radius, Panel Sunken hover, Signal Teal for the active item and a left indicator.
- **Mobile:** collapse to an icon row or sheet; keep the SOS/destructive action visually distinct and never behind a menu.

### Signature Components
- **Status Dot:** 8px Safe Green dot with an `animate-ping` halo and `status-live` pseudo-element; the only looping ambient motion allowed.
- **Demo Data Badge:** flask icon + uppercase label in Caution Amber; mandatory on any synthetic dataset.
- **Telemetry Stat:** 24px mono value in a semantic color, 12px mono label above, optional delta below.

## Do's and Don'ts

### Do:
- **Do** keep Signal Teal to one primary action and the live channel per view.
- **Do** use mono for every number, timestamp, coordinate, and status label.
- **Do** label every sample, seeded, or cached dataset with `DemoDataBadge` and say what is live.
- **Do** use 1px Hairline borders and tonal steps for separation before reaching for a shadow.
- **Do** keep body text at 14px Inter with ≥4.5:1 contrast against Panel.
- **Do** keep touch targets ≥44×44px and preserve map height on small screens.
- **Do** respect `prefers-reduced-motion`: status pulses and scan lines stop, final states remain.

### Don't:
- **Don't** introduce a light theme or a second accent hue; the system is dark-only and single-signal.
- **Don't** use severity colors (red/amber/green) for decoration, gradients, or “visual interest”.
- **Don't** use emoji as structural icons; use Lucide at a consistent 16px.
- **Don't** set sentences in uppercase or use mono for long-form prose.
- **Don't** stack glass surfaces or add drop shadows to resting cards.
- **Don't** show a metric derived from `Math.random()` or seed data without a visible badge.
- **Don't** let a fixed header, legend, or chat panel cover keyboard focus or content on mobile.
