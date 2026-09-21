# EcoSort AI — Project Plan

## Top-Level Overview

**Goal:** Build a full-stack, AI-powered web application called **EcoSort AI** that helps everyday users correctly identify, sort, and sustainably dispose of waste items. Users upload a photo of a waste item; the app classifies it, provides disposal guidance and carbon impact data, awards points/badges, and surfaces a community leaderboard.

**Alignment:** SDG 12 — Responsible Consumption and Production.

**Scope:**
- React + Tailwind CSS frontend (mobile-first, green/eco theme, light + dark mode)
- FastAPI (Python) backend serving ML classification and Gemini API disposal tips
- EfficientNetB0 fine-tuned via transfer learning on a public waste dataset (e.g. TrashNet / TACO / Garbage Classification on Kaggle)
- Google Gemini API (server-side) for rich disposal guidance; model name configurable via `GEMINI_MODEL` env var (default: `gemini-1.5-flash`)
- Gemini responses contain **structured JSON** (disposal steps, tips, flags) **plus** a short conversational explanation paragraph
- Supabase (PostgreSQL + Storage) for user accounts, scan images, scan history, points, badges, leaderboard
- Authentication via Supabase Auth
- Gamification: points per scan, badge milestones, community leaderboard
- Carbon impact values sourced from documented life-cycle assessment (LCA) estimates (WRAP, EPA, IPCC)

**Non-goals:** Native mobile app, streaks/daily challenges, payment/monetisation features.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  Pages: Home · Scan · History · Leaderboard · Learn  │
│  Auth: Supabase Auth (JWT)                           │
└───────────────────────┬─────────────────────────────┘
                        │ REST (JSON + multipart)
