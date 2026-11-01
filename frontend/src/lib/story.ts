/* Plain-language reading of a game, computed from the model's output. */
import type { Contrib, CurvePoint, MatchSummary, Role, Side } from "./api";

export type StoryKey = "comeback" | "dominated" | "leadLost" | "behindEarly" | "decidedLate";

/** One label per game, from the team's win chance between min 8 and 20. */
export function storyOf(m: MatchSummary): StoryKey | null {
  if (!m.curve?.length) return null;
  const ps = m.curve.map((c) => (m.side === "red" ? 1 - c.p : c.p));
  const lo = Math.min(...ps), hi = Math.max(...ps), last = ps[ps.length - 1];
  if (m.win) {
    if (lo < 0.4) return "comeback";
    if (last >= 0.7) return "dominated";
    return "decidedLate";
  }
  if (hi > 0.6) return "leadLost";
  if (last <= 0.3) return "behindEarly";
  return "decidedLate";
}

export interface LaneEffect {
  role: Role;
  pp: number;       // win-chance points for the viewer's team
  se: number;
  sure: boolean;
  goldK: number;    // lane gold lead for the viewer's team, in thousands
}

export const lanesFor = (c: CurvePoint | undefined, side: Side): LaneEffect[] =>
  (c?.contribs ?? []).map((x: Contrib) => ({
    role: x.rol,
    pp: side === "red" ? -x.pp : x.pp,
    se: x.se_pp,
    sure: x.identificado,
    goldK: side === "red" ? -x.val_k : x.val_k,
  }));

export interface Verdict {
  win: boolean | null;
  minute: number;
  decisive: LaneEffect | null;   // null = no lane stood out by the last evaluated minute
  mine: LaneEffect | null;
  swing: { from: number; to: number; delta: number } | null;
}

const STANDS_OUT = 3; // win-chance points

/** Which lane explains the result, judged at the last minute the model evaluates. */
export function verdictOf(curve: CurvePoint[], side: Side, win: boolean | null, myRole: string): Verdict {
  const last = curve[curve.length - 1];
  const lanes = lanesFor(last, side);
  let decisive: LaneEffect | null = null;
  if (lanes.length && win != null) {
    const pick = [...lanes].sort((a, b) => (win ? b.pp - a.pp : a.pp - b.pp))[0];
    if (win ? pick.pp >= STANDS_OUT : pick.pp <= -STANDS_OUT) decisive = pick;
  }
  const ps = curve.map((c) => (side === "red" ? 1 - c.p_blue : c.p_blue));
  let swing: Verdict["swing"] = null;
  for (let i = 1; i < ps.length; i++) {
    const d = (ps[i] - ps[i - 1]) * 100;
    if (!swing || Math.abs(d) > Math.abs(swing.delta)) swing = { from: curve[i - 1].landmark, to: curve[i].landmark, delta: d };
  }
  return {
    win,
    minute: last?.landmark ?? 0,
    decisive,
    mine: lanes.find((l) => l.role === myRole) ?? null,
    swing,
  };
}

/** One champion's gold conversion, for the win-condition panel (Draft, Live and match history share it). */
export interface WCEntry { champ: string; role: Role; tags: string[]; value: number; se: number; sure: boolean }

/** Marksmen are the only class whose higher gold conversion survived the model audit. */
export const isMarksman = (e: { tags: string[] }) => e.tags.includes("Marksman");
