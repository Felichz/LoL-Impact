# LoLImpact

Analysis of League of Legends games with custom models (win probability per
landmark with honest uncertainty).

## Structure
- `backend/` — FastAPI: multi-key Riot client, v3 servable model, analysis
- `frontend/` — Vite + Svelte 5 + TypeScript, custom SVG charts (no ECharts)
- `backend/data/` — datasets, models and cache (NOT committed; 36GB)

## Deploy to Vercel
The repo is already configured (`vercel.json`): the frontend builds to static files and
`api/index.py` exposes the FastAPI app as a Python function on `/api/*`.

1. Import the repo on vercel.com (do not change framework or commands: they are read from `vercel.json`).
2. Environment variable `RIOT_API_KEY` (one or multiple keys separated by comma).
   Development keys expire every 24h: update them and redeploy.

Vercel does not host the 36GB dataset: it is served from `backend/app/assets/`
(model, tags and gold quantiles). After retraining, regenerate them with
`python -m app.build_assets` (from `backend/`) and commit. The match cache
lives in `/tmp` on each instance, so the first profile load on a cold instance takes longer.

## Local usage
```
cd backend
python -m app.train_final     # retrain model (optional)
python -m app.build_index     # match index by player
python -m uvicorn app.main:app --port 8000
```
Frontend (once, and after each UI change):
```
cd frontend
npm install
npm run build        # generates frontend/dist, served by FastAPI
```
Open http://localhost:8000 — load the profile (LP Felix#LAS).

UI development with hot reload: `npm run dev` in `frontend/`
(http://localhost:5173, proxies `/api` to backend on port 8000).
A profile can be shared with `?rid=Name%23TAG&region=LAS`.

API keys in `backend/data/.key` (one per line, format RGAPI-...).
They expire every 24h: regenerate them at developer.riotgames.com.

## UI Principles
- No number without its interval (credibility interval, not frequentist)
- Three states: identified / interval covers 0 / no data
- Everything champion-related is at the CLASS level (role + tags): individual
  champions are not identifiable with this dataset size (see SVD analysis
  in project history)
- Attributions are correlational, not causal

Not affiliated with or endorsed by Riot Games.
