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

async function req<T>(url: string, init?: RequestInit): Promise<T> {
  let r: Response;
  try {
    r = await fetch(url, init);
  } catch {
    // fixed Spanish text: translated on the client via i18n.server()
    throw new ApiError(0, "No hay conexión con el servidor local (¿está corriendo uvicorn en el puerto 8000?).");
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
  profile: (riotId: string, region: string) =>
    req<Profile>(`/api/profile?riot_id=${encodeURIComponent(riotId)}&region=${region}`),
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
