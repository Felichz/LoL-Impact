"""Packages the minimum needed to serve without the full dataset (Vercel deploy).

    python -m app.build_assets

Copies the model and champion tags to app/assets/ and summarizes the
gold_adv distribution by (role, landmark) as quantiles, so percentiles can
be computed without loading the 130MB CSV or pandas in production.
"""
import json
import os
import shutil

import numpy as np
import pandas as pd

from .paths import ASSETS_DIR, DATA_DIR

QUANTILES = 201  # every 0.5 percentile


def main():
    os.makedirs(ASSETS_DIR, exist_ok=True)
    shutil.copy(os.path.join(DATA_DIR, "models", "model_v3_full.json"),
                os.path.join(ASSETS_DIR, "model_v3_full.json"))
    shutil.copy(os.path.join(DATA_DIR, "LAS", "ddragon_tags.json"),
                os.path.join(ASSETS_DIR, "ddragon_tags.json"))

    df = pd.read_csv(os.path.join(DATA_DIR, "LAS", "snowball_features_emerald.csv"),
                     usecols=["role", "landmark", "gold_adv"])
    probs = np.linspace(0, 1, QUANTILES)
    out = {}
    for (role, lm), s in df.groupby(["role", "landmark"])["gold_adv"]:
        q = np.quantile(s.to_numpy(), probs)
        out[f"{role}:{lm}"] = {"n": int(len(s)), "q": [round(float(v), 1) for v in q]}
    with open(os.path.join(ASSETS_DIR, "gold_quantiles.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, separators=(",", ":"))
    print(f"assets: model, tags and {len(out)} distributions ({QUANTILES} quantiles)")


if __name__ == "__main__":
    main()
