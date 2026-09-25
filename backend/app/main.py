"""LoLImpact — backend FastAPI.

Endpoints:
  GET  /api/health
  GET  /api/profile?riot_id=LP Felix&region=LAS
  GET  /api/match/{region}/{matchId}
  POST /api/draft          {"blue": {rol: champ...}, "red": {...}}
  GET  /                     (frontend)
"""
import json
import os
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import analysis, build_index
from .features import ROLES, TAG_KEYS, champ_tags
from .riot import RiotClient, load_json, resolve_riot_id, save_json

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
CACHE_DIR = os.path.join(DATA_DIR, "cache")
FRONTEND = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
QUEUE_SOLOQ = 420

app = FastAPI(title="LoLImpact", version="0.1")
client = RiotClient()

# stats personales con bootstrap por partida (mismo principio que el modelo)
import random
import statistics


def match_from_cache(match_id):
    for sub in ("matches", "matches_emerald", "draft_matches"):
        p = os.path.join(DATA_DIR, "LAS", sub, f"{match_id}.json")
        m = load_json(p)
        if m:
            return m
    return None


def timeline_from_cache(match_id):
    return load_json(os.path.join(DATA_DIR, "LAS", "timelines", f"{match_id}.json"))


def fetch_match(match_id, region="LAS"):
    m = match_from_cache(match_id)
    if m is not None:
        return m
    m = client.get(client.url(region, f"/lol/match/v5/matches/{match_id}"))
    if m and m.get("info", {}).get("queueId") == QUEUE_SOLOQ:
        save_json(os.path.join(CACHE_DIR, "matches", f"{match_id}.json"), m)
        return m
    return None


def fetch_timeline(match_id, region="LAS"):
    tl = timeline_from_cache(match_id)
    if tl is not None:
        return tl
    tl = client.get(client.url(region, f"/lol/match/v5/matches/{match_id}/timeline"))
    if tl:
        save_json(os.path.join(CACHE_DIR, "timelines", f"{match_id}.json"), tl)
    return tl


@app.get("/api/health")
def health():
    return {"ok": True, "claves_vivas": len(client.alive),
            "claves_muertas": len(client.dead),
            "modelo": analysis.model().get("version")}


@app.get("/api/profile")
def profile(riot_id: str, region: str = "LAS"):
    name, _, tag = riot_id.partition("#")
    tag = tag or region
    cache_p = os.path.join(CACHE_DIR, f"profile_{name.lower().replace(' ', '')}.json")
    cached = load_json(cache_p)

    # 1) fuente API (si hay claves)
    match_ids = []
    puuid = None
    if client.alive:
        puuid, key = resolve_riot_id(client, name, tag)
        if puuid:
            ml = client.get(client.url(
                region, f"/lol/match/v5/matches/by-puuid/{puuid}/ids"
                        f"?queue={QUEUE_SOLOQ}&count=20"), key=key)
            match_ids = ml or []
    # 2) fallback/merge: indice local por riot-id
    local_ids = build_index.lookup(name)
    seen = set()
    all_ids = [m for m in (match_ids + local_ids) if not (m in seen or seen.add(m))]

    if not all_ids and cached:
        return {**cached, "degradado": True, "motivo": "sin claves ni cache nuevo"}
    if not all_ids:
        raise HTTPException(404, "sin datos: ni API viva ni partidas en cache")

    matches = []
    patrones = []
    for mid in all_ids[:20]:
        m = fetch_match(mid, region)
        if not m:
            continue
        me = next((p for p in m["info"]["participants"]
                   if (p.get("riotIdGameName") or "").lower() == name.lower()), None)
        if me is None:
            continue
        entry = {
            "match_id": mid, "champ": me["championName"], "role": me["teamPosition"],
            "win": bool(me["win"]),
            "side": "blue" if me["teamId"] == 100 else "red",
            "kda": [me["kills"], me["deaths"], me["assists"]],
            "duration_min": round(m["info"]["gameDuration"] / 60),
            "patch": ".".join(m["info"]["gameVersion"].split(".")[:2]),
        }
        tl = fetch_timeline(mid, region)
        if tl:
            from .features import match_rows
            from .analysis import winprob_curve
            rows = match_rows(m, tl)
            curve = winprob_curve(rows)
            mine = next((r for r in rows if r["landmark"] == 10), None)
            my_p = None
            if mine:
                my_p = next((p for p in mine["players"]
                             if p["name"].lower() == name.lower()), None)
            entry["curve"] = [{"m": c["landmark"], "p": c["p_blue"]}
                              for c in curve]
            if my_p and mine:
                entry["my_gold_adv_10"] = round(my_p["gold_adv"])
                patrones.append({"win": entry["win"],
                                 "gold_adv_10": round(my_p["gold_adv"])})
        matches.append(entry)

    # patron personal con bootstrap (n pocas partidas -> IC ancho y visible)
    patron = None
    if len(patrones) >= 6:
        wins = [p["gold_adv_10"] for p in patrones if p["win"]]
        loss = [p["gold_adv_10"] for p in patrones if not p["win"]]
        rng = random.Random(7)

        def boot(vals):
            if not vals:
                return None, None, None
            means = [statistics.fmean(rng.choices(vals, k=len(vals)))
                     for _ in range(1000)]
            means.sort()
            return round(statistics.fmean(vals)), round(means[50]), round(means[949])

        w_mean, w_lo, w_hi = boot(wins)
        l_mean, l_lo, l_hi = boot(loss)
        patron = {"wins": {"n": len(wins), "mean": w_mean, "lo": w_lo, "hi": w_hi},
                  "losses": {"n": len(loss), "mean": l_mean, "lo": l_lo, "hi": l_hi}}

    out = {"riot_id": riot_id, "puuid": puuid,
           "api_viva": bool(client.alive), "matches": matches, "patron": patron}
    save_json(cache_p, out)
    return out


