"""Rutas compartidas del backend.

- DATA_DIR: datasets locales (36GB, no se commitea). Puede no existir (p.ej. en Vercel).
- ASSETS_DIR: lo mínimo para servir, versionado (modelo, tags, cuantiles de oro).
  Se regenera con `python -m app.build_assets` tras re-entrenar.
- CACHE_DIR: caché escribible. En Vercel el disco es de solo lectura salvo /tmp.
"""
import os

APP_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(APP_DIR, "..", "data")
ASSETS_DIR = os.path.join(APP_DIR, "assets")

if os.environ.get("LOLIMPACT_CACHE_DIR"):
    CACHE_DIR = os.environ["LOLIMPACT_CACHE_DIR"]
elif os.environ.get("VERCEL"):
    CACHE_DIR = "/tmp/lolimpact-cache"
else:
    CACHE_DIR = os.path.join(DATA_DIR, "cache")


def data_or_asset(data_rel, asset_name):
    """Prefiere el archivo del dataset local (lo más fresco); si no, el asset versionado."""
    p = os.path.join(DATA_DIR, data_rel)
    return p if os.path.exists(p) else os.path.join(ASSETS_DIR, asset_name)
