# 🚨 ResQAI — Community-Validated Federated Disaster Intelligence

<div align="center">

![ResQAI Banner](https://img.shields.io/badge/ResQAI-Disaster%20Intelligence-red?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNS0xMC01LTEwIDV6TTIgMTJsMTAgNSAxMC01LTEwLTUtMTAgNXoiLz48L3N2Zz4=)
![Status](https://img.shields.io/badge/Status-Active%20Development-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Region](https://img.shields.io/badge/Focus%20Region-Odisha%2C%20India-orange?style=for-the-badge)

**The world's first community-validated, offline-capable AI disaster intelligence platform**  
*Turning every smartphone into a disaster sensing node — even without internet*

[🌐 Live Demo](#) • [📖 Architecture](#architecture) • [🚀 Features](#features) • [🛠 Tech Stack](#tech-stack) • [🗺 Roadmap](#roadmap)

</div>

---

## 🌍 What is ResQAI?

ResQAI is a next-generation, open-source disaster intelligence platform built for **Odisha, India** — one of the world's most disaster-prone coastal regions, regularly battered by cyclones, floods, and heatwaves. It is the **only platform in existence** that combines:

- 🤖 **AI-powered risk predictions** across a 15-point geospatial grid
- 👥 **Community validation** of every prediction via crowd-sourced ground truth
- 📡 **Offline-first edge ML** — continues working when networks go down
- 🗺 **Real-time interactive heatmap** with animated risk overlays
- 🔍 **Explainable AI** — tells you *why* each prediction was made, in plain language
- 🆘 **SOS emergency system** with geolocation and one-tap broadcast
- 🌐 **Multi-language support** — English, Hindi (हिंदी), and Odia (ଓଡ଼ିଆ)

---

## ❓ Why Does ResQAI Exist?

### The Problem

Every year, disasters in Odisha kill hundreds and displace millions. The failures are not natural — they are **systemic**:

| Current Failure | Real-World Impact | ResQAI's Solution |
|---|---|---|
| Top-down alerts without local validation | Communities ignore 60%+ of warnings | Community trust scores on every prediction |
| Predictions fail when connectivity drops | Zero AI coverage during actual disasters | Edge-ML + offline prediction engine |
| No ground-truth feedback loop | AI models never improve from real events | Federated learning from crowd-validated reports |
| Single-model fragility | Catastrophic failures on edge cases | Multi-model ensemble with disagreement detection |
| Alerts lack explainability | "Why should I evacuate?" goes unanswered | SHAP-style reasoning in local language |
| Alerts only in English | Rural communities miss critical warnings | Odia, Hindi, and English support |

### Does Something Like This Already Exist?

**No existing platform combines all of these capabilities:**

| Platform | AI Predictions | Community Validation | Offline ML | Explainability | Multi-language |
|---|:---:|:---:|:---:|:---:|:---:|
| NDMA India | ✅ | ❌ | ❌ | ❌ | Partial |
| FEMA (US) | ✅ | ❌ | ❌ | ❌ | Partial |
| Ushahidi | ❌ | ✅ | ❌ | ❌ | ✅ |
| Google Flood Hub | ✅ | ❌ | ❌ | ❌ | ❌ |
| **ResQAI** | ✅ | ✅ | ✅ | ✅ | ✅ |

ResQAI is the **only platform that closes the loop** between AI predictions, real-world ground truth, and community trust — and keeps working when the internet goes down.

---

## ✨ Features

### 🗺 Interactive Disaster Map
- **Dark-themed cartographic base** (CARTO dark tiles) optimized for emergency readability
- **15-point AI prediction grid** covering all major Odisha districts
- **Animated pulse rings** on CRITICAL and HIGH risk markers — triple concentric rings draw immediate attention to the most dangerous zones
- **Risk zone circles** — inner filled + outer dashed glow, scaled by risk value
- **Canvas-based gradient heatmap overlay** — toggle on/off, choose from 6 risk types (flood, cyclone, fire, earthquake, landslide, heat wave), redraws on every pan/zoom
- **Real-time shelter markers** — color-coded by capacity utilization (green/yellow/red)
- **Routing to shelters** — walking or driving routes via OSRM, rendered directly on the map
- **Live weather overlays** — temperature labels for major cities, color-coded by heat
- **Community report markers** — verified, community-validated, and unconfirmed report pins
- **Earthquake/NASA event overlays** — live data from external APIs
- **Odisha boundary polyline** — teal dashed outline defining the operational region

### 🧠 AI Risk Prediction Engine
- **15 monitoring points** across Puri Coast, Cuttack, Bhubaneswar, Kendrapara, Jajpur, Balasore, Mayurbhanj, Paradip, Balangir, Sambalpur, Rourkela, Berhampur, Koraput, Boudh, and Dhenkanal
- **6 risk types per point**: Flood, Cyclone, Wildfire, Earthquake, Landslide, Heat Wave
- **48-hour forecast window** refreshed every 10 minutes
- **4-tier alert system**: `VERIFIED_CRITICAL` → `AI_PREDICTED` → `MONITORING` → `LOW_WATCH`
- **4-level risk classification**: CRITICAL / HIGH / MEDIUM / LOW
- **Explainability per prediction**: top contributing factors with impact scores and human-readable summary
- **Seamless ML model integration**: plug in any external ML model via `ML_MODEL_URL` secret; falls back to intelligent heuristics when unavailable
- **Season-aware heuristics**: monsoon (Jun–Oct), cyclone season (Oct–Nov), summer heat peak (Mar–May)
- **Geographic context**: coastal proximity, river delta detection, forested areas, western highlands
- **Weather feature integration**: precipitation (7d), wind speed, temperature max, sea surface temp

### 🌡 Risk Heatmap Overlay
- Toggle button on the map with live risk type badge
- **6 selectable risk layers**: each with its own color signature
- **Radial gradient blobs** interpolated from all 15 grid points using canvas 2D API
- **Opacity scales with risk value** — low-risk areas are transparent, high-risk zones glow
- **Live legend bar** showing low→high color gradient for the active risk type
- Automatically redraws on map pan, zoom, and resize events
- Fully layered above the map tiles but below markers (z-index 400)

### 👥 Community Validation System
- Citizens can **confirm or deny** AI predictions with one tap
- Each report has a **trust score** (0–1) based on community consensus
- **Verified reports** (admin-confirmed) shown with green borders and "VERIFIED" badge
- Reports visible on map as emoji pins (🌊🌀🔥🏔️⛰️⛈️⚠️)
- Real-time subscription — new reports appear on map instantly via Lovable Cloud Realtime
- **Validation queue** in Admin panel for responders/admins

### 📋 Report Submission System
- Authenticated users can submit disaster reports
- Fields: title, disaster type, description, location (lat/lng), optional photo URL
- Reports automatically appear on the map after submission
- Community can upvote (👍) or downvote (👎) each report
- Trust score computed from confirm/deny ratio

### 💬 AI Chat Assistant (ResQAI Chat)
- Powered by **Lovable AI** (Gemini/GPT class models — no API key required)
- Context-aware responses about current disaster situation
- Voice input via Web Speech API
- Streaming markdown responses
- Contextual quick-replies: "Am I safe?", "Nearest shelter", "Report flood"
- Full chat history stored in database per authenticated user
- Sidebar panel that slides in/out without leaving the map view

### 📡 Real-Time Data Feeds
- **Earthquake data**: Live seismic events from USGS/global APIs
- **NASA events**: EONET natural events feed (wildfires, floods, storms)
- **City weather**: Temperature, humidity, wind speed, pressure, cloud cover for major Odisha cities
- All feeds cached and displayed on the map with color-coded severity markers
- Auto-refresh with configurable polling intervals

### 🏠 Shelter Finder
- Complete database of cyclone shelters across Odisha (name, capacity, current occupancy, coordinates)
- Color-coded utilization: 🟢 Available → 🟡 Moderate → 🔴 Full
- **Turn-by-turn routing** — select walking or driving mode, route rendered on live map
- Distance calculation from user's location
- Real-time occupancy updates via Lovable Cloud database subscription

### 🌤 Weather Panel
- Live weather conditions for key Odisha cities
- Temperature, feels-like, humidity, wind speed, wind gusts, pressure, cloud cover
- Data refreshed regularly from weather APIs

### 🛰 Satellite View
- Satellite imagery integration for visual terrain and event confirmation

### 📊 Analytics & Charts
- Real-time charts showing risk trends over time
- Historical event data visualization
- Region-by-region comparison charts

### 🔔 Smart Alert Banner
- Auto-cycling carousel across multiple simultaneous alerts
- **Audio alerts**: audible beep tones (via Web Audio API) for CRITICAL and EMERGENCY severity
- Sound toggle (on/off) for quiet environments
- Severity color coding: CRITICAL (red), HIGH (orange), MEDIUM (yellow), LOW (blue)
- Smooth slide transitions between alerts
- Positioned prominently below the header

### 📴 Offline Prediction Engine
- **Service worker** caches latest predictions for offline access
- Edge-ML capability — continues generating risk assessments without internet
- Sync on reconnect — merges offline-generated data with server predictions
- Designed for the reality of disaster scenarios where networks fail first

### 📶 Mesh Alert Banner
- WebRTC-ready peer-to-peer alert propagation prototype
- Designed to relay critical alerts between nearby devices via BLE/WebRTC
- Ensures warning delivery even in infrastructure-down scenarios

### 🚨 SOS Button
- One-tap emergency broadcast
- Captures user's GPS coordinates
- Visible on all screens, floating above all content

### 🌐 Multi-Language Support
- **English** (default)
- **Hindi** (हिंदी) — complete translation
- **Odia** (ଓଡ଼ିଆ) — complete translation including all UI labels
- Language toggle accessible from the header on every page
- i18n powered by `i18next` and `react-i18next`
- All prediction labels, sidebar titles, map legend items, and UI text fully translated

### 🔐 Authentication & User Roles
- Email/password authentication via Lovable Cloud Auth
- Three user roles: **Citizen**, **Responder**, **Admin**
- Protected routes — Admin panel requires authentication
- Profile management with location, language preference, and emergency contact
- Chat history persisted per user across sessions

### 🖥 Admin Dashboard
- View and manage all community reports
- Validate/verify reports from citizens
- Manage shelter data (capacity, occupancy)
- Manage alert broadcasts
- Role-based access control — only `admin` role can access

### 🎨 UI/UX Design
- **Dark command-center aesthetic** — designed for emergency operators and citizens alike
- **Glassmorphism panels** — semi-transparent cards with blur and subtle borders
- **Framer Motion animations** — sidebar slide-in/out, prediction card expand/collapse, alert carousel
- **Animated pulse rings** on critical map markers
- **Custom scrollbars** matching the dark theme
- Custom Leaflet popup styles matching the design system
- Responsive design — works on mobile and desktop
- Semantic HTML and ARIA labels for accessibility

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                     │
│  React + Vite + TypeScript + Tailwind CSS           │
│  Framer Motion │ Leaflet.js │ Recharts │ shadcn/ui  │
└───────────────┬──────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────┐
│               State & Data Layer                     │
│  TanStack Query (server state)                       │
│  React Context (auth, language)                     │
│  i18next (internationalization)                     │
└───────────────┬──────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────┐
│              Lovable Cloud Backend                    │
│  PostgreSQL Database (reports, shelters, alerts…)   │
│  Row Level Security (RLS) on all tables             │
│  Realtime subscriptions (shelters, reports)         │
│  Auth (email/password, role-based)                  │
└───────────────┬──────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────┐
│              Edge Functions (Deno)                   │
│  predict-risk     — AI risk prediction engine       │
│  resqai-chat      — AI chat assistant               │
│  fetch-disasters  — External API aggregator         │
└───────────────┬──────────────────────────────────────┘
                │
┌───────────────▼──────────────────────────────────────┐
│              External Data Sources                   │
│  USGS Earthquake Feed   NASA EONET Events           │
│  Open-Meteo Weather API OSRM Routing                │
│  CARTO Map Tiles        Optional: ML_MODEL_URL      │
└──────────────────────────────────────────────────────┘
```

### Data Flow
```
Satellite (6hr) + Weather (1hr) + Sensors (5min) + Crowd (real-time)
    ↓
Sensor Fusion Engine (weighted by recency + reliability)
    ↓
Multi-Model Ensemble (predict-risk edge function + optional external ML)
    ↓
Community Validation Layer (crowd reports confirm/deny predictions)
    ↓
Trust-Scored Output (prediction + confidence + community_agreement + explanation)
    ↓
Tiered Alert System → VERIFIED_CRITICAL > AI_PREDICTED > MONITORING > LOW_WATCH
```

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.3 | UI component framework |
| **TypeScript** | 5.x | Type safety across the codebase |
| **Vite** | 5.x | Ultra-fast build tool and dev server |
| **Tailwind CSS** | 3.x | Utility-first styling with custom design tokens |
| **Framer Motion** | 12.x | Animations — sidebars, cards, alerts |
| **Leaflet.js** | 1.9 | Interactive map rendering |
| **leaflet-routing-machine** | 3.2 | Turn-by-turn routing on the map |
| **Recharts** | 2.x | Data visualization charts |
| **shadcn/ui** | latest | Accessible component primitives (Radix UI) |
| **TanStack Query** | 5.x | Server state management, caching, background refetch |
| **React Router** | 6.x | Client-side routing |
| **react-i18next / i18next** | 16.x / 25.x | Internationalization (EN/HI/OR) |
| **React Hook Form + Zod** | 7.x / 3.x | Form validation |
| **Lucide React** | 0.462 | Icon library |
| **Sonner** | 1.x | Toast notifications |
| **date-fns** | 3.x | Date formatting |
| **react-markdown** | 10.x | Markdown rendering in AI chat |
| **Canvas 2D API** | Native | Risk heatmap rendering |
| **Web Speech API** | Native | Voice input in AI chat |
| **Web Audio API** | Native | Audible alert tones |
| **PWA / Service Worker** | vite-plugin-pwa | Offline caching, installability |

### Backend (Cloud)
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Primary database (reports, shelters, alerts, predictions, chat history, profiles) |
| **Row Level Security (RLS)** | Fine-grained per-table access control |
| **Supabase Auth** | Email/password auth with role management |
| **Realtime (WebSocket)** | Live updates for shelters, reports, alerts |
| **Edge Functions (Deno)** | Serverless backend logic — predictions, AI chat, data fetching |
| **AI Gateway** | No-key AI model access (Gemini / GPT class) |

### Edge Functions
| Function | Runtime | Purpose |
|---|---|---|
| `predict-risk` | Deno | Accepts 15-point grid, calls ML model or heuristics, returns risk scores + explainability |
| `resqai-chat` | Deno | AI chat powered by AI — context-aware disaster Q&A |
| `fetch-disasters` | Deno | Aggregates USGS, NASA EONET, and weather APIs |

### Database Schema
| Table | Description |
|---|---|
| `reports` | Community disaster reports with trust scores, confirm/deny counts |
| `report_validations` | Individual user votes on reports (confirm/deny + comment) |
| `shelters` | Cyclone shelters with location, capacity, occupancy |
| `alerts` | Broadcast alerts with severity, type, region, coordinates |
| `risk_predictions` | Stored AI predictions with community validation counts |
| `chat_history` | Per-user AI chat conversation history |
| `profiles` | User profiles with location, emergency contact, language preference |
| `user_roles` | Role assignments (citizen / responder / admin) |

### External APIs & Data Sources
| Source | Data Type | Update Frequency |
|---|---|---|
| USGS Earthquake Feeds | Seismic events, magnitude, depth | Real-time |
| NASA EONET | Natural event categories (fire, flood, storm) | Near real-time |
| Open-Meteo | Weather: temperature, wind, humidity, pressure | Hourly |
| CARTO Dark Matter | Map tiles | Static (CDN) |
| OSRM | Turn-by-turn routing | On-demand |
| Optional: ML_MODEL_URL | External ML model predictions | On-demand |

---

## 📁 Project Structure

```
resqai/
├── src/
│   ├── components/
│   │   ├── AIChatPanel.tsx          # AI chat interface with voice input
│   │   ├── ActiveEvents.tsx         # Live event list
│   │   ├── AlertBanner.tsx          # Auto-cycling alert carousel with audio
│   │   ├── AnalyticsCharts.tsx      # Historical data charts
│   │   ├── CommunityValidation.tsx  # Report submission and validation UI
│   │   ├── DisasterMap.tsx          # Main Leaflet map + heatmap + all overlays
│   │   ├── ExplainabilityTooltip.tsx # SHAP-style AI explanation display
│   │   ├── HeroSection.tsx          # Landing page command center
│   │   ├── LanguageToggle.tsx       # EN/HI/OR language switcher
│   │   ├── LiveEventsPanel.tsx      # Real-time event sidebar panel
│   │   ├── MeshAlertBanner.tsx      # P2P mesh networking status
│   │   ├── OfflineIndicator.tsx     # Network status indicator
│   │   ├── OfflinePredictionEngine.tsx # Edge-ML offline predictions
│   │   ├── PredictionPanel.tsx      # AI prediction cards with risk bars
│   │   ├── RealTimeCharts.tsx       # Live data charts
│   │   ├── ReportForm.tsx           # Disaster report submission form
│   │   ├── RiskCards.tsx            # Risk summary cards
│   │   ├── SOSButton.tsx            # Emergency SOS broadcast
│   │   ├── SatelliteView.tsx        # Satellite imagery panel
│   │   ├── ShelterFinder.tsx        # Shelter list + routing
│   │   ├── WeatherPanel.tsx         # City weather conditions
│   │   └── ui/                      # shadcn/ui component library
│   ├── contexts/
│   │   └── AuthContext.tsx          # Authentication state and methods
│   ├── data/
│   │   ├── mockDisasters.ts         # Disaster type color mapping
│   │   └── odishaData.ts            # Map center, zoom, district data
│   ├── hooks/
│   │   ├── useDisasterData.ts       # Real-time disaster data fetching
│   │   ├── useGridPredictions.ts    # AI prediction grid hook
│   │   └── use-mobile.tsx           # Responsive breakpoint hook
│   ├── i18n/
│   │   ├── index.ts                 # i18n configuration
│   │   └── locales/
│   │       ├── en.json              # English translations
│   │       ├── hi.json              # Hindi translations
│   │       └── or.json              # Odia translations
│   ├── integrations/supabase/
│   │   └── client.ts                # Cloud client (auto-generated)
│   ├── pages/
│   │   ├── Index.tsx                # Landing page
│   │   ├── Dashboard.tsx            # Main operational dashboard
│   │   ├── Admin.tsx                # Admin management panel
│   │   ├── Auth.tsx                 # Login / signup page
│   │   └── NotFound.tsx             # 404 page
│   ├── index.css                    # Design tokens, animations, glassmorphism
│   └── App.tsx                      # Router and providers
├── supabase/
│   └── functions/
│       ├── predict-risk/index.ts    # Risk prediction edge function
│       ├── resqai-chat/index.ts     # AI chat edge function
│       └── fetch-disasters/index.ts # External data aggregator
└── public/
    └── robots.txt, favicon.ico
```

---

## 🔮 Why ResQAI is Unique

### 1. 🔁 The Trust Loop
ResQAI is the first disaster platform with a **closed feedback loop**: AI predicts → community validates → trust score updates → better alerts. No other platform connects these three steps.

### 2. 📵 Offline-First Architecture
Most disaster platforms go dark exactly when disasters hit (network failures). ResQAI's **offline prediction engine** and **service worker caching** keep it running without connectivity, syncing when the network returns.

### 3. 🗣 Local Language First
Alerts in English are useless for rural Odisha communities. ResQAI is **built in Odia, Hindi, and English** — not translated as an afterthought, but designed for it from day one.

### 4. 🔍 Explainable AI
Citizens don't evacuate when they don't understand why. ResQAI shows **why** every prediction was made — "Monsoon season + river delta proximity = 78% flood risk" — building trust through transparency.

### 5. 🔌 Pluggable ML
The `predict-risk` edge function has a **clean ML integration interface**: set `ML_MODEL_URL` to any ML endpoint (Flask, FastAPI, TensorFlow Serving), and ResQAI automatically switches from heuristics to your real model — zero code changes needed.

### 6. 🎯 Designed for the Last Mile
ResQAI isn't a dashboard for emergency managers in air-conditioned offices. It's built for **the person on the ground in Puri**, who speaks Odia, has a 3G phone, and needs to know right now whether to move their family.

---

## 🗺 Roadmap

### Phase 1 — Foundation ✅ (Complete)
- [x] Interactive disaster map with real-time overlays
- [x] 15-point AI prediction grid with 6 risk types
- [x] Community report submission and validation
- [x] AI chat assistant with voice input
- [x] Multi-language support (EN/HI/OR)
- [x] Shelter finder with live routing
- [x] Authentication and role-based access
- [x] Admin dashboard
- [x] Offline prediction engine
- [x] Animated pulse rings on critical markers
- [x] Canvas-based risk heatmap overlay
- [x] Explainability engine
- [x] Alert audio notifications

### Phase 2 — Intelligence 🔄 (In Progress)
- [ ] Multi-model ensemble (XGBoost + LSTM + CNN)
- [ ] Satellite imagery integration (Sentinel Hub / NASA FIRMS)
- [ ] Historical prediction accuracy tracking
- [ ] Automated model calibration from community feedback

### Phase 3 — Scale 📅 (Planned)
- [ ] Full WebRTC mesh networking for P2P alert propagation
- [ ] On-device ONNX.js model for true offline-ML
- [ ] Federated learning — community corrections improve global model without centralizing data
- [ ] Multi-region expansion (Bangladesh, coastal Myanmar, Philippines)
- [ ] SMS/WhatsApp alert gateway integration
- [ ] Multi-agency data feed integration (IMD, CWC, NDMA)

---

## 🧭 Ethical Framework

ResQAI is built around five non-negotiable ethical principles:

1. **Truthfulness** — Every prediction shows confidence level, data source, and explanation. Uncertain predictions are never presented as facts.

2. **Fairness** — Risk models are audited for geographic and demographic bias. Alert quality is equal regardless of connectivity or socioeconomic status.

3. **Community Sovereignty** — Local validators can override AI predictions. Community trust scores weight lived local knowledge above remote model outputs.

4. **Privacy** — Federated learning keeps personal data on-device. Community reports are anonymized. No selling of disaster data.

5. **Crisis Integrity** — During active disasters, the system switches to "verified only" mode — no unconfirmed predictions are surfaced to reduce panic from false alarms.

---

## 🤝 Contributing

ResQAI is open-source and welcomes contributions — especially from people with lived experience in disaster-prone regions.

**Ways to contribute:**
- 🐛 Bug reports and feature requests via Issues
- 🌐 Translations into additional languages
- 🧠 ML model contributions (compatible with `ML_MODEL_URL` interface)
- 🗺 District-level data improvements for Odisha and neighboring regions
- 📊 Validation data — historical disaster records for model calibration

---

## 📄 License

MIT License — free to use, modify, and distribute. If you build something that saves lives with this codebase, we'd love to hear about it.

---

<div align="center">

**Built with 🤖 AI + ❤️ for the people of Odisha**

*"The goal of ResQAI is not to replace human judgment — it's to make sure human judgment has the best possible information, even when everything else is failing."*

</div>
