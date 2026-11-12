---
name: resqai-design
description: Build, extend, or review ResQAI interfaces in the Command Deck design system. Use when adding a page, panel, chart, map overlay, badge, form, or mobile layout to this repo, or when checking whether UI matches the incumbent dark teal telemetry style.
---

# ResQAI UI Skill

Apply the ResQAI design system to every screen in this repo. `DESIGN.md` is the source of truth for tokens and rules; this skill is the working procedure. If the two disagree, `DESIGN.md` wins and this file should be updated.

## When to use

- Building or editing anything under `src/pages/` or `src/components/`
- Adding a chart, map overlay, stat card, alert, badge, or form
- Reviewing a screen for visual consistency, contrast, or mobile behavior
- Deciding whether data may be shown as live, cached, or sample

## Non-negotiables

1. **Dark-only, single accent.** Use `hsl(var(--primary))` (Signal Teal) for one action and the live channel per view. Never add a second accent or a light theme.
2. **Severity color is semantic.** `--destructive` red, `--warning` amber, `--safe` green mean critical, caution/sample, and safe/live. Never decorative.
3. **Mono for machine values.** JetBrains Mono (`font-display`) for headings, numbers, timestamps, coordinates, status labels. Inter (`font-body`) for sentences.
4. **Label synthetic data.** Any seeded, mocked, or illustrative dataset must render `<DemoDataBadge />` in the same view. Live queries do not get a badge; cached/offline data says so.
5. **Flat by default.** Separate surfaces with 1px `border-border` and tonal steps (`bg-background` → `bg-card` → `bg-secondary` → `bg-accent`). Shadows only for state, glow, or map popups.
6. **Icons are Lucide.** 16px in buttons and labels, consistent stroke, `aria-hidden` when decorative. No emoji as UI icons.
7. **Accessible by default.** Focus-visible ring, ≥4.5:1 body contrast, ≥44px touch targets, labels on inputs, and reduced-motion support.

## Token quick reference

| Need | Use |
| :--- | :--- |
| Page ground | `bg-background` |
| Panel / card | `bg-card border border-border rounded-lg` |
| Raised hover | `bg-accent` or `bg-secondary` |
| Primary action | `bg-primary text-primary-foreground hover:bg-primary/90` |
| Destructive | `bg-destructive text-destructive-foreground` |
| Secondary text | `text-muted-foreground` |
| Hairline | `border-border` |
| Live status | `text-safe` + `bg-safe/10 border-safe/20` |
| Caution / sample | `text-warning` + `bg-warning/10 border-warning/20` |
| Critical | `text-destructive` + `bg-destructive/10 border-destructive/20` |
| Glass overlay | `glass` or `glass-strong` (never nested) |
| Panel title | `font-display text-xs font-bold uppercase tracking-widest text-muted-foreground` |
| Big metric | `font-display text-2xl font-bold` |
| Body copy | `text-sm text-foreground` or `text-muted-foreground` |

Radius: `rounded-lg` (8px) cards, `rounded-md` (6px) controls, `rounded-full` badges. Spacing rhythm: 4 / 8 / 12 / 16 / 24 / 32.

## Component recipes

### Page shell

```tsx
<main className="min-h-screen bg-background text-foreground">
  <header className="flex items-center justify-between border-b border-border glass-strong px-4 py-2">
    <h1 className="font-display text-sm font-bold uppercase tracking-widest">Control Room</h1>
    <DemoDataBadge label="Sample data" /> {/* only when the view contains seed data */}
  </header>
  <section className="grid gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
    {/* panels */}
  </section>
</main>
```

### Telemetry stat

```tsx
<div className="rounded-lg border border-border bg-card p-4">
  <p className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Open incidents</p>
  <p className="mt-1 font-display text-2xl font-bold text-destructive tabular-nums">{count}</p>
  <p className="mt-1 text-xs text-muted-foreground">Live from Supabase</p>
</div>
```

### Live / sample / cached state

```tsx
{isLoading ? (
  <span className="text-xs text-muted-foreground">Loading…</span>
) : isLive ? (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-safe/20 bg-safe/10 px-2 py-0.5 text-[10px] font-display font-bold uppercase text-safe">
    <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" /> Live
  </span>
) : (
  <DemoDataBadge label="Seed data" />
)}
```

Never render a number from `Math.random()` or `odishaData` as if it were operational. Use a live query or badge the fallback.

### Empty state

```tsx
<div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center">
  <p className="text-sm text-foreground">No shelters in the database</p>
  <p className="mt-1 text-xs text-muted-foreground">Add rows to the shelters table to populate this view.</p>
</div>
```

### Map overlay

```tsx
<div className="absolute bottom-4 left-4 z-[500] max-w-xs rounded-xl glass-strong p-4">
  <p className="mb-3 font-display text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shelter status</p>
  {/* legend rows */}
  {source === "seed" && <DemoDataBadge label="Seed shelter data" className="mt-1" />}
</div>
```

## Data honesty rules

- Live Supabase query → no badge, state the freshness if it matters.
- Realtime subscription → show a live dot, not a badge.
- Seed/mock fallback → `DemoDataBadge` plus a one-line reason (“No rows in DB, showing seed data”).
- Offline cache → label “Cached” and the timestamp.
- Charts built from `odishaData` → badge the chart region, not the whole page.

## Layout rules

- Dashboard: primary canvas left, 320–360px insight rail right; stack below `lg`.
- Admin: sidebar (`bg-sidebar`) + scrolling main; active item in `text-primary`.
- Map keeps ≥60vh height on mobile; overlays must not cover the SOS action.
- Fixed headers and chat panels must not hide keyboard focus; add scroll padding when needed.

## Motion

- 150ms for color/hover, 300ms for panel transitions, `ease-out` or the CSS `--ease-standard`.
- Allowed ambient motion: the `status-live` pulse and `animate-ping` halo. Nothing else loops.
- Wrap non-essential motion in `prefers-reduced-motion` guards; keep final states visible.

## Review checklist

- [ ] One primary action per view; Signal Teal ≤10% of the screen
- [ ] Every number/timestamp in mono, every sentence in Inter
- [ ] Synthetic data badged; live vs cached stated
- [ ] 1px borders and tonal steps, no resting drop shadows
- [ ] Contrast ≥4.5:1 for body text; severity color used semantically
- [ ] Focus-visible ring present on all interactive elements
- [ ] Touch targets ≥44px; tested at 375px and 1440px
- [ ] `prefers-reduced-motion` respected
- [ ] No emoji icons; Lucide only
- [ ] `npx tsc --noEmit -p tsconfig.app.json`, `npm run lint`, `npm test`, `npm run build` pass

## File map

| Concern | File |
| :--- | :--- |
| Design tokens and rules | `DESIGN.md` |
| CSS variables, glass, glow utilities | `src/index.css` |
| Tailwind color/font mapping | `tailwind.config.ts` |
| Buttons, cards, badges, inputs | `src/components/ui/*` |
| Sample-data marker | `src/components/DemoDataBadge.tsx` |
| App shell and routes | `src/App.tsx`, `src/pages/*` |
| Dashboard layout | `src/pages/Dashboard.tsx` |
| Map overlays | `src/components/evacuation/EvacuationMap.tsx` |
| Admin shell | `src/pages/Admin.tsx` |

## Commands

```bash
npm run dev      # http://localhost:8080
npm run build    # production + service worker
npm run lint
npm test
npx tsc --noEmit -p tsconfig.app.json
```
