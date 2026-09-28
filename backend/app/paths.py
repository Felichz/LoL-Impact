"""Shared backend paths.

- DATA_DIR: local datasets (36GB, not committed). May not exist (e.g. on Vercel).
- ASSETS_DIR: the minimum needed to serve, versioned (model, tags, gold quantiles).
  Regenerated with `python -m app.build_assets` after retraining.
- CACHE_DIR: writable cache. On Vercel the disk is read-only except /tmp.
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
    """Prefer the local dataset file (freshest); fall back to the versioned asset."""
    p = os.path.join(DATA_DIR, data_rel)
    return p if os.path.exists(p) else os.path.join(ASSETS_DIR, asset_name)
