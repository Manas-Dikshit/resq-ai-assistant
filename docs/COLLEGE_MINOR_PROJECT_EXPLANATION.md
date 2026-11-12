# ResQAI: Community-Validated Disaster Intelligence & Emergency Response Platform
## College Minor Project — Comprehensive Viva & Presentation Guide

---

## 1. Quick Project Summary (Elevator Pitch for Sir)

> **"ResQAI is an offline-first, community-validated disaster intelligence and emergency response platform tailored for high-risk disaster zones like Odisha, India.**  
> Unlike traditional one-way warning systems that fail during network outages or deliver false alarms, ResQAI combines **real-time satellite/weather feeds (NASA, USGS, Open-Meteo)**, **predictive geospatial risk modeling with Explainable AI (XAI)**, a **crowdsourced community validation loop (trust scoring)**, and **offline-first PWA architecture** to ensure life-saving advisories, shelter routing, and emergency assistance reach the last mile in **English, Hindi, and Odia**."

### The Core Feedback Loop
$$\text{AI Predicts Risk} \longrightarrow \text{Community Validates Ground Truth} \longrightarrow \text{Trust Score Updates} \longrightarrow \text{Calibrated Tiered Alerts}$$

---

## 2. Problem Statement & Motivation

### The Real-World Problem
1. **High Vulnerability of Coastal Regions:** Coastal belts like Odisha face recurring cyclones (e.g., Fani, Amphan, Dana), severe flooding in deltaic plains, heatwaves, and landslides.
2. **The "Last-Mile" Communication Blackout:** When cellular towers and fiber backhauls snap during extreme weather, conventional online-only portals become inaccessible.
3. **Information Asymmetry & False Alarms:** Official sensors are sparse; rumors and unverified social media warnings trigger panic, while genuine localized flash floods go unaddressed.
4. **Lack of Explainability & Language Barriers:** Villagers and field workers often ignore abstract alerts because they are not translated into regional vernaculars (Odia/Hindi) or lack clear explanatory factors.
5. **Disconnected Resource Logistics:** Field responders lack real-time visibility into shelter capacities, consumable stocks, and safe turn-by-turn evacuation pathways.

### The Solution Proposed by ResQAI
- **Decentralized Ground-Truth Validation:** Citizens act as distributed human sensors, confirming or refuting AI predictions with a consensus trust score.
- **Offline-First Resilience:** Progressive Web App (PWA) with Service Worker precaching and browser `localStorage` fallback to maintain operational readiness without internet.
- **Explainable AI (XAI):** Alerts display contributing variables (e.g., 7-day rainfall $> 180\text{ mm}$, wind gust $> 85\text{ km/h}$, coastal proximity).
- **Multilingual Inclusivity:** Tri-lingual support (English, Hindi, Odia) powered by `i18next` and language-enforced edge LLM prompts.

---

## 3. Project Objectives & Scope

| Objective | Implementation in ResQAI |
|---|---|
| **Multi-Hazard Geospatial Monitoring** | Interactive Leaflet map with 15 critical regional grid points and 6 risk heatmaps (Cyclone, Flood, Fire, Earthquake, Landslide, Heatwave). |
| **Early Warning & Explainable Risk** | 4-tier alert system (`VERIFIED_CRITICAL` $\to$ `AI_PREDICTED` $\to$ `MONITORING` $\to$ `LOW_WATCH`) with impact factor breakdowns. |
| **Crowdsourced Validation** | Real-time confirm/deny voting mechanism that computes a dynamic trust score ($0.0$ to $1.0$). |
| **Interactive Emergency AI Assistant** | Voice-enabled, context-aware conversational agent for disaster safety protocols, first-aid, and evacuation assistance. |
| **Shelter Logistics & Evacuation Routing** | Live shelter occupancy tracking and OSRM turn-by-turn routing to the nearest active cyclone shelter. |
| **Incident Logging & Resource Management** | Role-based portal for emergency response personnel (NDRF/ODRAF/Admin) to coordinate supplies, incidents, and damage assessments. |

