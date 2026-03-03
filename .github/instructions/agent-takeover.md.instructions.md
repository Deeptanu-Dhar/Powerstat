---
description: Handoff document for agents extending PowerStat beyond its current state. Always load this file before starting any new task.
---

# PowerStat — Agent Takeover File

> **Instructions for the incoming agent:** Read this file in full before touching any code. It describes the current project state, what has been built, what remains, known gotchas, and suggested next extensions.

---

## Project Summary
PowerStat is a MERN stack MVP that:
1. Accepts a Windows `battery-report.html` file (drag-and-drop).
2. Parses **Design Capacity**, **Full Charge Capacity**, and **Cycle Count** using Cheerio on the server.
3. Saves the parsed data to MongoDB Atlas, keyed to a browser-persistent `sessionId` (localStorage).
4. Visualises health with a Recharts bar chart and a DaisyUI radial-progress gauge.
5. Provides full CRUD on saved reports (create, read, update title, delete).

---

## Monorepo Layout
```
DA1/
├── client/                  ← Vite + React + Tailwind + DaisyUI + Recharts
│   ├── src/
│   │   ├── assets/fonts/    ← Lilex font files (.woff2)
│   │   ├── api/
│   │   │   └── reports.js   ← All API fetch wrappers
│   │   ├── hooks/
│   │   │   └── useSession.js← Generates/reads localStorage sessionId
│   │   ├── components/
│   │   │   ├── Hero.jsx
│   │   │   ├── DropZone.jsx
│   │   │   ├── LoadingBar.jsx
│   │   │   ├── CapacityChart.jsx
│   │   │   ├── HealthGauge.jsx
│   │   │   └── ReportHistory.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css        ← Tailwind directives + @font-face for Lilex
│   ├── index.html           ← data-theme="myTheme" on <html>
│   ├── tailwind.config.js
│   └── vite.config.js       ← /api proxy → http://localhost:5000
├── server/
│   ├── models/
│   │   └── Report.js        ← Mongoose schema
│   ├── middleware/
│   │   └── session.js       ← Attaches x-session-id header to req.sessionId
│   ├── routes/
│   │   ├── upload.js        ← POST /api/upload (multer + cheerio)
│   │   └── reports.js       ← CRUD: POST / GET / PATCH / DELETE
│   ├── index.js             ← Express entry point
│   ├── .env                 ← MONGO_URI, PORT (not committed)
│   └── .env.example         ← Documents required env vars
└── .github/instructions/
    ├── instructions.md.instructions.md
    └── agent-takeover.md.instructions.md  ← this file
```

---

## Completed Features
_Last updated: 2026-02-26 — Full MVP implementation complete._

| # | Feature | Status | Notes |
|---|---|---|---|
| 0 | Instructions & agent-takeover files | ✅ Done | |
| 1 | Server scaffolding | ✅ Done | `server/index.js`, `package.json`, `.env.example` |
| 2 | Mongoose Report model | ✅ Done | `server/models/Report.js` |
| 3 | Session middleware | ✅ Done | `server/middleware/session.js` — reads `x-session-id` header |
| 4 | Upload & parse route | ✅ Done | `POST /api/upload` — Cheerio regex label matching |
| 5 | CRUD routes | ✅ Done | `POST / GET /:sessionId / PATCH /:id / DELETE /:id` |
| 6 | Client scaffold | ✅ Done | Vite + React 19, Tailwind 3, DaisyUI 4, Lilex woff2 self-hosted |
| 7 | `useSession` hook | ✅ Done | `client/src/hooks/useSession.js` — localStorage persistence |
| 8 | API client layer | ✅ Done | `client/src/api/reports.js` — all fetch wrappers |
| 9 | Hero component | ✅ Done | `client/src/components/Hero.jsx` — command block + clipboard |
| 10 | DropZone + LoadingBar | ✅ Done | `DropZone.jsx` uses react-dropzone; `LoadingBar.jsx` uses DaisyUI progress |
| 11 | CapacityChart | ✅ Done | `client/src/components/CapacityChart.jsx` — Recharts BarChart |
| 12 | HealthGauge | ✅ Done | `client/src/components/HealthGauge.jsx` — DaisyUI radial-progress, colour-coded |
| 13 | ReportHistory | ✅ Done | `client/src/components/ReportHistory.jsx` — inline edit + delete |
| 14 | App assembly | ✅ Done | `client/src/App.jsx` — full layout wired together |

---

## Remaining Work (in order)
**The MVP is feature-complete.** The following are pre-launch tasks:
1. **Supply `MONGO_URI`** — copy `server/.env.example` → `server/.env` and fill in the MongoDB Atlas connection string.
2. **Smoke test** — start both server and client, generate a real `battery-report.html` with `powercfg /batteryreport`, drag it in, verify chart + gauge render and history persists after browser close.
3. **Optional polish** — see Suggested Extensions below.

---

## Key Decisions & Rationale
| Decision | Rationale |
|---|---|
| `localStorage` for sessionId | Persists across browser close/reopen; clears only on explicit cache wipe |
| Cheerio over jsdom | Lighter, sync, ideal for targeted table scraping |
| Vite proxy `/api → :5000` | Avoids CORS config in dev |
| ES Modules on server | Consistent with modern Node.js; `"type": "module"` in server/package.json |
| MongoDB Atlas | Cloud-hosted; `MONGO_URI` supplied via `.env` |

---

## Known Limitations / Tech Debt
- Parser is brittle against non-English Windows locales (battery report table labels differ). A future agent should add locale-aware label matching.
- No authentication — `sessionId` is spoofable. Fine for MVP; add JWT/auth for production.
- No file-size validation on uploads.
- No unit tests yet.

---

## Suggested Extensions (for the next agent)
1. **Multi-file comparison** — upload several reports and overlay them on the chart.
2. **PDF/PNG export** — export the chart and gauge using `html2canvas` + `jsPDF`.
3. **Auth layer** — replace sessionId with proper user accounts (Passport.js or Clerk).
4. **Trend line** — if the user uploads multiple reports over time, plot a degradation trend.
5. **Notifications** — warn user when health drops below a configurable threshold.
6. **PWA / Electron wrapper** — package as a desktop app for true "on-device" feel.

---

## Environment Setup for Incoming Agent
1. Ensure Node.js ≥ 18 and npm ≥ 9 are available.
2. Copy `server/.env.example` → `server/.env` and fill in `MONGO_URI` (MongoDB Atlas connection string).
3. `cd server && npm install && node index.js` — should log "Connected to MongoDB Atlas".
4. `cd client && npm install && npm run dev` — opens at `http://localhost:5173`.
