/* Tipos y llamadas al backend FastAPI. */

export type Role = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY";
export type Side = "blue" | "red";

export const ROLES: Role[] = ["TOP", "JUNGLE", "MIDDLE", "BOTTOM", "UTILITY"];
export const REGIONS = ["LAS", "LAN", "NA", "EUW", "EUNE", "KR"];

export interface Health { ok: boolean; claves_vivas: number; claves_muertas: number; modelo: string }

export interface MatchSummary {
  match_id: string;
  champ: string;
  role: Role | "";
  win: boolean;
  side: Side;
  kda: [number, number, number];
  duration_min: number;
  patch: string;
  curve?: { m: number; p: number }[];
  my_gold_adv_10?: number;
}
export interface Range { n: number; mean: number | null; lo: number | null; hi: number | null }
export interface Profile {
  riot_id: string;
  api_viva: boolean;
  matches: MatchSummary[];
  patron: { wins: Range; losses: Range } | null;
  degradado?: boolean;
  motivo?: string;
}

export interface Contrib { rol: Role; pp: number; se_pp: number; identificado: boolean; val_k: number }
export interface CurvePoint {
  landmark: number; p_blue: number; lo: number; hi: number; confidence: number; contribs: Contrib[];
}
export interface PlayerAt {
  landmark: number; name: string; champ: string; role: Role; side: Side;
  gold_adv: number; cs_adv: number; kills: number; deaths: number; pct: number | null; tags: string[];
}
export interface MatchDetail {
  match_id: string; patch: string; duration_min: number; blue_win: number | null;
  curve: CurvePoint[]; players: PlayerAt[];
  final: { name: string; champ: string; kda: number[]; side: Side; win: boolean; damage: number }[];
}

export interface DraftEntry { champ: string; role: Role; tags: string[]; pp_por_1000g: number; se: number; identificado: boolean }
export interface DraftResult { blue: DraftEntry[]; red: DraftEntry[]; nota: string }

export interface LiveEntry {
  champ: string; role: Role; tags: string[]; pp1000: number; se: number;
  kill1: number; kill2: number; se_kill2: number; identificado: boolean;
}
export type LiveResult =
  | { en_partida: false; mensaje: string }
  | { en_partida: true; gameMode: string; minutos: number; nota: string; tu_lado: Side; blue: LiveEntry[]; red: LiveEntry[] };

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

// fixed Spanish text, like the backend's: translated on the client via i18n.server()
const NO_SERVER = "No hay conexión con el servidor.";

export type ProfileEvent =
  | { type: "start"; total: number }
  | { type: "match"; done: number; total: number; entry: MatchSummary | null }
  | { type: "done"; profile: Profile }
  | { type: "error"; status: number; detail: string };

/** Streams the profile as NDJSON progress events; resolves with the final profile. */
async function profileStream(riotId: string, region: string, onEvent: (e: ProfileEvent) => void): Promise<Profile> {
  let r: Response;
  try {
    r = await fetch(`/api/profile/stream?riot_id=${encodeURIComponent(riotId)}&region=${region}`);
  } catch {
    throw new ApiError(0, NO_SERVER);
  }
  if (!r.ok || !r.body) throw new ApiError(r.status, r.statusText);
  const reader = r.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buf += value;
    let nl: number;
    while ((nl = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line) continue;
      const ev = JSON.parse(line) as ProfileEvent;
      if (ev.type === "error") throw new ApiError(ev.status, ev.detail);
      if (ev.type === "done") return ev.profile;
      onEvent(ev);
    }
    if (done) throw new ApiError(0, NO_SERVER);
  }
}

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, init);
  } catch {
    throw new ApiError(0, NO_SERVER);
  }
  if (!r.ok) {
    let msg = r.statusText;
    try { msg = (await r.json()).detail ?? msg; } catch { /* non-JSON body */ }
    throw new ApiError(r.status, msg);
  }
  return r.json() as Promise<T>;
}

export const api = {
  health: () => req<Health>("/api/health"),
  profileStream,
  match: (region: string, id: string) => req<MatchDetail>(`/api/match/${region}/${id}`),
  draft: (blue: Partial<Record<Role, string>>, red: Partial<Record<Role, string>>) =>
    req<DraftResult>("/api/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blue, red }),
    }),
  live: (riotId: string, region: string) =>
    req<LiveResult>(`/api/live?riot_id=${encodeURIComponent(riotId)}&region=${region}`),
};
