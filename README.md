# ResQ — Climate Disaster Relief & Resource Allocation Platform

> **GenAI Buildathon 2026** | **Team Flash**  
> Disaster relief and resource orchestration platform designed for real-time flood monitoring, deterministic inventory allocation, and verified route planning.

---

## ⚡ Super-Simple 1-Command Local Run

### Option 1: Just Run `npm run dev` (Runs Both Backend & Frontend)
```bash
cd forge-26-team-flash
npm run dev
```
That's it!
- **Backend API**: [http://localhost:5000](http://localhost:5000) (Health check: `/health`)
- **Frontend App**: [http://localhost:3000](http://localhost:3000)

*Zero database setup or API keys required to start* — the app launches automatically with a resilient pre-seeded disaster relief store.

### Option 2: Double-Click (Windows)
Double-click `start-dev.bat` inside the project folder. Both services launch instantly in one colored console.

### Option 3: Docker Compose
```bash
cd forge-26-team-flash
docker compose up --build
```

---

## 🌐 Easy 1-Click Deployment

### 1. Backend Deployment (Render / Railway)
- **Render**: Connect this repository on [Render](https://render.com). It will automatically detect [`render.yaml`](./render.yaml).
  - Or create a **Web Service**:
    - **Root Directory**: `backend` (or `forge-26-team-flash/backend`)
    - **Build Command**: `npm run build`
    - **Start Command**: `npm start`
    - **Port**: `5000`
    - *(Optional)* Add `GEMINI_API_KEY` for Google Gemini AI.

### 2. Frontend Deployment (Vercel)
- In [Vercel](https://vercel.com), import your repository.
- Set **Root Directory** to `frontend` (or `forge-26-team-flash/frontend`).
- Add one environment variable:
  - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
- Click **Deploy**. (Pre-configured [`vercel.json`](./frontend/vercel.json) handles the rest).

---

## 📌 Executive Summary & Architecture

During major climate emergencies (such as Bihar monsoon floods across the Kosi and Gandak basins), relief coordination faces critical bottlenecks:
1. **Supply & Need Mismatch:** Misallocation of rations and potable water between distant depots and inundated settlements.
2. **Submerged Road Corridors:** Ground routes flood rapidly, stranding standard convoys without warning.
3. **Approval Bottlenecks:** Lack of centralized visibility leads to delayed authorizations.

**ResQ** solves these challenges with:
- **📊 Real-time Dashboard:** Live summaries of affected populations (184,500), available rations, water reserves, and active orders.
- **🗺️ Interactive Map:** Leaflet GIS map visualizing staging depots, priority villages, road hazard statuses, and transit routes.
- **📦 Multi-Hub Inventory:** ACID-compliant tracking of rations, drinking water, trauma medical kits, and rescue boats across Patna, Muzaffarpur, and Bhagalpur.
- **🧠 Allocation Optimizer:** Multi-depot constrained greedy solver that prioritizes Critical and High urgency zones, minimizes travel distance, and computes fulfillment rates without hallucinated stock counts.
- **🚛 Order & Dispatch Pipeline:** 5-stage human-in-the-loop authorization (`DRAFT` ➔ `PENDING_APPROVAL` ➔ `APPROVED` ➔ `DISPATCHED` ➔ `DELIVERED`).
- **🤖 ResQ Copilot:** Grounded conversational agent with function calling (query stock, check Open-Meteo flood risk, verify order status). Powered by Google Gemini with an autonomous offline fallback engine.

---

## ⚙️ Environment Variables Reference

### Backend (`backend/.env`)
Defaults work out of the box without any changes:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Optional: Add PostgreSQL URL if using Neon or local Postgres
# DATABASE_URL=postgresql://user:password@localhost:5432/resq

# Optional: Add Gemini API Key for AI features (or leave empty for offline solver)
GEMINI_API_KEY=

OPEN_METEO_BASE_URL=https://api.open-meteo.com/v1
OSRM_BASE_URL=https://router.project-osrm.org
```

### Frontend (`frontend/.env.local`)
Pre-configured for local development:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 👥 Team Flash

- **Project:** ResQ
- **Event:** GenAI Buildathon 2026
- **License:** MIT
