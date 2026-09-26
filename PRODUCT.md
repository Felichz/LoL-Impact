# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated with a steer ("algo moderno pero light", Astro was floated): Vite + Svelte 5 + TypeScript, built to `frontend/dist` and served by FastAPI. Chosen over Astro because every view is client-side interactive (fetch, live state, charts) — an SPA, not a content site. Charts are hand-built SVG components instead of ECharts to keep the bundle light and fully on-brand.

## Users

The author (LP Felix#LAS) plus friends / duo partners who occasionally load their own Riot ID. Spanish-speaking, LAS region, Emerald+ ranked solo queue players. They know League deeply (roles, gold, CS, snowball) but are not statisticians.

## Product Purpose

LoLImpact explains what moved a player's ranked games using its own win-probability model trained on ~30k Emerald+ LAS matches. It answers three questions:

1. **Mis partidas** — after a game: how did my team's win probability evolve minute by minute (landmarks 8, 10, 12, 15, 18, 20), which lane moved it, and where did each player stand vs. their role.
2. **En vivo** — during loading screen / early game: which lanes' early kills are worth most (per champion class), so you know whom not to feed and where to invest.
3. **Draft** — pick 10 champions and see how much each one's gold "converts" into win probability (pp per 1000g), by class.

Success: a player understands in seconds whether a game was lost early or late, and which lane mattered — without being lied to about certainty.

## Positioning

Unlike stat sites (op.gg, u.gg), every number carries its uncertainty. The model shows credibility intervals, distinguishes "confirmed" effects from "indicative" ones (interval covers 0), and refuses to claim per-champion effects it cannot identify — everything champion-related is at the CLASS level (role + ddragon tags). Attributions are correlational, not causal.

## Operating Context

- Post-game review on a desktop monitor (primary for Mis partidas).
- Second screen / quick glance during loading screen (En vivo) and champ select (Draft).
- Riot API keys expire every 24h; the app often runs in degraded mode from local cache. The UI must handle: no live keys, cached-only profile, missing timelines, no game in progress.
- Local only: `uvicorn app.main:app --port 8000`.

## Capabilities and Constraints

- API: `GET /api/health`, `GET /api/profile?riot_id&region`, `GET /api/match/{region}/{id}`, `POST /api/draft`, `GET /api/live?riot_id&region`.
- Profile: up to 20 soloQ matches, each with a compact win-prob curve and gold diff @10; a personal "patrón" (gold @10 in wins vs losses with bootstrap ranges) when ≥6 matches.
- Match: curve with lo/hi band and model accuracy per landmark; per-lane contribution in pp with SE and identified flag; per-player per-landmark gold/cs vs lobby average, K/D so far, percentile vs role.
- Three evidence states everywhere: identified / interval covers 0 / no data.
- Champion data and icons from Riot Data Dragon (es_ES).
- Terminology: "pp" = puntos porcentuales de probabilidad de victoria; "landmark" = minuto evaluado; "clase" = rol + tags.

## Brand Commitments

- Name: LoLImpact. Spanish UI copy, natural language, from the user's perspective ("tu equipo").
- Must feel pro, modern and elegant. Must NOT feel gamer (neon, glow, RGB, aggressive fonts) nor generic/boring (corporate grey dashboard).
- Legal line: "LoLImpact no está afiliado ni respaldado por Riot Games."

## Evidence on Hand

- Real cached profiles in `backend/data/cache/profile_*.json`, real matches/timelines in `backend/data/LAS/`.
- Model file `backend/data/models/model_v3_full.json` (accuracy per landmark).
- No testimonials, users counts, or benchmarks — none to be invented.

## Product Principles

1. No number without its interval. Uncertainty is shown, never hidden for cleanliness.
2. Your perspective first: "tu equipo", your row, your side — always oriented to the loaded player.
3. Class, not champion: never imply per-champion precision the data cannot support.
4. Explain in place: every non-obvious metric has a plain-language explanation where it appears.
5. Degrade honestly: when keys are dead or data is cached, say so and keep working.

## Accessibility & Inclusion

Win/loss and ally/enemy must not rely on red/green alone (color-vision deficiency is common); pair color with shape, sign, or label.
