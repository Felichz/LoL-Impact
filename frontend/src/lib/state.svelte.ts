import { api, ApiError, type Health, type Profile } from "./api";
import { i18n } from "./i18n.svelte";

/* ---------- per-visitor preferences (never critical) ---------- */
function load(key: string, fallback = "") {
  try { return localStorage.getItem(`lolimpact.${key}`) ?? fallback; } catch { return fallback; }
}
function save(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(`lolimpact.${key}`);
    else localStorage.setItem(`lolimpact.${key}`, value);
  } catch { /* storage blocked: no big deal */ }
}

/* ---------- rutas por hash ---------- */
export type View = "partidas" | "vivo" | "draft";
function parseHash(): { view: View; matchId: string | null } {
  const [, view, id] = (location.hash || "#/partidas").split("/");
  const v: View = view === "vivo" || view === "draft" ? view : "partidas";
  return { view: v, matchId: v === "partidas" && id ? decodeURIComponent(id) : null };
}

class AppState {
  route = $state(parseHash());
  // ?rid=Nombre%23TAG&region=LAS permite compartir el enlace de un perfil
  riotId = $state(new URLSearchParams(location.search).get("rid") ?? load("riotId"));
  region = $state(new URLSearchParams(location.search).get("region") ?? load("region", "LAS"));
  theme = $state<"system" | "light" | "dark">((load("theme") as "light" | "dark") || "system");

  health = $state<Health | null>(null);
  healthError = $state(false);

  profile = $state<Profile | null>(null);
  profileStatus = $state<"idle" | "loading" | "ok" | "error">("idle");
  profileError = $state("");
  loadedName = $state("");   // nombre (sin #tag) del perfil cargado

  constructor() {
    window.addEventListener("hashchange", () => (this.route = parseHash()));
  }

  go(view: View, matchId: string | null = null) {
    location.hash = matchId ? `#/${view}/${encodeURIComponent(matchId)}` : `#/${view}`;
  }

  setTheme(t: "system" | "light" | "dark") {
    this.theme = t;
    save("theme", t === "system" ? null : t);
    if (t === "system") delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = t;
  }

  async loadHealth() {
    try { this.health = await api.health(); this.healthError = false; }
    catch { this.healthError = true; }
  }

  async loadProfile() {
    const rid = this.riotId.trim();
    if (!rid) return;
    save("riotId", rid);
    save("region", this.region);
    this.profileStatus = "loading";
    this.profileError = "";
    // the Riot API can take almost a minute: show the last saved view meanwhile
    const key = `profile:${rid.toLowerCase()}:${this.region}`;
    if (!this.profile) {
      try {
        const cached = JSON.parse(load(key) || "null") as Profile | null;
        if (cached) { this.profile = cached; this.loadedName = rid.split("#")[0].trim(); }
      } catch { /* unreadable cache: ignored */ }
    }
    try {
      const p = await api.profile(rid, this.region);
      this.profile = p;
      save(key, JSON.stringify(p));
      this.loadedName = rid.split("#")[0].trim();
      this.profileStatus = "ok";
      const first = p.matches[0]?.match_id;
      if (this.route.view === "partidas" && !this.route.matchId && first) this.go("partidas", first);
    } catch (e) {
      this.profileStatus = "error";
      const t = i18n.t;
      this.profileError =
        e instanceof ApiError && e.status === 404
          ? (i18n.lang === "es"
              ? `No encontramos partidas para ${rid} en ${this.region}. Revisa el Riot ID y la región; si las claves de la API caducaron, solo verás lo que ya esté en caché.`
              : `We couldn't find games for ${rid} in ${this.region}. Check the Riot ID and region; if the API keys expired, you'll only see what's already cached.`)
          : e instanceof ApiError ? i18n.server(e.message)
          : e instanceof Error ? e.message : t.common.unknownError;
    }
  }
}

export const app = new AppState();