┌───────────────────────▼─────────────────────────────┐
│                FastAPI Backend                       │
│  /classify   → ML model (EfficientNet)               │
│  /guidance   → Google Gemini API                     │
│  /history    → Supabase CRUD                         │
│  /leaderboard→ Supabase query                        │
│  /auth/*     → Supabase Auth proxy                   │
└───────────────────────┬─────────────────────────────┘
                        │
        ┌───────────────┴──────────────┐
        │                              │
┌───────▼────────┐          ┌──────────▼────────┐
│ Supabase/PgSQL │          │ Google Gemini API  │
│ Users · Scans  │          │ Disposal guidance  │
│ Points·Badges  │          │ Sustainability tips│
└────────────────┘          └───────────────────┘
```

---

## Waste Classification Taxonomy

| Category    | Sub-categories                                         |
|-------------|--------------------------------------------------------|
| Paper       | Newspaper, cardboard, office paper, tissue             |
| Plastic     | PET bottle, HDPE, PVC, Styrofoam, plastic bag          |
| Glass       | Clear glass, colored glass, broken glass               |
| Metal       | Aluminium can, steel can, foil                         |
| Food/Organic| Fruit peel, cooked food, garden waste                  |
| E-Waste     | Phone, charger, battery, circuit board                 |
| Medical     | Masks, syringes, medicine packaging                    |
| Hazardous   | Paint, solvent, chemical containers                    |
| Textile     | Clothing, shoes, fabric scraps                         |
| General     | Mixed / unrecognised                                   |

---

## Database Schema (Supabase/PostgreSQL)

```
users          — id, email, username, avatar_url, created_at
scans          — id, user_id, image_path, category, sub_category, confidence,
                 carbon_kg, disposal_guidance, created_at
                 (image_path stores the Storage object path, NOT a public URL;
                  a signed URL is generated on-demand per request)
points         — id, user_id, total_points, updated_at
badges         — id, name, description, icon_url, threshold_points
user_badges    — id, user_id, badge_id, awarded_at
```

**Storage security model:**
- Bucket `scan-images` is **private** (not public)
- Storage policy: authenticated users may `INSERT` and `SELECT` only objects whose path begins with their own `auth.uid()`
- Signed URLs (`createSignedUrl`, TTL 3600 s) are generated server-side by FastAPI before returning scan records to the frontend; they are never stored in the database

---

## Sub-Tasks

---

### Sub-Task 1 — Project Scaffolding & Monorepo Setup

**Status:** `[x] done`

**Intent:**
Establish the repository structure, tooling, and configuration for both the frontend and backend so that all subsequent sub-tasks have a working foundation to build upon.

**Expected Outcomes:**
- `/frontend` — Vite + React 18 + Tailwind CSS 3 project initialised
- `/backend` — FastAPI project with virtual-env, `requirements.txt`, and working `uvicorn` server
- Root `README.md` with setup instructions
- `.env.example` files for both frontend and backend documenting all required secrets
- CORS configured in FastAPI to allow the React dev server
- Tailwind configured with a custom green/eco color palette and dark-mode class strategy

**Todo List:**
1. Create root `README.md` with project overview, SDG alignment, and quick-start instructions.
2. Scaffold `/frontend` with Vite (`react-ts` template) and install Tailwind CSS, PostCSS, Autoprefixer.
3. Configure `tailwind.config.ts` with custom eco color palette (`eco-green`, `eco-teal`, `eco-earth`) and `darkMode: 'class'`.
4. Install frontend dependencies: `react-router-dom`, `axios`, `@supabase/supabase-js`, `lucide-react`, `framer-motion`, `react-hot-toast`.
5. Create `/frontend/.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`.
6. Scaffold `/backend` with FastAPI: create `main.py`, `requirements.txt` (fastapi, uvicorn, python-multipart, pillow, tensorflow/torch, google-generativeai, supabase, python-dotenv, pydantic).
7. Create `/backend/.env.example` with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `GEMINI_API_KEY`, `MODEL_PATH`.
8. Configure CORS middleware in `main.py` for `http://localhost:5173`.
9. Add root `.gitignore` covering `node_modules`, `__pycache__`, `.env`, `venv`, model weight files.

**Relevant Context:** Greenfield — no existing files. Standard Vite + FastAPI monorepo pattern.

---

### Sub-Task 2 — Supabase Schema & Authentication

**Status:** `[x] done`

**Intent:**
Set up the Supabase project schema (tables, RLS policies) and wire up Supabase Auth on the frontend with a clean login/signup UI, so all subsequent features can operate under an authenticated user context.

**Expected Outcomes:**
- SQL migration file at `/backend/db/migrations/001_initial_schema.sql` creating all five tables with RLS policies
- SQL migration file at `/backend/db/migrations/002_storage_policies.sql` creating the private `scan-images` bucket and per-user Storage access policies
- `/frontend/src/lib/supabaseClient.ts` initialising the Supabase JS client
- `/frontend/src/contexts/AuthContext.tsx` providing `user`, `signIn`, `signUp`, `signOut`
- `LoginPage` and `SignupPage` components with form validation and toast feedback
- Protected route wrapper `<PrivateRoute>` redirecting unauthenticated users to `/login`
- `AuthGuard` on all backend FastAPI endpoints verifying the Supabase JWT

**Todo List:**
1. Write `001_initial_schema.sql` creating tables: `users`, `scans`, `points`, `badges`, `user_badges` with foreign keys and timestamps; `scans.image_path` stores the Storage object path (e.g. `{user_id}/{scan_id}.jpg`), not a URL.
2. Add RLS policies on all tables: users can only `SELECT`/`INSERT`/`UPDATE` their own rows in `scans`, `points`, `user_badges`.
3. Write `002_storage_policies.sql` — create `scan-images` bucket with `public = false`; add Storage RLS policies: `INSERT` allowed when `auth.uid()::text = (storage.foldername(name))[1]`; `SELECT` allowed for the same owner check (used for signed-URL generation server-side).
4. Create `/frontend/src/lib/supabaseClient.ts` using env vars.
5. Build `AuthContext` with `useSession` hook and `onAuthStateChange` listener.
6. Build `LoginPage` — email/password form, Google OAuth button (Supabase provider), error/loading states.
7. Build `SignupPage` — username + email + password, confirms email verification flow.
8. Create `PrivateRoute` HOC/wrapper component.
9. Add FastAPI `get_current_user` dependency that decodes the `Authorization: Bearer <jwt>` header via Supabase.

**Relevant Context:** Supabase JS v2 client; FastAPI dependency injection pattern for auth.

---

### Sub-Task 3 — ML Model Training & Classification Backend

**Status:** `[x] done`

**Intent:**
Fine-tune an EfficientNetB0 model on a public waste dataset, export the trained weights, and build the `/classify` FastAPI endpoint that loads the model at startup and classifies uploaded images, returning category, sub-category, confidence, and carbon impact.

**Expected Outcomes:**
- `/backend/training/train.py` — full fine-tuning script using Keras Transfer Learning on TrashNet/Kaggle Garbage Classification dataset; outputs `waste_classifier.h5`
- `/backend/training/dataset_prep.py` — downloads and preprocesses the dataset, maps labels to the 10-category taxonomy
- `/backend/models/model_loader.py` — loads `waste_classifier.h5` once at startup; exposes `predict(image_bytes)` helper
- `/backend/models/carbon_map.py` — documented carbon-saving estimates per category sourced from WRAP 2020, US EPA WARM model, and IPCC AR6 (citations included as comments); values in kg CO₂e saved per item vs landfill disposal
- `/backend/routers/classify.py` exposing `POST /classify` accepting `multipart/form-data`
- Response schema: `{ category, sub_category, confidence, carbon_kg, carbon_source_citation }` using Pydantic
- Model loads once at startup (FastAPI lifespan event), not per request

**Todo List:**
1. Create `/backend/training/dataset_prep.py` — download Kaggle Garbage Classification dataset via `kaggle` API or direct URL; remap its labels to the 10-category taxonomy; split into train/val/test sets (70/20/10).
2. Create `/backend/training/train.py` — build Keras model: `EfficientNetB0(include_top=False, weights='imagenet')` + GlobalAveragePooling + Dense(10, softmax); freeze base layers for 5 epochs then unfreeze top 30 layers for fine-tuning 10 epochs; save best weights to `waste_classifier.h5`; log accuracy and loss.
3. Create `/backend/models/carbon_map.py` — populate with documented LCA estimates (cite WRAP 2020 report, US EPA WARM model v16, IPCC AR6 Chapter 5); include `carbon_kg_saved` and `citation` fields per category.
4. Create `/backend/schemas/classify.py` — Pydantic `ClassifyResponse` with `category`, `sub_category`, `confidence`, `carbon_kg`, `carbon_source_citation`.
5. Create `/backend/models/model_loader.py` — loads model from `MODEL_PATH` env var; `preprocess(image_bytes)`: resize 224×224, `EfficientNetB0` preprocess_input; `predict` returns top-1 label + confidence.
6. Create `/backend/routers/classify.py` — `POST /classify`: receive `UploadFile` → read bytes → `model_loader.predict` → lookup `carbon_map` → return `ClassifyResponse`.
7. Register router and model lifespan startup in `main.py`.
8. Add `/backend/scripts/download_model.py` — utility to download a pre-exported `waste_classifier.h5` from a documented public URL (for users who skip training).

**Relevant Context:** TensorFlow/Keras `EfficientNetB0`; `PIL.Image`; FastAPI `UploadFile`; Kaggle Garbage Classification dataset (12,000 images, 12 classes — will be remapped to 10-category taxonomy).

---

### Sub-Task 4 — Gemini API Disposal Guidance Backend

**Status:** `[x] done`

**Intent:**
Build the `/guidance` FastAPI endpoint that calls Google Gemini (model name read from `GEMINI_MODEL` env var, defaulting to `gemini-1.5-flash`) and returns a response that combines structured JSON guidance fields with a short conversational explanation paragraph — with a static fallback if the API is unavailable.

**Expected Outcomes:**
- `/backend/routers/guidance.py` exposing `POST /guidance`
- Request body: `{ category, sub_category, location_hint? }`
- Gemini is called with a prompt that explicitly requests a JSON block **and** a 2–3 sentence plain-language explanation; response is parsed into both
- `GuidanceResponse` Pydantic schema: `{ disposal_steps[], sustainability_tips[], facility_type, recyclable, hazardous, explanation }` where `explanation` is the conversational paragraph
- `GEMINI_MODEL` env var drives `genai.GenerativeModel(model_name)` — no hard-coded model string anywhere in source
- Graceful fallback to `/backend/data/fallback_guidance.json` if Gemini API raises any exception
- Response cached per `(category, sub_category)` pair using `functools.lru_cache`

**Todo List:**
1. Add `GEMINI_MODEL` to `/backend/.env.example` with default value `gemini-1.5-flash` and a comment explaining how to switch models.
2. Create `/backend/schemas/guidance.py` — `GuidanceRequest` and `GuidanceResponse` Pydantic models (include `explanation: str` field).
3. Create `/backend/services/gemini_service.py` — read `GEMINI_MODEL` from env; initialise `genai.GenerativeModel`; define `build_prompt` that instructs Gemini to return a fenced JSON block followed by a plain-text explanation; implement `parse_response` that extracts both parts.
4. Create `/backend/data/fallback_guidance.json` — static data for all 10 categories (include `explanation` field for each).
5. Add `functools.lru_cache` wrapping the Gemini call; key on `(category, sub_category)`.
6. Create `/backend/routers/guidance.py` — `POST /guidance` wiring request → `gemini_service` (with fallback on exception) → `GuidanceResponse`.
7. Register router in `main.py`.

**Relevant Context:** `google-generativeai` Python SDK; `GEMINI_MODEL` env var; structured + conversational dual-output prompt pattern.

---

### Sub-Task 5 — Scan History, Image Storage & Points/Badges Backend

**Status:** `[x] done`

**Intent:**
Build the backend endpoints for uploading scan images to Supabase Storage, saving scan results to PostgreSQL, retrieving a user's scan history, and awarding points and badges based on scan milestones.

**Expected Outcomes:**
- `POST /scans` — accepts image file + classification result; uploads image to private `scan-images` bucket at path `{user_id}/{scan_id}.jpg` using the service-role key (bypasses RLS for upload); saves `image_path` (not a URL) on the scan record; awards points; returns updated points total and newly awarded badges
- `GET /scans` — returns paginated scan history for the authenticated user; for each scan, generates a short-lived signed URL (`createSignedUrl`, TTL 3600 s) via the Supabase Storage API and returns it as `image_signed_url` — this field is **never** stored in the database
- `GET /leaderboard` — returns top-N users by total points (no image URLs involved)
- Points logic: +10 per scan, +20 bonus for hazardous, +15 bonus for e-waste categories
- Badge award logic: thresholds at 50, 200, 500, 1000 points — checked and inserted transactionally after each scan
- Bucket `scan-images` is **private**; Storage RLS policies restrict object access to the owning user; service-role key used server-side for upload and signed-URL generation

**Todo List:**
1. Create `/backend/schemas/scan.py` — `ScanCreate` (stores `image_path`), `ScanResponse` (includes `image_signed_url: str`), `LeaderboardEntry` Pydantic models.
2. Create `/backend/services/supabase_service.py` — wraps Supabase Python client (service-role key) for: `upload_scan_image(user_id, scan_id, image_bytes)` → returns `image_path`; `create_signed_url(image_path, ttl=3600)` → returns temporary URL; `insert_scan(...)`, `upsert_points(...)`, `award_badges(...)`, `fetch_history(user_id, page, page_size)` (generates signed URL per row), `fetch_leaderboard(limit)`.
3. Create `/backend/services/points_service.py` — `calculate_points(category)` and `check_and_award_badges(user_id, new_total)` functions.
4. Create `/backend/routers/scans.py` — `POST /scans`: upload image → insert scan with `image_path` → award points/badges → return `ScanResponse` with fresh signed URL; `GET /scans`: fetch history rows → generate signed URL per row → return list.
5. Create `/backend/routers/leaderboard.py` — `GET /leaderboard` endpoint (public, no image URLs).
6. Register routers in `main.py`.

**Relevant Context:** Supabase Python client `supabase-py` with service-role key for Storage operations; `create_signed_url` method; FastAPI `Depends(get_current_user)` for auth.

---

### Sub-Task 6 — Frontend Core Layout & Routing

**Status:** `[x] done`

**Intent:**
Build the shell of the React application: navigation, routing, dark-mode toggle, and the shared layout components so that all feature pages can be dropped in cleanly.

**Expected Outcomes:**
- `App.tsx` with `react-router-dom` v6 routes for all pages
- `<Navbar>` — logo, nav links, dark-mode toggle, user avatar/logout
- `<Footer>` — SDG 12 badge, links
- `<Layout>` wrapper used by all pages
- Dark mode implemented via Tailwind `class` strategy toggled by a context `ThemeContext`
- Mobile-first responsive nav with hamburger menu on small screens
- `NotFoundPage` (404) component

**Todo List:**
1. Create `/frontend/src/contexts/ThemeContext.tsx` — persists dark/light preference to `localStorage`.
2. Build `<Navbar>` component with eco branding, responsive hamburger, dark-mode toggle button.
3. Build `<Footer>` component.
4. Build `<Layout>` wrapper.
5. Define all routes in `App.tsx` using `<PrivateRoute>` where authentication is required.
6. Create placeholder page components for: `HomePage`, `ScanPage`, `HistoryPage`, `LeaderboardPage`, `LearnPage`, `ProfilePage`.
7. Add `NotFoundPage`.

**Relevant Context:** `react-router-dom` v6 nested routes; Tailwind `dark:` variants; `lucide-react` icons.

---

### Sub-Task 7 — Scan Page (Core AI Feature)

**Status:** `[x] done`

**Intent:**
Build the primary user-facing feature: the Scan page where users upload or capture a waste item photo, see the AI classification result, receive disposal guidance, and view their carbon impact — all in a single cohesive flow.

**Expected Outcomes:**
- `ScanPage` with three states: **Upload**, **Analysing** (loading), **Result**
- Upload zone supporting drag-and-drop and file picker; camera capture on mobile (`capture="environment"`)
- Image preview before submission
- Calls `POST /classify` then `POST /guidance` sequentially
- Result card showing: category icon + label, confidence bar, disposal steps, sustainability tips, carbon saved badge, recyclable/hazardous flags
- "Save Scan" button calling `POST /scans` and showing points awarded toast
- Animated transitions between states using Framer Motion

**Todo List:**
1. Create `/frontend/src/api/classifyApi.ts` and `guidanceApi.ts` — typed Axios wrappers for backend endpoints.
2. Build `<UploadZone>` component — drag-and-drop, file input, camera capture, image preview.
3. Build `<AnalysingLoader>` animated spinner/skeleton component.
4. Build `<ResultCard>` — category icon, confidence progress bar, disposal steps list, carbon badge, recyclable/hazardous chips.
5. Build `<DisposalSteps>` — numbered list with icons per step.
6. Assemble `ScanPage` orchestrating state machine: idle → uploading → classifying → guidance → result.
7. Integrate "Save Scan" action with toast feedback (react-hot-toast) and points display.
8. Add Framer Motion slide/fade transitions between states.

**Relevant Context:** Axios; `FormData` for multipart upload; Framer Motion `AnimatePresence`; Tailwind eco colour classes.

---

### Sub-Task 8 — History, Leaderboard & Profile Pages

**Status:** `[x] done`

**Intent:**
Build the pages that display a user's past scans, the community leaderboard, and their profile with earned badges — completing the gamification loop.

**Expected Outcomes:**
- `HistoryPage` — paginated list of past scans with thumbnail, category, date, carbon saved; click to expand details
- `LeaderboardPage` — ranked list of top users with avatars, points, highlight for current user; refreshes every 30 s
- `ProfilePage` — username, total points, badges earned (with locked/unlocked states), total carbon saved summary
- All pages handle loading skeletons and empty states gracefully

**Todo List:**
1. Create `/frontend/src/api/scansApi.ts` and `leaderboardApi.ts` typed wrappers.
2. Build `<ScanHistoryCard>` component — thumbnail, category chip, date, carbon saved, expandable detail drawer.
3. Build `HistoryPage` with infinite scroll or page buttons.
4. Build `<LeaderboardRow>` component — rank medal, avatar, username, points.
5. Build `LeaderboardPage` with auto-refresh interval.
6. Build `<BadgeCard>` component — badge icon, name, description, locked overlay.
7. Build `ProfilePage` — stats summary cards, badge grid.

**Relevant Context:** Supabase `scans` and `points` tables; `GET /scans`, `GET /leaderboard` endpoints.

---

### Sub-Task 9 — Learn / Educational Content Page

**Status:** `[x] done`

**Intent:**
Build a static-but-engaging educational hub that teaches users about waste categories, recycling symbols, SDG 12 context, and eco tips — reinforcing the app's sustainability mission.

**Expected Outcomes:**
- `LearnPage` with tabbed sections: Waste Guide · Recycling Symbols · SDG 12 · Eco Tips
- Waste Guide: card grid for each of the 10 waste categories with description, do/don't list, disposal icon
- Recycling Symbols: visual grid of common recycling codes with explanations
- SDG 12 section: brief intro, key facts, how EcoSort AI contributes
- Eco Tips: rotating tip cards (randomised on load)
- All content sourced from a `/frontend/src/data/learnContent.ts` static data file

**Todo List:**
1. Create `/frontend/src/data/learnContent.ts` — typed content arrays for all four sections.
2. Build `<WasteCategoryCard>` — icon, name, do/don't lists, disposal tag.
3. Build `<RecyclingSymbolGrid>` component.
4. Build `<EcoTipCarousel>` — random rotation with Framer Motion.
5. Build `<SDG12Section>` — fact cards and mission alignment text.
6. Assemble `LearnPage` with tab navigation.

**Relevant Context:** Pure frontend static content; no API calls needed; Tailwind prose styles for rich text.

---

### Sub-Task 10 — Polish, Accessibility & Deployment Config

**Status:** `[x] done`

**Intent:**
Apply final polish: ensure the app is fully accessible (WCAG AA), passes Lighthouse checks, has proper meta tags, and produce deployment configuration files for both frontend (Vercel/Netlify) and backend (Docker + Railway/Render).

**Expected Outcomes:**
- All interactive elements have ARIA labels; colour contrast meets WCAG AA
- `<head>` meta tags: OG image, description, theme-color set to eco green
- `vercel.json` (or `netlify.toml`) for frontend deployment with SPA redirect rule
- `/backend/Dockerfile` for containerised FastAPI deployment
- `docker-compose.yml` at root for local full-stack development
- `README.md` updated with full deployment guide
- Environment variable documentation complete

**Todo List:**
1. Audit all interactive components for ARIA labels and keyboard navigation.
2. Add `index.html` meta tags: description, OG, twitter card, theme-color.
3. Create `/frontend/vercel.json` with `rewrites` rule for SPA routing.
4. Create `/backend/Dockerfile` — Python 3.11 slim image, install deps, run uvicorn.
5. Create root `docker-compose.yml` — `frontend` (node:20), `backend` (python:3.11-slim) services.
6. Final README update: architecture diagram reference, env var table, deployment steps.

**Relevant Context:** Vite build output `dist/`; FastAPI production: `uvicorn main:app --host 0.0.0.0 --port 8000`.

---

## Implementation Order

```
1 → Scaffolding
2 → Auth + DB schema
3 → ML Classification backend
4 → Gemini Guidance backend
5 → Scan history + points backend
6 → Frontend shell + routing
7 → Scan page (core feature)
8 → History + leaderboard + profile
9 → Learn page
10 → Polish + deployment
```

Each sub-task is independent once its predecessors are complete.
