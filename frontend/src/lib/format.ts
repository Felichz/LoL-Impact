import { i18n } from "./i18n.svelte";

export const sign = (v: number) => (v > 0 ? "+" : v < 0 ? "−" : "");
export const signed = (v: number, d = 0) => {
  const r = Number(Math.abs(v).toFixed(d));
  return r === 0 ? (0).toFixed(d) : `${sign(v)}${r.toFixed(d)}`;
};
export const pct = (p: number) => `${Math.round(p * 100)}%`;
export const gold = (g: number) =>
  Math.abs(g) >= 1000 ? `${signed(g / 1000, 1)}k` : `${signed(g)}`;

const logit = (p: number) => Math.log(p / (1 - p));
const sigm = (x: number) => 1 / (1 + Math.exp(-x));

/** Rebuilds intervals of a different coverage from the 95% CI (symmetric in logit space). */
export function interval(lo95: number, hi95: number, z: number) {
  const a = logit(Math.min(Math.max(lo95, 1e-6), 1 - 1e-6));
  const b = logit(Math.min(Math.max(hi95, 1e-6), 1 - 1e-6));
  const mid = (a + b) / 2;
  const se = (b - a) / (2 * 1.96);
  return [sigm(mid - z * se), sigm(mid + z * se)] as const;
}

/** Match state at a minute, based on where the range falls. */
export function verdict(lo: number, hi: number) {
  const t = i18n.t.matchDetail;
  if (lo > 0.5) return { key: "favor" as const, word: t.verdict.favor, detail: t.verdictDetail.favor };
  if (hi < 0.5) return { key: "against" as const, word: t.verdict.against, detail: t.verdictDetail.against };
  return { key: "unclear" as const, word: t.verdict.unclear, detail: t.verdictDetail.unclear };
}
