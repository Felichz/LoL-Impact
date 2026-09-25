"""Cliente Riot API multi-clave para el backend de LoLImpact.

Adaptación standalone del cliente del pipeline: rate limit por clave,
round-robin, UA correcto, manejo de 403/404/400, guardado atómico y
anclaje de puuids a la clave que los emitió (cifrado por clave).
"""
import json
import os
import time
import threading
import urllib.error
import urllib.request
from collections import deque

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")
KEY_PATH = os.path.join(DATA_DIR, ".key")
ROUTING = {"LAS": "americas", "LAN": "americas", "NA": "americas",
           "EUW": "europe", "EUNE": "europe", "KR": "asia"}
PLATFORM = {"LAS": "la2", "LAN": "la1", "NA": "na1", "EUW": "euw1", "KR": "kr"}
MAX_PER_2MIN = 100
MAX_PER_SEC = 20


def load_keys():
    env = os.environ.get("RIOT_API_KEY", "").strip()
    if env:
        return [env]
    if os.path.exists(KEY_PATH):
        with open(KEY_PATH) as f:
            return [l.strip() for l in f if l.strip().startswith("RGAPI-")]
    return []


def load_json(path):
    if os.path.exists(path):
        try:
            with open(path, encoding="utf-8") as f:
                return json.load(f)
        except json.JSONDecodeError:
            return None
    return None


def save_json(path, obj):
    tmp = path + ".tmp"
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False)
    os.replace(tmp, path)


class RiotClient:
    def __init__(self, keys=None):
        self.keys = list(keys if keys is not None else load_keys())
        self.windows = {k: deque() for k in self.keys}
        self.dead = set()
        self._rr = 0
        self._lock = threading.Lock()

    @property
    def alive(self):
        return [k for k in self.keys if k not in self.dead]

    def url(self, region, path):
        routing = ROUTING.get(region, "americas")
        return f"https://{routing}.api.riotgames.com{path}"

    def _throttle(self, key):
        while True:
            with self._lock:
                now = time.time()
                w = self.windows[key]
                while w and now - w[0] >= 120:
                    w.popleft()
                if len(w) < MAX_PER_2MIN:
                    last = [t for t in w if now - t < 1.0]
                    if len(last) < MAX_PER_SEC:
                        w.append(time.time())
                        return
                    wait = 1.0 - (now - last[0]) + 0.05
                else:
                    wait = 120 - (now - w[0]) + 0.3
            time.sleep(wait)

    def _next(self):
        vivas = self.alive
        if not vivas:
            return None
        k = vivas[self._rr % len(vivas)]
        self._rr += 1
        return k

    def get(self, url, key=None):
        while True:
            k = key if (key and key not in self.dead) else self._next()
            if k is None:
                return None
            for attempt in range(4):
                self._throttle(k)
                req = urllib.request.Request(url, headers={
                    "X-Riot-Token": k,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) lolimpact/0.1",
                    "Accept": "application/json",
                })
                try:
                    with urllib.request.urlopen(req, timeout=30) as r:
                        raw = r.read().decode()
                    return json.loads(raw)
                except urllib.error.HTTPError as e:
                    if e.code == 404:
                        return None
                    if e.code == 429:
                        time.sleep(float(e.headers.get("Retry-After") or 5) + 1)
                        continue
                    if e.code == 401:
                        self.dead.add(k)
                        break
                    if e.code in (403, 400):
                        return None
                    if e.code >= 500:
                        time.sleep(min(2 ** attempt, 20))
                        continue
                    return None
                except (urllib.error.URLError, TimeoutError, json.JSONDecodeError):
                    time.sleep(min(2 ** attempt, 20))
                    continue
            if key:  # clave anclada y murio: no reintentar con otras
                return None


def resolve_riot_id(client, name, tag):
    """Cuenta por riot-id con la primera clave viva; devuelve (puuid, clave)."""
    from urllib.parse import quote
    for k in client.alive:
        acc = client.get(
            f"https://americas.api.riotgames.com/riot/account/v1/accounts/"
            f"by-riot-id/{quote(name)}/{quote(tag)}", key=k)
        if acc and acc.get("puuid"):
            return acc["puuid"], k
    return None, None
