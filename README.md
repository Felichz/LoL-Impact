# LoLImpact

Analisis de partidas de LoL con modelos propios (win probability por
landmark con incertidumbre honesta).

## Estructura
- `backend/` — FastAPI: cliente Riot multi-clave, modelo v3 servible, analisis
- `frontend/` — Vite + Svelte 5 + TypeScript, gráficos SVG propios (sin ECharts)
- `backend/data/` — datasets, modelos y cache (NO se commitea; 36GB)

## Deploy en Vercel
El repo ya está preparado (`vercel.json`): el frontend se compila a estático y
`api/index.py` expone la app FastAPI como función Python en `/api/*`.

1. Importar el repo en vercel.com (sin cambiar framework ni comandos: los toma de `vercel.json`).
2. Variable de entorno `RIOT_API_KEY` (una o varias claves separadas por coma).
   Las claves de desarrollo caducan en 24h: actualizarla y hacer redeploy.

En Vercel no está el dataset de 36GB: se sirve con `backend/app/assets/`
(modelo, tags y cuantiles de oro). Tras re-entrenar, regenerarlos con
`python -m app.build_assets` (desde `backend/`) y commitear. La caché de
partidas vive en `/tmp` de cada instancia, así que la primera carga de un
perfil en una instancia fría tarda más.

## Uso local
```
cd backend
python -m app.train_final     # re-entrenar modelo (opcional)
python -m app.build_index     # indice de partidas por jugador
python -m uvicorn app.main:app --port 8000
```
Frontend (una vez, y tras cada cambio de UI):
```
cd frontend
npm install
npm run build        # genera frontend/dist, que sirve FastAPI
```
Abrir http://localhost:8000 — cargar el perfil (LP Felix#LAS).

Desarrollo de la UI con recarga en caliente: `npm run dev` en `frontend/`
(http://localhost:5173, redirige `/api` al backend en el puerto 8000).
Un perfil se puede compartir con `?rid=Nombre%23TAG&region=LAS`.

Claves de la API en `backend/data/.key` (una por linea, formato RGAPI-...).
Caducan en 24h: regenerarlas en developer.riotgames.com.

## Principios de la UI
- Ningun numero sin su intervalo (IC de credibilidad, no frecuentista)
- Tres estados: identificado / IC cubre 0 / sin datos
- Todo lo de campeones es a nivel de CLASE (rol + tags): los campeones
  individuales no son identificables con este tamano de datos (ver analisis
  SVD en el historial del proyecto)
- Atribuciones correlacionales, no causales

No afiliado ni respaldado por Riot Games.