---

## 4. Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CLIENT LAYER (PWA)                              │
│  • React 18 (TypeScript) + Vite 7                                           │
│  • UI Primitives: shadcn/ui + Radix UI + Tailwind CSS 3                     │
│  • Geospatial Visualization: Leaflet + CARTO Dark Tiles + OSRM Routing      │
│  • Motion & Data Viz: Framer Motion + Recharts                              │
│  • State & Caching: TanStack Query v5 + Web Storage (localStorage)          │
│  • Service Worker: vite-plugin-pwa (Workbox cache strategies)               │
│  • Localization: i18next (English, Hindi, Odia)                             │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / WSS (Realtime)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                        BACKEND AS A SERVICE (SUPABASE)                      │
│  • PostgreSQL Database with Row-Level Security (RLS)                        │
│  • GoTrue Auth (Email/Password + RBAC: Citizen, Responder, Admin)           │
│  • Realtime Engine (Postgres Changes broadcast over WebSockets)             │
│  • Storage (Disaster incident photos and field damage attachments)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    EDGE FUNCTIONS RUNTIME (DENO / TS)                       │
│  1. predict-risk: Multi-factor risk engine + Heuristics / ML_MODEL_URL      │
│  2. resqai-chat: Auth-gated LLM streaming with strict vernacular rules      │
│  3. fetch-disasters: Live telemetry ingest & feed transformation            │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ REST APIs
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                            EXTERNAL DATA FEEDS                              │
│  • USGS Earthquakes API (Global seismic monitoring)                         │
│  • NASA EONET (Earth Observatory Natural Event Tracker)                     │
│  • NASA FIRMS (Fire Information for Resource Management - Thermal)          │
│  • Open-Meteo Weather API (Precipitation, wind speeds, temperature)         │
│  • OSRM (Open Source Routing Machine for evacuation navigation)             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Detailed Breakdown of Core Modules

### Module 1: Interactive Disaster Map & Geospatial Layering
- **Engine:** Built with Leaflet over dark CARTO basemaps for high contrast during power outages or dim conditions.
- **15 Regional Grid Points:** Bhubaneswar, Cuttack, Puri Coast, Paradip, Balasore, Kendrapara, Jajpur, Mayurbhanj, Berhampur, Koraput, Sambalpur, Rourkela, Balangir, Boudh, and Dhenkanal.
- **Layers:**
  1. *Canvas Risk Heatmap:* Color gradient representing severity across 6 disaster vectors.
  2. *Live Shelters:* Green (ample room), Yellow (nearing capacity), Red (full), with one-click route calculation.
  3. *NASA EONET / USGS Pins:* Global/regional disaster incident overlays.
  4. *Community Ground-Truth Pins:* Crowdsourced citizen incident reports.
  5. *Animated Radar / Pulse Rings:* Real-time visual cue for critical zones.

### Module 2: Risk Prediction & Explainable AI (XAI)
- **Heuristic & ML Pipeline:** 
  - Evaluates meteorological parameters: 7-day cumulative precipitation, max sustained wind speed, sea-surface temperature, humidity.
  - Integrates geographic constants: coastal proximity ($lng > 85.5^\circ$), river delta flood zones (Mahanadi delta), dense forest canopy (Simlipal), and high-elevation landslide terrain (Eastern Ghats/Koraput).
  - Integrates seasonal factors (Monsoon months June–September, Cyclone peaks October–November).
- **Explainability:** Each prediction yields an explicit breakdown:
  - *Factors:* e.g., "High sustained wind gust (92 km/h)", "Low atmospheric pressure", "Tidal surge risk".
  - *Contribution scores:* Quantified impact weights.
  - *Plain-Language Advice:* "Move to high-altitude shelter within 6 hours."

### Module 3: Community Validation & Trust Scoring
- **Crowdsourced Verification:** Citizens present in the area can tap **"Confirm"** or **"Deny"** on predictions or reports.
- **Consensus Calculation:**
  $$\text{Trust Score} = \frac{\text{Confirmations}}{\text{Confirmations} + \text{Denials}}$$
