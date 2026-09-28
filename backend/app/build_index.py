"""Match index by riot-id (no-API fallback).

Scans the cached JSON files and maps gameName -> [matchIds]. Built once
(python -m app.build_index) and updated as new matches are saved.
"""
import glob
import json
import os
from concurrent.futures import ThreadPoolExecutor

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
IDX_PATH = os.path.join(DATA_DIR, "cache", "index_by_player.json")


def scan_dir(sub):
    out = {}
    for f in glob.glob(os.path.join(DATA_DIR, "LAS", sub, "*.json")):
        try:
            with open(f, encoding="utf-8") as fh:
                m = json.load(fh)
            mid = m["metadata"]["matchId"]
            for p in m["info"]["participants"]:
                name = (p.get("riotIdGameName") or "").lower()
                if name:
                    out.setdefault(name, []).append(mid)
        except Exception:
            continue
    return out


def build():
    acc = {}
    with ThreadPoolExecutor(max_workers=8) as pool:
        for part in pool.map(scan_dir, ("matches", "matches_emerald", "draft_matches")):
            for k, v in part.items():
                acc.setdefault(k, []).extend(v)
    for k in acc:
        acc[k] = sorted(set(acc[k]), reverse=True)
    os.makedirs(os.path.dirname(IDX_PATH), exist_ok=True)
    with open(IDX_PATH, "w", encoding="utf-8") as f:
        json.dump(acc, f, ensure_ascii=False)
    print(f"index: {len(acc)} players, "
          f"{sum(len(v) for v in acc.values())} matches")
    return acc


def lookup(name):
    name = name.lower()
    if os.path.exists(IDX_PATH):
        idx = json.load(open(IDX_PATH, encoding="utf-8"))
        return idx.get(name, [])
    return []


if __name__ == "__main__":
    build()
