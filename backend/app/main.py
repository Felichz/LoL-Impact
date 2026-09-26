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
from .paths import CACHE_DIR, DATA_DIR
from .riot import PLATFORM, RiotClient, load_json, resolve_riot_id, save_json
FRONTEND = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
QUEUE_SOLOQ = 420

app = FastAPI(title="LoLImpact", version="0.1")
client = RiotClient()

# stats personales con bootstrap por partida (mismo principio que el modelo)
import random
import statistics


def match_from_cache(match_id):
    # dataset local primero, luego la caché donde fetch_match guarda lo nuevo
    for p in [os.path.join(DATA_DIR, "LAS", sub, f"{match_id}.json")
              for sub in ("matches", "matches_emerald", "draft_matches")] + \
             [os.path.join(CACHE_DIR, "matches", f"{match_id}.json")]:
        m = load_json(p)
        if m:
            return m
    return None


def timeline_from_cache(match_id):
    for p in (os.path.join(DATA_DIR, "LAS", "timelines", f"{match_id}.json"),
              os.path.join(CACHE_DIR, "timelines", f"{match_id}.json")):
        tl = load_json(p)
        if tl:
            return tl
    return None


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


def _champ_id_map():
    """championId (int) -> nombre via Data Dragon, cacheado."""
    import urllib.request
    p = os.path.join(CACHE_DIR, "champions.json")
    m = load_json(p)
    if m:
        return m
    v = json.loads(urllib.request.urlopen(
        "https://ddragon.leagueoflegends.com/api/versions.json", timeout=20).read())[0]
    data = json.loads(urllib.request.urlopen(
        f"https://ddragon.leagueoflegends.com/cdn/{v}/data/es_ES/champion.json",
        timeout=20).read())["data"]
    m = {int(c["key"]): c["id"] for c in data.values()}
    save_json(p, m)
    return m


def _infer_roles(champs):
    """Rol sugerido por tags; el usuario puede corregirlo en la UI."""
    from .features import champ_tags
    taken = set()
    out = {}
    prioridad = [("UTILITY", lambda t: "Support" in t),
                 ("BOTTOM", lambda t: "Marksman" in t and "Support" not in t),
                 ("MIDDLE", lambda t: "Mage" in t or "Assassin" in t),
                 ("TOP", lambda t: "Tank" in t or "Fighter" in t)]
    for rol, test in prioridad:
        for c in champs:
            if c in out:
                continue
            if test(champ_tags(c)):
                out[c] = rol
                break
    for c in champs:
        if c not in out:
            out[c] = "JUNGLE"
    return out


@app.get("/api/live")
def live(riot_id: str, region: str = "LAS"):
    """Partida en curso: que lane rentan mas las kills tempranas.

    Asumcion explicita: 1 kill en linea = intercambio de ~600g en el
    diferencial (+300 asesino, -300 victima), sin placas ni EXP.
    """
    import math as _m
    name, _, tag = riot_id.partition("#")
    if not client.alive:
        raise HTTPException(503, "sin claves API vivas")
    puuid, key = resolve_riot_id(client, name, tag or region)
    if not puuid:
        raise HTTPException(404, "cuenta no encontrada")
    host = PLATFORM.get(region, "la2")
    game = client.get(
        f"https://{host}.api.riotgames.com/lol/spectator/v5/"
        f"active-games/by-summoner/{puuid}", key=key)
    if game is None:
        return {"en_partida": False,
                "mensaje": "No hay partida en curso para esa cuenta."}
    idmap = _champ_id_map()
    champs = {}
    for t in (100, 200):
        members = [idmap.get(p["championId"], f"?{p['championId']}")
                   for p in game["participants"] if p["teamId"] == t]
        champs["blue" if t == 100 else "red"] = members
    roles = {**_infer_roles(champs["blue"]), **_infer_roles(champs["red"])}

    L = analysis.model()["landmarks"].get("8") or analysis.model()["landmarks"]["10"]
    beta = L["coefs"]
    order = L["col_order"]
    cov = {a: dict(zip(order, row)) for a, row in zip(order, L["cov"])}

    def conv(champ, role):
        nm = f"rol_gold:{role}"
        tags = champ_tags(champ)
        slope = beta.get(nm, 0.0) + sum(beta.get(f"tag_gold:{t}", 0.0) for t in tags)
        var = cov.get(nm, {}).get(nm, 0.0) + sum(
            cov.get(f"tag_gold:{t}", {}).get(f"tag_gold:{t}", 0.0) for t in tags)
        se = _m.sqrt(max(var, 0.0)) * 25
        pp1000 = slope * 25
        return {"champ": champ, "role": role, "tags": tags,
                "pp1000": round(pp1000, 1), "se": round(se, 1),
                "kill1": round(pp1000 * 0.6, 1), "kill2": round(pp1000 * 1.2, 1),
                "se_kill2": round(se * 1.2, 1),
                "identificado": bool(abs(pp1000) > 1.96 * se)}

    out = {"en_partida": True, "gameMode": game.get("gameMode"),
           "minutos": round(game.get("gameLength", 0) / 60, 1),
           "nota": "1 kill temprana ≈ intercambio de 600g en la línea "
                   "(+300 asesino, −300 víctima), sin placas ni EXP. "
                   "Impacto por CLASE, min 8.",
           "blue": [], "red": []}
    me_team = next((p["teamId"] for p in game["participants"] if p["puuid"] == puuid), None)
    out["tu_lado"] = "blue" if me_team == 100 else "red"
    for side in ("blue", "red"):
        for c in champs[side]:
            out[side].append(conv(c, roles.get(c, "JUNGLE")))
    return out


# frontend compilado (cd frontend && npm run build); en desarrollo usar `npm run dev`
if os.path.isdir(os.path.join(FRONTEND, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND, "assets")), name="assets")


@app.get("/favicon.svg")
def favicon():
    return FileResponse(os.path.join(FRONTEND, "favicon.svg"))


@app.get("/")
def index():
    p = os.path.join(FRONTEND, "index.html")
    if not os.path.exists(p):
        raise HTTPException(503, "frontend sin compilar: cd frontend && npm install && npm run build")
    return FileResponse(p)