- **Confidence Calibration:** If AI predicts `HIGH` flood risk with confidence $0.85$, but $15$ citizens in that grid report clear weather and dry streets, the combined trust drops, preventing unnecessary community panic.
- **Official Vetting:** Admin responders can mark reports with an immutable `VERIFIED` badge.

### Module 4: Context-Aware Vernacular AI Assistant (`resqai-chat`)
- **Strict Vernacular Guardrails:** System prompts enforce complete responses in Odia script (ଓଡ଼ିଆ), Devanagari Hindi, or English based on user selection.
- **Security & Quota Gate:** Rejects anonymous requests; validates the Supabase JWT before invoking AI APIs to prevent credit depletion.
- **Voice Capabilities:** Web Speech API integration for speech-to-text input, vital for stressed or low-literacy users in crisis.
- **Disaster Safety Knowledge Base:** Prompt engineered with NDMA (National Disaster Management Authority) guidelines for cyclones, flash floods, snakebites, and triage.

### Module 5: Evacuation Routing & Shelter Logistics
- **Dynamic Occupancy:** Track total capacity vs. registered evacuees.
- **Routing Engine:** Leaflet Routing Machine powered by Open Source Routing Machine (OSRM) computes safe walking or driving routes avoiding flooded lowlands.

### Module 6: Offline Resilience & PWA Architecture
- **Service Worker (Workbox):** Pre-caches HTML, JS, CSS, and CARTO map tiles.
- **Degraded Network Fallback:** If API calls fail, the client falls back to cached predictions stored in `localStorage` and switches to a local heuristic evaluation engine.
- **Audio Alerts:** Generates Web Audio API synthesized tones locally on the device even when media streaming is down.

---

## 6. Database Schema & Data Models (Supabase PostgreSQL)

| Table Name | Primary Purpose | Key Fields |
|---|---|---|
| `profiles` | User identity & preferences | `id`, `full_name`, `language`, `phone`, `emergency_contact`, `role` |
| `user_roles` | Role-Based Access Control | `user_id`, `role` (`citizen`, `responder`, `admin`) |
| `reports` | Citizen disaster reports | `id`, `user_id`, `disaster_type`, `description`, `latitude`, `longitude`, `trust_score`, `verified` |
| `report_validations` | Voting audit log | `report_id`, `user_id`, `is_valid` (boolean confirm/deny) |
| `risk_predictions` | AI generated hazard scores | `grid_point_id`, `disaster_type`, `risk_level`, `confidence`, `factors`, `expires_at` |
| `shelters` | Relief camps & cyclone centers | `name`, `latitude`, `longitude`, `capacity`, `occupancy`, `amenities`, `contact` |
| `alerts` | Broadcast emergency warnings | `title`, `message`, `severity` (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), `coordinates` |
| `resources` | Relief goods & vehicles | `item_name`, `category` (boats, food, medical), `quantity`, `location` |
| `incidents` / `incident_logs` | Operational emergency log | `incident_type`, `status` (`OPEN`, `INVESTIGATING`, `RESOLVED`), `assigned_unit` |
| `damage_assessments` | Post-disaster loss reporting | `location`, `structural_damage_score`, `human_impact`, `relief_funds_requested` |

---

## 7. Viva & Oral Examination Questions with Model Answers

### Category A: High-Level Project & Conceptual Questions

#### Q1: "Why did you build this project, and why specifically focus on Odisha?"
> **Answer:**  
> "Sir, Odisha is historically one of the most disaster-prone states in India, facing recurring Bay of Bengal cyclones, Mahanadi basin floods, and extreme heatwaves. While agencies like IMD and OSDMA provide early warnings, the critical gap is the **'last mile'**: network outages during storms sever communications, warnings are often in English rather than Odia, and there is no direct crowdsourced mechanism to verify on-ground truth. ResQAI bridges this gap with offline PWA caching, local language support, and a community validation loop."

