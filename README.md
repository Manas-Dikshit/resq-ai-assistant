# ResQAI — Community-Validated Disaster Intelligence

<div align="center">

![ResQAI](https://img.shields.io/badge/ResQAI-Disaster%20Intelligence-red?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Region](https://img.shields.io/badge/Focus%20Region-Odisha%2C%20India-orange?style=for-the-badge)

**An offline-capable, community-validated disaster intelligence platform for Odisha, India.**

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [Configuration](#configuration) · [Roadmap](#roadmap)

</div>

---

## Overview

ResQAI is an open-source disaster intelligence platform built for **Odisha, India** — a coastal state regularly affected by cyclones, floods, heatwaves, and landslides. It combines geospatial risk prediction, crowd-sourced ground truth, and offline-first delivery so that communities and responders can keep working when connectivity fails.

The platform is designed around a simple feedback loop:

```
AI predicts risk  →  community validates  →  trust score updates  →  better alerts
```

Every prediction carries a confidence value, an explanation of the contributing factors, and a community agreement signal. Every alert is available in **English, Hindi, and Odia**.

### Design goals

| Goal | Approach |
|---|---|
| Works when networks fail | Installable PWA, service-worker precache, cached predictions, offline heuristic engine |
| Trustworthy alerts | Confidence scoring, explainability, community validation, tiered alert levels |
| Reaches the last mile | Odia/Hindi/English UI, low-bandwidth friendly, mobile-first layout |
| Improves over time | Ground-truth reports feed model calibration and trust scoring |
| Operable by responders | Admin dashboard, validation queue, shelter and resource management |

---

## Features

### Interactive disaster map
- Leaflet map with a dark CARTO basemap tuned for emergency readability
- 15-point prediction grid covering Puri Coast, Cuttack, Bhubaneswar, Kendrapara, Jajpur, Balasore, Mayurbhanj, Paradip, Balangir, Sambalpur, Rourkela, Berhampur, Koraput, Boudh, and Dhenkanal
- Canvas-rendered risk heatmap with six selectable layers (flood, cyclone, fire, earthquake, landslide, heat wave)
- Animated pulse rings for `CRITICAL` and `HIGH` risk markers
- Shelter markers color-coded by capacity utilization, with OSRM walking/driving routes
- Weather labels, earthquake and NASA EONET event overlays, community report pins, and the Odisha boundary outline

### Risk prediction engine
- Six risk types per grid point over a 48-hour forecast window
- Four-tier alert model: `VERIFIED_CRITICAL` → `AI_PREDICTED` → `MONITORING` → `LOW_WATCH`
- Four-level risk classification: `CRITICAL` / `HIGH` / `MEDIUM` / `LOW`
- Per-prediction explainability: contributing factors, impact scores, and a plain-language summary
- Season-aware and geography-aware heuristics (monsoon, cyclone season, summer peak, coastal proximity, river deltas, forest cover, highlands)
- Weather features: 7-day precipitation, wind speed, maximum temperature, sea surface temperature
- Pluggable external model via the `ML_MODEL_URL` secret; falls back to heuristics when unset

### Community validation
- Citizens confirm or deny predictions in one tap
- Trust scores (0–1) derived from community consensus
- Admin-verified reports marked with a `VERIFIED` badge
- Realtime updates via Supabase subscriptions
- Validation queue in the admin panel

### Reporting
- Authenticated report submission with disaster type, description, coordinates, and optional photo
- Upvote/downvote and confirm/deny feedback on each report
- Reports appear on the map immediately after submission

### AI assistant
- Context-aware disaster Q&A through the `resqai-chat` edge function
- Streaming markdown responses, voice input (Web Speech API), and contextual quick replies
- Requires an authenticated Supabase session; the edge function rejects anonymous callers
- Chat history persisted per user

### Real-time data feeds
- USGS earthquake events
- NASA EONET natural events (wildfires, floods, storms)
- Open-Meteo city weather (temperature, humidity, wind, pressure, cloud cover)
- NASA FIRMS active-fire hotspots (requires `VITE_NASA_FIRMS_API_KEY`)

### Shelters, resources, and response operations
- Cyclone shelter directory with capacity, occupancy, and utilization status
- Turn-by-turn routing to the nearest shelter
- Resource inventory, incident log, and damage assessment pages
- Training dashboard for preparedness programmes
- Evacuation planner and post-disaster assessment workflows

### Alerts and offline behaviour
- Auto-cycling alert banner with severity colors and optional Web Audio tones
- Service worker precaches the application shell, assets, and map-adjacent static files
- Runtime caching for weather, USGS, NASA, CARTO tiles, and Google Fonts
- Offline prediction engine caches the latest grid in `localStorage` and reports cached state when the network drops
- Connectivity indicator and mesh-alert banner for degraded-network messaging

### Platform
- Email/password authentication with `citizen`, `responder`, and `admin` roles
- Protected admin routes
- Multi-language UI via `i18next` (English, Hindi, Odia)
- Dark command-center visual design with glassmorphism panels and Framer Motion transitions

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Client (PWA)                      │
│  React 18 · TypeScript · Vite 7 · Tailwind CSS 3         │
│  Leaflet · Recharts · Framer Motion · shadcn/ui (Radix)  │
│  TanStack Query · React Router 7 · i18next               │
└───────────────────────────┬──────────────────────────────┘
                            │  HTTPS / WebSocket
┌───────────────────────────▼──────────────────────────────┐
│                        Supabase                          │
│  PostgreSQL · Row Level Security · Auth · Realtime       │
│  Edge Functions (Deno)                                   │
│    predict-risk     risk scoring + explainability        │
│    resqai-chat      authenticated AI assistant           │
│    fetch-disasters  external feed aggregation            │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                    External data sources                 │
│  USGS · NASA EONET · NASA FIRMS · Open-Meteo             │
│  OSRM · CARTO basemaps · Optional ML_MODEL_URL           │
└──────────────────────────────────────────────────────────┘
```

### Prediction data flow

```
Satellite + weather + station + crowd reports
    ↓
Feature assembly (recency and reliability weighted)
    ↓
predict-risk edge function (heuristics, or ML_MODEL_URL when configured)
    ↓
Community validation and trust scoring
    ↓
Prediction + confidence + explanation + community agreement
    ↓
Tiered alerts → VERIFIED_CRITICAL > AI_PREDICTED > MONITORING > LOW_WATCH
```

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 7.3 | Build tool and dev server |
| Tailwind CSS | 3.4 | Styling and design tokens |
| shadcn/ui + Radix UI | current | Accessible component primitives |
| TanStack Query | 5.83 | Server state, caching, background refetch |
| React Router | 7.18 | Client-side routing |
| Leaflet / leaflet-routing-machine | 1.9 / 3.2 | Map rendering and routing |
| Recharts | 2.15 | Charts |
| Framer Motion | 12.34 | Animation |
| i18next / react-i18next | 25.8 / 16.5 | Internationalization (EN/HI/OR) |
| react-markdown | 10.1 | Markdown rendering in chat |
| Sonner | 1.7 | Toast notifications |
| vite-plugin-pwa | 1.2 | Service worker, manifest, offline caching |
| Vitest + Testing Library | 5.1 / 16 | Unit tests |

### Backend

| Technology | Purpose |
|---|---|
| Supabase PostgreSQL | Primary data store |
| Row Level Security | Per-table, per-role access control |
| Supabase Auth | Email/password authentication and roles |
| Supabase Realtime | Live shelter, report, and alert updates |
| Supabase Edge Functions (Deno) | Prediction, AI chat, external feed aggregation |

### Edge functions

| Function | Purpose |
|---|---|
| `predict-risk` | Accepts the prediction grid, returns risk scores, confidence, and explainability. Uses `ML_MODEL_URL` when configured, otherwise heuristics |
| `resqai-chat` | Authenticated AI assistant; verifies the caller's Supabase access token before spending AI credits |
| `fetch-disasters` | Aggregates USGS, NASA EONET, and weather data |

### Data model

| Table | Description |
|---|---|
| `reports` | Community disaster reports with trust scores and vote counts |
| `report_validations` | Individual confirm/deny votes on reports |
| `shelters` | Shelter location, capacity, and occupancy |
| `alerts` | Broadcast alerts with severity, type, region, and coordinates |
| `risk_predictions` | Stored predictions with community validation counts |
| `chat_history` | Per-user AI conversation history |
| `profiles` | User profile, location, language, emergency contact |
| `user_roles` | Role assignments (`citizen`, `responder`, `admin`) |
| `resources` | Response resource inventory |
| `incidents`, `incident_logs` | Incident tracking and audit trail |
| `damage_assessments` | Post-disaster damage records |
| `flood_stations`, `ocean_stations`, `landslide_zones` | Environmental monitoring reference data |
| `institutions`, `trainings`, `training_themes` | Preparedness and training data |
| `evac_notifications` | Evacuation notification records |

---

## Project Structure

```
resq-ai-assistant/
├── src/
│   ├── components/                 # Map, panels, forms, alerts, shadcn/ui
│   ├── contexts/AuthContext.tsx    # Session and role state
│   ├── data/                       # Odisha map data and disaster metadata
│   ├── hooks/                      # Disaster data, predictions, trainings
│   ├── i18n/locales/               # en.json, hi.json, or.json
│   ├── integrations/supabase/      # Supabase client
│   ├── lib/                        # Map and utility helpers
│   ├── pages/                      # Route-level screens
│   ├── test/                       # Vitest setup and tests
│   ├── App.tsx                     # Router and providers
│   └── index.css                   # Design tokens and animations
├── public/                         # Static assets, robots.txt, icons
├── supabase/
│   ├── functions/                  # predict-risk, resqai-chat, fetch-disasters
│   └── migrations/                 # Database schema history
├── eslint.config.js
├── tailwind.config.ts
├── vite.config.ts
└── vitest.config.ts
```

### Routes

| Path | Screen |
|---|---|
| `/` | Landing page |
| `/dashboard` | Operational dashboard and map |
| `/forecast` | Forecast center |
| `/control-room` | Coordination view |
| `/evacuate` | Evacuation planner |
| `/resources` | Resource inventory |
| `/training` | Training dashboard |
| `/post-disaster` | Post-disaster assessment |
| `/admin` | Admin and validation panel |
| `/auth` | Sign in / sign up |

---

## Getting Started

### Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 7)
- npm 10+
- A Supabase project (or the Supabase CLI for local development)

### 1. Install dependencies

```bash
git clone https://github.com/Manas-Dikshit/resq-ai-assistant.git
cd resq-ai-assistant
npm install
```

### 2. Configure the client environment

```bash
cp .env.example .env
```

Fill in the values described in [Configuration](#configuration). The project ships with a working Supabase URL and publishable (anon) key for the development project; replace them with your own for a separate deployment.

### 3. Run the development server

```bash
npm run dev
```

The app is served at `http://localhost:8080`.

### 4. Build and preview

```bash
npm run build     # production bundle in dist/
npm run preview   # serve the production build locally
```

> After a production build, confirm the service worker precache is populated. A healthy build reports **11+ entries / ~2.6 MB**, not `0.00 KiB`. If the precache is empty, offline navigation will fail even though the build exits successfully.

### Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 8080 |
| `npm run build` | Production build and service-worker generation |
| `npm run build:dev` | Development-mode build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint over the repository |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

### Quality gates

```bash
npm run lint      # 0 errors (typing warnings are tracked)
npx tsc --noEmit -p tsconfig.app.json
npm test
npm run build
```

---

## Configuration

### Client variables (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase publishable/anon key (safe for the browser; protected by RLS) |
| `VITE_NASA_FIRMS_API_KEY` | Optional | Active-fire hotspots from NASA FIRMS. Without it, fire overlays are disabled |
| `VITE_CARTO_API_KEY` | Optional | CARTO basemap key. A public fallback key is used when unset |

### Server-side secrets

Edge functions read secrets from the Supabase project, never from the client bundle.

```bash
supabase secrets set LOVABLE_API_KEY=your_key_here
supabase secrets set ML_MODEL_URL=https://your-model-endpoint/predict   # optional
```

| Secret | Required | Purpose |
|---|---|---|
| `LOVABLE_API_KEY` | Yes (for AI chat) | AI gateway credentials used by `resqai-chat` |
| `ML_MODEL_URL` | Optional | External model endpoint used by `predict-risk`; heuristics are used when unset |
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | Auto-injected | Provided to edge functions by the Supabase runtime |

> Never commit real credentials. The API key in `.env.example` is intentionally a placeholder.

### Deploying edge functions

```bash
supabase functions deploy predict-risk
supabase functions deploy resqai-chat
supabase functions deploy fetch-disasters
```

`resqai-chat` verifies the caller's access token against Supabase Auth and returns `401` for anonymous requests. The client must send `Authorization: Bearer <session.access_token>`.

### Database

Apply the schema from `supabase/migrations` with the Supabase CLI:

```bash
supabase db push
```

All tables use Row Level Security. Admin-only operations are enforced by role checks in RLS policies, not by the UI alone.

---

## Security and Privacy

- **RLS everywhere** — access is enforced at the database layer.
- **Authenticated AI** — `resqai-chat` rejects unauthenticated callers before calling the model.
- **Server-side secrets** — model and AI credentials live only in Supabase secrets.
- **No secret in the bundle** — only `VITE_*` values are exposed, and those are publishable by design.
- **Community data** — reports are attributed to authenticated accounts and validated by consensus; personal contact data is stored only on the user's own profile.

If you deploy this project, rotate any credential that has ever been committed to the repository and use a fresh Supabase project for production.

---

## Current Limitations

ResQAI is under active development. Known constraints:

- **Mesh networking is a prototype.** The mesh banner uses `BroadcastChannel` and simulated peer counts; real WebRTC/BLE relay is not implemented yet.
- **Offline predictions are cached, not computed.** The offline engine serves the last synced grid and a lightweight heuristic view; on-device model inference (ONNX.js) is on the roadmap.
- **The bundle is not code-split.** The main JavaScript chunk is large; route-level lazy loading is planned.
- **Heuristics are not a trained model.** `predict-risk` produces structured, explainable estimates. Accuracy tracking against historical events is planned before any operational use.
- **Single-region focus.** Grid points and reference data target Odisha.

ResQAI is a decision-support tool. It does not replace official warnings from IMD, NDMA, or state authorities.

---

## Roadmap

### Phase 1 — Foundation (complete)
- [x] Interactive map with real-time overlays
- [x] 15-point prediction grid with six risk types
- [x] Community reporting and validation
- [x] AI assistant with voice input
- [x] English, Hindi, and Odia UI
- [x] Shelter finder with routing
- [x] Authentication and role-based access
- [x] Admin dashboard
- [x] Offline caching and prediction cache
- [x] Explainability output
- [x] Alert audio notifications

### Phase 2 — Intelligence (in progress)
- [ ] Multi-model ensemble (gradient boosting + sequence + spatial models)
- [ ] Satellite imagery integration (Sentinel Hub / NASA FIRMS)
- [ ] Historical prediction accuracy tracking
- [ ] Automated calibration from community feedback

### Phase 3 — Scale (planned)
- [ ] WebRTC/BLE mesh relay for peer-to-peer alerts
- [ ] On-device inference with ONNX.js
- [ ] Federated learning from community corrections
- [ ] Multi-region expansion
- [ ] SMS/WhatsApp alert gateway
- [ ] Integration with IMD, CWC, and NDMA feeds

---

## Contributing

Contributions are welcome, particularly from people with lived experience in disaster-prone regions.

- **Bug reports and feature requests** — open an issue with reproduction steps
- **Translations** — improve `src/i18n/locales/*.json`
- **Models** — provide an endpoint compatible with the `ML_MODEL_URL` interface
- **Regional data** — district-level shelter, station, and hazard data
- **Validation data** — historical disaster records for calibration

Before opening a pull request:

```bash
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npm test
npm run build
```

Keep changes consistent with the existing component, hook, and styling patterns. Do not commit credentials or `.env` files.

---

## License

Released under the [MIT License](LICENSE). Free to use, modify, and distribute.

---

<div align="center">

**Built with care for the people of Odisha**

*"The goal of ResQAI is not to replace human judgment — it's to make sure human judgment has the best possible information, even when everything else is failing."*

</div>
