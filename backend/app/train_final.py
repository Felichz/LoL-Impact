"""Entrena el modelo v3 COMPLETO (servible): betas + covarianza por landmark.

Igual diseño que train_snowball_v3 (roles + tags, unidades 1000g/50cs) pero
guarda TODO lo necesario para inferencia: intercepto, coeficientes de todas
las columnas (incluidos parches) y la covarianza de Laplace para propagar
bandas de incertidumbre con el metodo delta.

Uso: python -m app.train_final   (desde backend/)
"""
import hashlib
import json
import os

import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression

from .features import LANDMARKS, ROLES, TAG_KEYS, tags_map

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
FEAT = os.path.join(DATA_DIR, "LAS", "snowball_features_emerald.csv")
OUT = os.path.join(DATA_DIR, "models", "model_v3_full.json")
C_GRID = [0.03, 0.1, 0.3, 1.0, 3.0]


def build_matrix(d, matches):
    d = d.copy()
    d["g_k"] = d["gold_adv"] / 1000.0
    d["c_u"] = d["cs_adv"] / 50.0
    for t in TAG_KEYS:
        d[f"tv_{t}"] = d["champ"].map(lambda c: 1.0 if t in tags_map().get(c, []) else 0.0)
    blue = (d["side"] == "blue").to_numpy()
    mid = d["match_id"].to_numpy()
    idx = matches["match_id"]

    def diff(col, mask):
        b = col[mask].groupby(mid[mask]).sum()
        r = col[~mask].groupby(mid[~mask]).sum()
        return b.reindex(idx, fill_value=0.0) - r.reindex(idx, fill_value=0.0)

    cols, names = [], []
    for r_ in ROLES:
        sel = (d["role"] == r_).to_numpy()
        cols.append(diff(d["g_k"], blue & sel)); names.append(f"rol_gold:{r_}")
    for r_ in ROLES:
        sel = (d["role"] == r_).to_numpy()
        cols.append(diff(d["c_u"], blue & sel)); names.append(f"rol_cs:{r_}")
    for t in TAG_KEYS:
        cols.append(diff(d["tv_" + t] * d["g_k"], blue)); names.append(f"tag_gold:{t}")
    for t in TAG_KEYS:
        cols.append(diff(d["tv_" + t] * d["c_u"], blue)); names.append(f"tag_cs:{t}")

    Xp = pd.get_dummies(matches["patch"]).astype(float)
    M = np.hstack([np.column_stack([c.to_numpy(dtype=float) for c in cols]),
                   Xp.to_numpy(dtype=float)])
    names += [f"patch:{p}" for p in Xp.columns]
    y = matches["blue_win"].to_numpy().astype(int)
    return M, y, names


def main():
    df = pd.read_csv(FEAT, dtype={"patch": str})
    parches = sorted(df["patch"].unique(),
                     key=lambda p: tuple(int(x) for x in p.split(".")))
    keep = parches[-4:]
    df = df[df["patch"].isin(keep)].reset_index(drop=True)
    print(f"parches: {keep} | filas: {len(df)}")

    landmarks = {}
    for m in LANDMARKS:
        d = df[df["landmark"] == m]
        matches = (d[["match_id", "blue_win", "patch"]].drop_duplicates("match_id")
                   .sort_values("match_id").reset_index(drop=True))
        M, y, names = build_matrix(d, matches)
        n_test = int(len(M) * 0.15)
        n_val = int((len(M) - n_test) * 0.15)
        X_tr, y_tr = M[:-n_test - n_val], y[:-n_test - n_val]
        X_va, y_va = M[-n_test - n_val:-n_test], y[-n_test - n_val:-n_test]
        X_te, y_te = M[-n_test:], y[-n_test:]

        best, best_ll = None, None
        for C in C_GRID:
            mm = LogisticRegression(C=C, max_iter=8000).fit(X_tr, y_tr)
            from sklearn.metrics import log_loss
            ll = log_loss(y_va, mm.predict_proba(X_va)[:, 1])
            if best_ll is None or ll < best_ll:
                best, best_ll = C, ll
        model = LogisticRegression(C=best, max_iter=8000).fit(X_tr, y_tr)
        from sklearn.metrics import log_loss
        p_te = model.predict_proba(X_te)[:, 1]
        acc = float(((p_te > 0.5).astype(int) == y_te).mean())

        pp_tr = model.predict_proba(X_tr)[:, 1]
        W = pp_tr * (1 - pp_tr)
        Ht = (X_tr * W[:, None]).T @ X_tr + np.eye(X_tr.shape[1]) / best
        Minv = np.linalg.inv(Ht)

        landmarks[str(m)] = {
            "n_train": int(len(X_tr)), "C": best, "accuracy_test": acc,
            "intercept": float(model.intercept_[0]),
            "coefs": {nm: float(c) for nm, c in zip(names, model.coef_[0])},
            "cov": Minv.tolist(),
            "col_order": names,
            "log_loss_test": float(log_loss(y_te, p_te)),
        }
        print(f"min {m}: n={len(X_tr)} C={best} acc_test={acc:.3f}")

    h = hashlib.sha256()
    with open(FEAT, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    out = {
        "version": "v3-full", "region": "LAS",
        "tipo_intervalo": "IC de credibilidad de Laplace condicionado a C",
        "notas": "conversion por rol + tag; campeones individuales NO identificables",
        "parches": keep,
        "procedencia": {"features_sha256_16": h.hexdigest()[:16]},
        "landmarks": landmarks,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"modelo servible en {OUT}")


if __name__ == "__main__":
    main()