#### Q2: "What is your project's unique innovation compared to existing disaster apps?"
> **Answer:**  
> "Sir, three main innovations distinguish ResQAI:
> 1. **Bi-Directional Validation Loop:** We don't just broadcast predictions; citizens vote to confirm or refute alerts, producing a mathematical trust score that prevents false alarms.
> 2. **Offline-First Resilience:** Most apps crash without an internet connection. ResQAI precaches critical data, retains the latest predictions in `localStorage`, and runs fallback heuristics offline.
> 3. **Explainable AI (XAI):** Rather than outputting a black-box percentage, ResQAI explicitly details the contributing environmental factors."

---

### Category B: Technical Architecture & Implementation Questions

#### Q3: "What is your tech stack and why did you choose it?"
> **Answer:**  
> "Sir, we used:
> - **Frontend:** React 18 with TypeScript for robust typing, Vite for fast compilation, and Tailwind CSS with Radix UI (shadcn) for an accessible dark command-center UI.
> - **State & Caching:** TanStack Query handles server-state synchronization and background refetching.
> - **Maps:** Leaflet with CARTO tiles because it is lightweight, supports custom HTML/canvas markers, and can cache map tiles for offline use.
> - **Backend:** Supabase, which provides managed PostgreSQL, Row-Level Security (RLS) for data protection, and WebSocket Realtime subscriptions.
> - **Edge Functions:** Deno-based Supabase Edge Functions for compute tasks like prediction aggregation and LLM API isolation."

#### Q4: "How does the offline mode work when the user loses internet connection?"
> **Answer:**  
> "Sir, offline functionality relies on three layers:
> 1. **Service Worker:** Using `vite-plugin-pwa` (Workbox), the application shell, JavaScript bundles, CSS, icons, and basemap assets are precached.
> 2. **Data Storage:** Prediction grids and shelter lists are stored in `localStorage` upon initial fetch.
> 3. **Offline Heuristic Engine:** If network connectivity drops (`navigator.onLine === false`), the app switches to local cached risk models and alerts the user with a degraded mesh-network banner."

#### Q5: "How does Supabase Realtime work in this application?"
> **Answer:**  
> "Sir, Supabase listens to the PostgreSQL Write-Ahead Log (WAL) using logical decoding. When a new row is inserted into the `alerts` or `reports` table, Supabase broadcasts the change payload over a WebSocket channel to all connected React clients. In our frontend, TanStack Query invalidates the cache and updates the UI instantly without needing manual page reloads."

---

### Category C: AI, Machine Learning & Mathematical Models

#### Q6: "How does the Risk Prediction Engine work? Are you using real ML or heuristics?"
> **Answer:**  
> "Sir, the architecture is designed as a **pluggable dual-mode engine**:
> - **Production Mode:** If an external ML model endpoint is provided via the `ML_MODEL_URL` secret, the edge function forwards the weather features (7-day rainfall, wind speed, pressure, temperature) and coordinates to that model (e.g., Random Forest or XGBoost).
> - **Heuristic Engine (Baseline/Fallback):** In the absence of an external endpoint or during API drops, it executes a rule-based weighted model. For example, in coastal coordinates during October/November (cyclone season), high wind speeds and low pressure assign a `CRITICAL` cyclone score with an analytical confidence calculation."

#### Q7: "What is the formula for Community Trust Scoring?"
> **Answer:**  
> "Sir, when citizens view a report or prediction, they submit confirmation ($C$) or denial ($D$) votes:
> $$\text{Trust Score} = \frac{C}{C + D}$$
> An initial baseline prior is applied (Laplace smoothing) when votes are low. If $\text{Trust Score} \ge 0.75$, the report is considered high-confidence; if it falls below $0.4$, the alert tier is downgraded to `MONITORING` or discarded."

