# EcoSort AI 🌿

**AI-Powered Waste Classification and Sustainable Disposal Assistant**

[![CI](https://github.com/YOUR_USERNAME/EcoSort-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/EcoSort-AI/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/EcoSort-AI&root=frontend)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![SDG 12](https://img.shields.io/badge/UN%20SDG-12-16a34a.svg)](https://sdgs.un.org/goals/goal12)

Built as a final internship project for the *AI for Sustainability* programme, aligned with **SDG 12 — Responsible Consumption and Production**.

Users photograph a waste item; EcoSort AI classifies it with a fine-tuned EfficientNetB0 model, generates structured disposal guidance and a conversational explanation via Google Gemini, quantifies the CO₂ impact using peer-reviewed LCA data, and rewards sustainable habits through gamification.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📸 AI Waste Scanner | EfficientNetB0 fine-tuned on Kaggle Garbage Classification dataset — 10 waste categories |
| 🤖 Gemini Guidance | Structured disposal steps + conversational explanation from Google Gemini (model configurable) |
| 🌍 Carbon Impact | CO₂e savings per item, sourced from WRAP 2020, US EPA WARM v16, IPCC AR6 |
| 🏆 Gamification | Points per scan (+10 base, +15 E-Waste bonus, +20 Hazardous bonus), milestone badges, leaderboard |
| 🔐 Authentication | Supabase Auth — email/password + Google OAuth |
| 🔒 Private Storage | Scan images in a private Supabase Storage bucket; time-limited signed URLs, never public |
| 📚 Learn Hub | Waste guide, recycling symbols, SDG 12 facts, 22 randomised eco tips |
| 🌙 Dark Mode | Tailwind CSS class-based, persisted to localStorage |
| 📱 Mobile-First | Responsive design, camera capture support on mobile |

---

## 🏗️ Architecture

```
React Frontend (Vite + Tailwind)
        │  REST (JSON + multipart)
        ▼
FastAPI Backend (Python 3.11)
    ├── POST /classify  → EfficientNetB0 model
    ├── POST /guidance  → Google Gemini API
    ├── POST /scans     → Supabase Storage + PostgreSQL
    ├── GET  /scans     → Supabase (signed URLs generated server-side)
    └── GET  /leaderboard → Supabase PostgreSQL
        │
        ├── Supabase PostgreSQL (profiles, scans, points, badges, user_badges)
        ├── Supabase Storage    (private scan-images bucket)
        └── Google Gemini API
```

---

## 📁 Repository Structure

```
EcoSort-AI/
├── README.md
├── .gitignore
├── docker-compose.yml
├── ecosort-ai-plan.md
│
├── frontend/                          # Vite + React 18 + TypeScript + Tailwind CSS 3
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── vercel.json
│   ├── netlify.toml
│   ├── .env.example
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── api/                       # Typed Axios API wrappers
│       │   ├── classifyApi.ts
│       │   ├── guidanceApi.ts
│       │   ├── scansApi.ts
│       │   ├── leaderboardApi.ts
│       │   └── profileApi.ts
│       ├── contexts/
│       │   ├── AuthContext.tsx
│       │   └── ThemeContext.tsx
│       ├── components/
│       │   ├── auth/PrivateRoute.tsx
│       │   ├── layout/               # Navbar, Footer, Layout
│       │   ├── scan/                 # UploadZone, AnalysingLoader, ResultCard
│       │   ├── history/              # ScanHistoryCard
│       │   ├── leaderboard/          # LeaderboardRow
│       │   ├── profile/              # BadgeCard
│       │   └── learn/                # WasteCategoryCard, RecyclingSymbolGrid, EcoTipCarousel, SDG12Section
│       ├── data/
│       │   └── learnContent.ts       # Static educational content
│       ├── lib/
│       │   ├── apiClient.ts          # Axios instance with JWT interceptor
│       │   └── supabaseClient.ts
│       └── pages/                    # HomePage, ScanPage, HistoryPage, LeaderboardPage, LearnPage, ProfilePage, LoginPage, SignupPage, NotFoundPage
│
└── backend/                          # FastAPI + Python 3.11
    ├── main.py
    ├── config.py
    ├── requirements.txt
    ├── Dockerfile
    ├── .dockerignore
    ├── .env.example
    ├── deps/
    │   └── auth.py                   # JWT verification dependency
    ├── routers/
    │   ├── classify.py               # POST /classify
    │   ├── guidance.py               # POST /guidance
    │   ├── scans.py                  # POST /scans, GET /scans
    │   └── leaderboard.py            # GET /leaderboard
    ├── schemas/
    │   ├── classify.py
    │   ├── guidance.py
    │   └── scan.py
    ├── models/
    │   ├── model_loader.py           # EfficientNetB0 singleton loader
    │   └── carbon_map.py             # LCA-cited carbon estimates
    ├── services/
    │   ├── gemini_service.py         # Gemini API + LRU cache + fallback
    │   ├── supabase_service.py       # Storage upload, signed URLs, DB ops
    │   └── points_service.py        # Points calculation + badge logic
    ├── training/
    │   ├── dataset_prep.py           # Dataset download + taxonomy remap
    │   └── train.py                  # Two-phase EfficientNetB0 fine-tuning
    ├── scripts/
    │   └── download_model.py         # Pre-trained model download utility
    ├── data/
    │   └── fallback_guidance.json    # Static Gemini fallback data
    └── db/
        └── migrations/
            ├── 001_initial_schema.sql
            └── 002_storage_policies.sql
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Python** ≥ 3.11
- A **Supabase** project (free tier works) — [supabase.com](https://supabase.com)
- A **Google Gemini API key** — [aistudio.google.com](https://aistudio.google.com)
- **Kaggle account** (for dataset download, optional if using pre-trained weights)

---

### 1. Supabase Setup

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   ```sql
   -- Run: backend/db/migrations/001_initial_schema.sql
   -- Run: backend/db/migrations/002_storage_policies.sql
   ```
3. In **Authentication → Providers**, enable:
   - Email/Password
   - Google OAuth (optional — requires Google Cloud credentials)
4. Copy your **Project URL** and **anon key** (for frontend) and **service-role key** (for backend) from **Settings → API**

---

### 2. ML Model

**Option A — Train from scratch (recommended for best accuracy):**
```bash
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Download and prepare dataset
python training/dataset_prep.py --data-dir ./data

# Fine-tune EfficientNetB0 (GPU recommended, ~30 min)
python training/train.py --data-dir ./data --output-path ./models/waste_classifier.h5
```

**Option B — Download pre-trained weights:**
```bash
# Set MODEL_DOWNLOAD_URL in your backend/.env, then:
python scripts/download_model.py --output ./models/waste_classifier.h5
```

---

### 3. Frontend

```bash
cd frontend
cp .env.example .env
# Edit .env — fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL
npm install
npm run dev
# → http://localhost:5173
```

---

### 4. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
cp .env.example .env
# Edit .env — fill in all variables

uvicorn main:app --reload --port 8000
# → http://localhost:8000
# Health check: GET http://localhost:8000/ → {"status":"ok","model_loaded":true}
```

---

### 5. Docker Compose (full stack locally)

```bash
# Copy both .env files first
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit both .env files

docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:8000
```

---

## 🐙 GitHub Setup

Push this project to GitHub in three steps:

```bash
# 1. Initialise (if not already a git repo)
git init
git add .
git commit -m "feat: initial EcoSort AI commit"

# 2. Create a new repo on github.com (do NOT initialise with README)
#    Then add the remote:
git remote add origin https://github.com/YOUR_USERNAME/EcoSort-AI.git

# 3. Push
git branch -M main
git push -u origin main
```

### GitHub Secrets (for CI)

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_API_BASE_URL` | Your deployed backend URL |

The included `.github/workflows/ci.yml` will automatically type-check and build the frontend on every push to `main`.

---

## 🌐 Deployment

### Frontend → Vercel (recommended)

1. Push repository to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL` (point to deployed backend)
5. Deploy — `vercel.json` handles SPA routing automatically

### Frontend → Netlify

1. Set **Base directory** to `frontend`, **Build command** to `npm run build`, **Publish directory** to `frontend/dist`
2. Add environment variables in Netlify dashboard
3. `netlify.toml` handles SPA redirects automatically

### Backend → Railway

1. Create a new Railway project, connect GitHub repository
2. Set **Root Directory** to `backend`
3. Railway detects the `Dockerfile` automatically
4. Add all backend environment variables in the Railway dashboard
5. Deploy — Railway assigns a public URL, use it as `VITE_API_BASE_URL` in the frontend

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect GitHub, set **Root Directory** to `backend`
3. **Runtime**: Docker (uses `backend/Dockerfile`)
4. Add environment variables in the Render dashboard

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous (public) key |
| `VITE_API_BASE_URL` | ✅ | FastAPI backend base URL (e.g. `http://localhost:8000`) |

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SUPABASE_URL` | ✅ | — | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | — | Supabase service-role key (never expose to frontend) |
| `GEMINI_API_KEY` | ✅ | — | Google Gemini API key |
| `GEMINI_MODEL` | ❌ | `gemini-1.5-flash` | Gemini model name (e.g. `gemini-1.5-pro`) |
| `MODEL_PATH` | ❌ | `./models/waste_classifier.h5` | Path to trained EfficientNetB0 weights |
| `MODEL_DOWNLOAD_URL` | ❌ | — | URL to download pre-trained weights (used by `scripts/download_model.py`) |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/` | — | Health check — returns model_loaded status |
| `POST` | `/classify` | — | Multipart image → `{category, sub_category, confidence, carbon_kg, carbon_source_citation}` |
| `POST` | `/guidance` | — | JSON `{category, sub_category}` → structured guidance + explanation |
| `POST` | `/scans` | JWT | Save scan + image → `{scan, points_earned, points_total, new_badges[]}` |
| `GET` | `/scans` | JWT | Paginated scan history with signed image URLs |
| `GET` | `/leaderboard` | — | Top-N users by total points |

---

## 🌱 Waste Categories

| # | Category | Recyclable | Hazardous |
|---|---|---|---|
| 0 | Paper | ✅ | ❌ |
| 1 | Plastic | ✅ | ❌ |
| 2 | Glass | ✅ | ❌ |
| 3 | Metal | ✅ | ❌ |
| 4 | Food/Organic | ❌ | ❌ |
| 5 | E-Waste | ✅ | ✅ |
| 6 | Medical | ❌ | ✅ |
| 7 | Hazardous | ❌ | ✅ |
| 8 | Textile | ✅ | ❌ |
| 9 | General | ❌ | ❌ |

---

## 📊 Carbon Data Sources

Carbon impact estimates are based on peer-reviewed life-cycle assessment (LCA) data:

| Source | Used for |
|---|---|
| **US EPA WARM Model v16** (2023) | Paper, Plastic, Glass, Metal, Hazardous, General |
| **WRAP** (2020) — *Valuing Our Clothes* | Textile, Paper supplementary |
| **IPCC AR6 WG3** (2022), Chapter 5 | Food/Organic, E-Waste, Medical |
| **WHO Health-care Waste Guidelines** (2014) | Medical supplementary |

---

## 🎮 Gamification

| Action | Points |
|---|---|
| Any scan | +10 base |
| E-Waste scan | +10 base + 15 bonus = **25 pts** |
| Hazardous scan | +10 base + 20 bonus = **30 pts** |

| Badge | Threshold |
|---|---|
| 🌱 Eco Starter | 50 points |
| 🛡️ Green Guardian | 200 points |
| ⚔️ Waste Warrior | 500 points |
| 🌍 Planet Hero | 1000 points |

---

## 🛡️ Security

- Scan images stored in a **private** Supabase Storage bucket (`scan-images`)
- Images accessed only via **time-limited signed URLs** (TTL: 3600 s), generated server-side
- `image_path` (Storage object key) stored in DB — never a public URL
- Storage RLS: users can only access objects in their own `{user_id}/` folder
- All authenticated API endpoints verify the Supabase JWT server-side via the service-role key
- `SUPABASE_SERVICE_KEY` is backend-only — never sent to or accessible from the frontend

---

## 🤝 SDG 12 Alignment

EcoSort AI directly supports **SDG 12: Responsible Consumption and Production** by:

- 🔍 Reducing waste misdirection via AI-powered classification
- 📊 Quantifying environmental impact with peer-reviewed carbon data
- 🎓 Building sustainable habits through education (Learn hub)
- 🏆 Driving behaviour change via gamification
- 🌍 Scaling impact through community leaderboards

---

## 📄 License

MIT — see [LICENSE](LICENSE)
