"""Extraccion de features por landmark desde un match+timeline.

Misma logica que el pipeline (features_snowball.rows_from) pero autocontenida
para una partida: por (jugador, landmark) la ventaja de oro y CS contra la
media de los 10, kills/deaths acumuladas, rol, tags del campeon.
"""
import json
import os

from .paths import data_or_asset
LANDMARKS = [8, 10, 12, 15, 18, 20]
TAG_KEYS = ["Tank", "Fighter", "Mage", "Assassin", "Marksman", "Support"]
ROLES = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"]

_tags_cache = None


def tags_map():
    global _tags_cache
    if _tags_cache is None:
        path = data_or_asset(os.path.join("LAS", "ddragon_tags.json"), "ddragon_tags.json")
        _tags_cache = json.load(open(path, encoding="utf-8"))
    return _tags_cache


def champ_tags(champ):
    return [t for t in tags_map().get(champ, []) if t in TAG_KEYS]


def match_rows(match, tl):
    """[(landmark, {datos por jugador})] con reached según duración."""
    info = match["info"]
    frames = tl["info"]["frames"]
    patch = ".".join(info["gameVersion"].split(".")[:2])
    blue_win = int(any(p["win"] for p in info["participants"] if p["teamId"] == 100))
    out = []
    for m in LANDMARKS:
        if m >= len(frames):
            continue
        pf = frames[m]["participantFrames"]
        mean_gold = sum(p["totalGold"] for p in pf.values()) / len(pf)
        mean_cs = sum(p.get("minionsKilled", 0) + p.get("jungleMinionsKilled", 0)
                      for p in pf.values()) / len(pf)
        players = []
        for p in info["participants"]:
            pid = p["participantId"]
            me = pf[str(pid)]
            cs = me.get("minionsKilled", 0) + me.get("jungleMinionsKilled", 0)
            kills = deaths = 0
            for fr in frames[: m + 1]:
                for ev in fr.get("events", []):
                    if ev.get("type") == "CHAMPION_KILL":
                        if ev.get("killerId") == pid:
                            kills += 1
                        if ev.get("victimId") == pid:
                            deaths += 1
            players.append({
                "name": p.get("riotIdGameName") or p.get("riotIdName") or f"jugador{pid}",
                "champ": p["championName"],
                "role": p["teamPosition"],
                "side": "blue" if p["teamId"] == 100 else "red",
                "win": bool(p["win"]),
                "kills": kills, "deaths": deaths,
                "kda_final": (p["kills"], p["deaths"], p["assists"]),
                "gold_adv": me["totalGold"] - mean_gold,
                "cs_adv": cs - mean_cs,
                "gold": me["totalGold"],
                "tags": champ_tags(p["championName"]),
            })
        out.append({"landmark": m, "players": players,
                    "patch": patch, "blue_win": blue_win,
                    "duration_min": info["gameDuration"] / 60.0})
    return out
