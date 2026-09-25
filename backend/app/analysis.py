"""Analisis de partidas con el modelo v3 servible.

- Curva de win probability por landmark con banda de incertidumbre (delta).
- Waterfall de contribuciones por rol/tag con estado de identificabilidad
  por barra (solido = identificado, punteado = cubre cero).
- Percentiles descriptivos del oro por rol/landmark (referencia del dataset).
"""
import json
import math
import os

import numpy as np
import pandas as pd

from .features import LANDMARKS, ROLES, TAG_KEYS

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
MODEL_PATH = os.path.join(DATA_DIR, "models", "model_v3_full.json")
REF_PATH = os.path.join(DATA_DIR, "LAS", "snowball_features_emerald.csv")

_model = None
_ref = None


def sigmoid(x):
    return 1.0 / (1.0 + math.exp(-max(min(x, 30), -30)))


def model():
    global _model
    if _model is None:
        _model = json.load(open(MODEL_PATH, encoding="utf-8"))
    return _model


def reference():
    """Distribucion de gold_adv por (rol, landmark) para percentiles."""
    global _ref
    if _ref is None:
        df = pd.read_csv(REF_PATH, usecols=["role", "landmark", "gold_adv"])
        _ref = {k: np.sort(v.to_numpy())
                for k, v in df.groupby(["role", "landmark"])["gold_adv"]}
    return _ref


def percentile(role, landmark, gold_adv):
    arr = reference().get((role, landmark))
    if arr is None or len(arr) < 50:
        return None
    return float((arr < gold_adv).mean() * 100)


def _x_vector(lm, players, patch):
    """Vector de diseño para una partida (columnas del entrenamiento)."""
    L = model()["landmarks"][lm]
    order = L["col_order"]
    x = {nm: 0.0 for nm in order}
    blue = [p for p in players if p["side"] == "blue"]
    red = [p for p in players if p["side"] == "red"]

    def add(col, val):
        if col in x:
            x[col] += val

    for p in blue:
        add(f"rol_gold:{p['role']}", p["gold_adv"] / 1000.0)
        add(f"rol_cs:{p['role']}", p["cs_adv"] / 50.0)
        for t in p["tags"]:
            add(f"tag_gold:{t}", p["gold_adv"] / 1000.0)
            add(f"tag_cs:{t}", p["cs_adv"] / 50.0)
    for p in red:
        add(f"rol_gold:{p['role']}", -p["gold_adv"] / 1000.0)
        add(f"rol_cs:{p['role']}", -p["cs_adv"] / 50.0)
        for t in p["tags"]:
            add(f"tag_gold:{t}", -p["gold_adv"] / 1000.0)
            add(f"tag_cs:{t}", -p["cs_adv"] / 50.0)
    pk = f"patch:{patch}"
    if pk in x:
        x[pk] = 1.0
    return np.array([x[nm] for nm in order], dtype=float)


def winprob_curve(landmark_rows):
    """[(minuto, p_blue, lo, hi, contribuciones por rol/tag con flag)]."""
    out = []
    for row in landmark_rows:
        lm = str(row["landmark"])
        if lm not in model()["landmarks"]:
            continue
        L = model()["landmarks"][lm]
        x = _x_vector(lm, row["players"], row["patch"])
        beta = np.array([L["coefs"][nm] for nm in L["col_order"]])
        logit = L["intercept"] + float(x @ beta)
        cov = np.array(L["cov"])
        var = float(x @ cov @ x)
        se = math.sqrt(max(var, 0.0))
        p = sigmoid(logit)
        lo, hi = sigmoid(logit - 1.96 * se), sigmoid(logit + 1.96 * se)
        contribs = _contributions(row, beta, L["col_order"], cov)
        out.append({
            "landmark": row["landmark"], "p_blue": p, "lo": lo, "hi": hi,
            "confidence": L["accuracy_test"], "contribs": contribs,
        })
    return out


def _contributions(row, beta, order, cov):
    """Contribucion (pp) por rol con SE por barra -> estado por-barra.

    SE de (beta_r * val) con val fijo observado: aprox |val| * SE(beta_r).
    Identificado (solido) si |pp| > 1.96*SE; si no, punteado (cubre 0).
    """
    beta_map = {nm: b for nm, b in zip(order, beta)}
    idx = {nm: i for i, nm in enumerate(order)}
    out = []
    blue = [p for p in row["players"] if p["side"] == "blue"]
    red = [p for p in row["players"] if p["side"] == "red"]
    for r_ in ROLES:
        val = (sum(p["gold_adv"] for p in blue if p["role"] == r_)
               - sum(p["gold_adv"] for p in red if p["role"] == r_)) / 1000.0
        nm = f"rol_gold:{r_}"
        if nm not in idx:
            continue
        beta_r = beta_map[nm]
        se_beta = math.sqrt(max(cov[idx[nm], idx[nm]], 0.0))
        pp = beta_r * val * 25.0
        se_pp = se_beta * abs(val) * 25.0
        out.append({"rol": r_, "pp": float(pp), "se_pp": float(se_pp),
                    "identificado": bool(abs(pp) > 1.96 * se_pp),
                    "val_k": round(val, 2)})
    return out


def analyze_match(match, tl):
    from .features import match_rows
    rows = match_rows(match, tl)
    curve = winprob_curve(rows)
    players_out = []
    for row in rows:
        lm = row["landmark"]
        for p in row["players"]:
            players_out.append({
                "landmark": lm, "name": p["name"], "champ": p["champ"],
                "role": p["role"], "side": p["side"],
                "gold_adv": round(p["gold_adv"]), "cs_adv": round(p["cs_adv"]),
                "kills": p["kills"], "deaths": p["deaths"],
                "pct": percentile(p["role"], lm, p["gold_adv"]),
                "tags": p["tags"],
            })
    info = match["info"]
    me_first = info["participants"][0]
    return {
        "match_id": match["metadata"]["matchId"],
        "patch": rows[0]["patch"] if rows else "",
        "duration_min": round(info["gameDuration"] / 60),
        "blue_win": rows[0]["blue_win"] if rows else None,
        "curve": curve,
        "players": players_out,
        "final": [{"name": p.get("riotIdGameName") or "?", "champ": p["championName"],
                   "kda": [p["kills"], p["deaths"], p["assists"]],
                   "side": "blue" if p["teamId"] == 100 else "red",
                   "win": bool(p["win"]),
                   "damage": p["totalDamageDealtToChampions"]}
                  for p in info["participants"]],
    }