@app.get("/api/match/{region}/{match_id}")
def match_detail(region: str, match_id: str):
    m = fetch_match(match_id, region)
    if not m:
        raise HTTPException(404, "partida no encontrada ni cacheada")
    tl = fetch_timeline(match_id, region)
    if not tl:
        raise HTTPException(503, "timeline no disponible (claves muertas y sin cache)")
    return analysis.analyze_match(m, tl)


class Draft(BaseModel):
    blue: dict
    red: dict


@app.post("/api/draft")
def draft(d: Draft):
    import math as _m
    L = analysis.model()["landmarks"].get("10") or analysis.model()["landmarks"]["8"]
    beta = L["coefs"]
    order = L["col_order"]
    cov = {a: {b: cov_m for b, cov_m in zip(order, row)}
           for a, row in zip(order, (r for r in L["cov"]))}

    def conv(champ, role):
        nm_rol = f"rol_gold:{role}"
        parts = [beta.get(nm_rol, 0.0)]
        tags = champ_tags(champ)
        se2 = cov.get(nm_rol, {}).get(nm_rol, 0.0)
        for t in tags:
            parts.append(beta.get(f"tag_gold:{t}", 0.0))
        slope = sum(parts)
        var = cov.get(nm_rol, {}).get(nm_rol, 0.0)
        # aproximacion conservadora: suma de varianzas de rol y tags
        for t in tags:
            var += cov.get(f"tag_gold:{t}", {}).get(f"tag_gold:{t}", 0.0)
        # betas ya estan en unidades de k-oro -> pp por 1000g = beta * 25
        se = _m.sqrt(max(var, 0.0)) * 25
        pp = slope * 25
        return {"champ": champ, "role": role, "tags": tags,
                "pp_por_1000g": round(pp, 1), "se": round(se, 1),
                "identificado": bool(abs(pp) > 1.96 * se)}

    out = {"blue": [conv(d.blue[r], r) for r in ROLES if d.blue.get(r)],
           "red": [conv(d.red[r], r) for r in ROLES if d.red.get(r)],
           "nota": ("conversión por CLASE (rol + tags); la instancia concreta "
                    "no es distinguible de su clase con los datos actuales"),
           "tags_identificables": [t for t in TAG_KEYS
                                   if abs(beta.get(f"tag_gold:{t}", 0)) > 0]}
    return out


app.mount("/static", StaticFiles(directory=FRONTEND), name="static")


@app.get("/")
def index():
    return FileResponse(os.path.join(FRONTEND, "index.html"))