#### Q8: "How did you ensure the AI chatbot answers strictly in Odia or Hindi?"
> **Answer:**  
> "Sir, we enforce language compliance at the edge function layer (`resqai-chat`). We inject strict system prompt instructions specifying that every single token and sentence must be generated in the requested script (Odia script `\u0B00`–`\u0B7F` or Devanagari). Additionally, we implement an authentication gate: only signed-in users with a valid Supabase JWT can invoke the AI edge function, preventing API abuse."

---

### Category D: Security, Database & System Design

#### Q9: "What is Row-Level Security (RLS) and how did you use it?"
> **Answer:**  
> "Sir, in PostgreSQL, Row-Level Security ensures that database queries automatically filter rows based on the requesting user's identity and role:
> - Normal citizens can `SELECT` approved alerts and `INSERT` their own disaster reports.
> - Only users with the `responder` or `admin` role in `user_roles` can `UPDATE` shelter capacities, edit resource inventories, or `DELETE` bogus reports.
> This guarantees that even if someone inspects the frontend code and gets our anon API key, they cannot bypass authorization."

#### Q10: "How do you prevent malicious users from spamming fake disaster reports?"
> **Answer:**  
> "Sir, we implemented multiple safeguards:
> 1. Only authenticated users can submit reports.
> 2. Each report starts in an unverified state with a neutral trust score.
> 3. The community validation system allows nearby citizens to downvote or deny false reports.
> 4. An Admin Triage Queue (`/admin`) allows verified disaster responders to officially approve or dismiss reports."

---

## 8. Live Demonstration Script for Sir (5-Minute Walkthrough)

When presenting to your professor, follow this structured sequence:

| Step | Time | What to Show | What to Say |
|---|---|---|---|
| **1. Landing & Context** | 0:00 - 0:45 | Open `/` (Landing Page) | *"Sir, this is ResQAI. We built this to tackle recurring disaster vulnerability in coastal Odisha with an offline-capable, community-validated intelligence dashboard."* |
| **2. Interactive Map** | 0:45 - 1:45 | Navigate to `/dashboard` | *"Here is our Leaflet Command Map centered on Odisha. We have 15 live sensor grid stations. I can toggle heatmaps for Cyclones, Floods, or Wildfires. Notice the active pulse rings around critical hazard zones."* |
| **3. XAI & Predictions** | 1:45 - 2:45 | Hover over a grid marker / Forecast Center (`/forecast`) | *"If we inspect this station, the AI doesn't just say 'High Risk'; it provides Explainable AI (XAI) factors: 7-day precipitation, wind velocity, and coastal proximity."* |
| **4. Community Validation** | 2:45 - 3:30 | Show Community Validation panel | *"Here a citizen can confirm or deny ground reality with one click. The trust score updates via Supabase Realtime, filtering out false rumors."* |
| **5. AI Assistant & Multi-language** | 3:30 - 4:15 | Open AI Chat, switch language to Odia/Hindi | *"Our emergency assistant operates in English, Hindi, and Odia, offering life-saving evacuation and first-aid instructions with voice input support."* |
| **6. Shelters & Logistics** | 4:15 - 5:00 | Show Shelter Routing (`/evacuate`) & Admin (`/admin`) | *"Finally, the system plots turn-by-turn routes to the nearest available cyclone shelter and gives administrators an incident triage control room."* |

---

## 9. Future Scope & Major Project Roadmap

If your professor asks: *"What can you improve for your Final Year Major Project?"*
1. **IoT Sensor Ingestion:** Direct integration with LoRaWAN mesh nodes and river water-level ultrasonic sensors deployed along the Mahanadi river.
2. **Satellite Synthetic Aperture Radar (SAR):** Automated flood inundation mapping using Sentinel-1 radar imagery processed via Google Earth Engine.
3. **P2P Bluetooth Mesh Offline Sync:** Implementing WebRTC / BLE mesh synchronization so smartphones can relay emergency alerts from phone to phone without cellular towers.
4. **Custom Fine-Tuned Local LLM:** Deploying a quantized SLM (Small Language Model, like Gemma 2B or Llama-3-8B) running entirely on-device via WebGPU / ONNX Runtime.
