# EcoSort AI 🌿

**Advanced AI-Powered Waste Classification & Sustainable Disposal Platform**

[![CI](https://github.com/Suhani-ai-dev/EcoSort-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/Suhani-ai-dev/EcoSort-AI/actions/workflows/ci.yml)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Suhani-ai-dev/EcoSort-AI)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![UN SDG 12](https://img.shields.io/badge/UN%20SDG-12-16a34a.svg)](https://sdgs.un.org/goals/goal12)

Built for sustainable waste diversion, aligned with **UN SDG 12 — Responsible Consumption and Production**.

Users photograph or upload waste items; EcoSort AI classifies them using an **EfficientNetB0 deep learning vision model**, generates step-by-step circular economy disposal instructions via **Google Gemini**, quantifies diverted emissions with peer-reviewed **EPA WARM v16 LCA carbon models**, and rewards everyday recycling habits with gamified badges and community impact tracking.

---

## ✨ Key Features

| Feature | Details |
|---|---|
| 📸 **Live Webcam & Photo Scanner** | Real-time browser webcam scanner with targeting reticle, file dropzone, and **1-click test samples** (Plastic Bottle, Cardboard, Soda Can, Apple, Smartphone) |
| ⚡ **Frictionless Zero-Login Access** | Fully runnable without mandatory sign-in. Automatic persistent guest profile with local storage + cloud sync |
| 🧠 **EfficientNetB0 Deep Learning** | Computer vision model classifying 10 waste categories and 70+ subcategories in under a second |
| 🤖 **Gemini AI Disposal Guidance** | Real-time localized disposal steps, recycling bin color codes, and circular economy advice |
| 🌍 **LCA Carbon Impact Metrics** | Peer-reviewed CO₂e savings baselines (US EPA WARM v16, WRAP 2020, IPCC AR6) with real-world equivalents (trees planted, car km offset) |
| 🏆 **Gamification & Badges** | Milestone badges (*First Scan*, *Eco Starter*, *Green Guardian*, *Waste Warrior*, *Planet Hero*), audio celebratory chimes, and leaderboard |
| 📜 **Scan History & Export** | Filter past scans by category (Plastic, Paper, Metal, Glass, Organic, E-Waste), and export history as JSON |
| 🌙 **Adaptive Dark / Light Mode** | Modern emerald eco theme with Tailwind CSS, persisted to local storage |
| 🚀 **Deploy Ready** | Pre-configured for **Vercel**, **Render**, **Netlify**, and **Docker Compose** |

---

## 🏗️ Architecture

```text
┌────────────────────────────────────────────────────────────────────────┐
│                   React + Vite + Tailwind Frontend                     │
│  • Live Webcam & Upload Zone      • Universal Municipal Bin Guide      │
│  • Real-Time Audio Chimes         • Profile & Environmental Equivs     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST API
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Python Backend                          │
│  • POST /classify   → EfficientNetB0 Vision Model (ImageNet / Custom)  │
│  • POST /guidance   → Google Gemini Generative AI (with fallback JSON) │
│  • POST /scans      → Saves scan + awards points (Cloud / In-Memory)   │
│  • GET  /scans      → Paginated history with ephemeral signed URLs     │
│  • GET  /leaderboard→ Community rankings and podium leaders            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        ▼                                                       ▼
Google Gemini API                               Supabase Database & Storage
(Disposal synthesis)                            (PostgreSQL + S3 Storage Bucket)
```

---

## 🚀 Quick Start (Run Locally)

### 1. Clone the repository
```bash
git clone https://github.com/Suhani-ai-dev/EcoSort-AI.git
cd EcoSort-AI
```

### 2. Run with Docker Compose (Fastest)
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

### Manual Setup

#### Backend Setup (Python 3.11)
```bash
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

# Run integration tests:
python test_integration.py

# Start FastAPI server:
uvicorn main:app --reload --port 8000
```
API runs on `http://localhost:8000`.

#### Frontend Setup (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🌐 Production Deployment

### Option 1: Vercel (Frontend)
1. Push to your GitHub repository.
2. Go to [Vercel](https://vercel.com) and click **Import Project**.
3. Set Root Directory to `frontend`.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://ecosort-backend.onrender.com`).
5. Deploy!

### Option 2: Render (Full-Stack 1-Click)
The repository includes `render.yaml`:
1. Connect your GitHub repository to [Render](https://render.com).
2. Create a **Blueprint** using `render.yaml`.
3. Provide your `GEMINI_API_KEY` in environment settings.
4. Render will deploy both the FastAPI backend and React frontend automatically.

### Option 3: Netlify (Frontend)
The repository contains `frontend/netlify.toml`:
1. Import repository on [Netlify](https://netlify.com).
2. Base directory: `frontend`.
3. Build command: `npm run build`.
4. Publish directory: `dist`.

---

## 🧪 Testing

Run backend integration test suite:
```bash
cd backend
python test_integration.py
```
Tests:
- [x] Lifespan startup & Health Check (`GET /`)
- [x] Vision inference model loading (`POST /classify`)
- [x] Gemini AI disposal guidance generation (`POST /guidance`)
- [x] Community leaderboard rankings (`GET /leaderboard`)
- [x] Guest scan persistence & history retrieval (`POST & GET /scans`)

Run frontend build verification:
```bash
cd frontend
npm run build
```

---

## 📜 License & Acknowledgements

- **License**: MIT License
- **Carbon Data**: US EPA WARM v16, WRAP 2020, IPCC AR6
- **UN SDG Alignment**: [SDG 12 — Responsible Consumption and Production](https://sdgs.un.org/goals/goal12)
