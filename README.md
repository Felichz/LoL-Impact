# LoLImpact

Analisis de partidas de LoL con modelos propios (win probability por
landmark con incertidumbre honesta).

## Estructura
- `backend/` — FastAPI: cliente Riot multi-clave, modelo v3 servible, analisis
- `frontend/` — vanilla JS + ECharts, sin build step
- `backend/data/` — datasets, modelos y cache (NO se commitea; 36GB)

## Uso
```
cd backend
python -m app.train_final     # re-entrenar modelo (opcional)
python -m app.build_index     # indice de partidas por jugador
python -m uvicorn app.main:app --port 8000
```
Abrir http://localhost:8000 — cargar el perfil (LP Felix#LAS).

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
