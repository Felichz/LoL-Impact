<script lang="ts">
  import type { Contrib, CurvePoint } from "../lib/api";
  import { ROLES } from "../lib/api";
  import { signed } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import ForceBar from "./ForceBar.svelte";
  import RoleGlyph from "./RoleGlyph.svelte";
  import Tip from "./Tip.svelte";

  let { curve, selected = $bindable(0), flip }: { curve: CurvePoint[]; selected?: number; flip: boolean } = $props();

  const t = $derived(i18n.t.laneForces);
  const mine = (c: Contrib) => ({ ...c, pp: flip ? -c.pp : c.pp, val_k: flip ? -c.val_k : c.val_k });
  const byRole = (pt: CurvePoint) =>
    Object.fromEntries(pt.contribs.map((c) => [c.rol, mine(c)])) as Record<string, Contrib>;

  const table = $derived(curve.map(byRole));
  const max = $derived(
    Math.max(4, ...curve.flatMap((pt) => pt.contribs.map((c) => Math.abs(c.pp) + 1.96 * c.se_pp))) * 1.05,
  );
  const now = $derived(table[selected] ?? {});
  const strongest = $derived(
    Object.values(now).filter((c) => c.identificado).sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp))[0],
  );
</script>

<section class="forces" aria-labelledby="lf-h">
  <header>
    <h2 id="lf-h" class="sec-title">{t.title(curve[selected]?.landmark)}</h2>
    <p class="prose">
      {t.intro}
      {#if strongest}
        {t.strongest(t.laneNames[strongest.rol], signed(strongest.pp, 1))}
      {/if}
    </p>
  </header>

  <div class="rows" role="table" aria-label={t.title(curve[selected]?.landmark)}>
    <div class="r head label" role="row">
      <span role="columnheader">{t.lane}</span>
      <span role="columnheader">{t.goldDiff}
        <Tip text={t.goldDiffTip} /></span>
      <span role="columnheader" class="c">{t.against}</span>
      <span role="columnheader" class="e">{t.effect}
        <Tip text={t.effectTip} /></span>
    </div>
    {#each ROLES as r}
      {@const c = now[r]}
      <div class="r" role="row">
        <span role="cell"><RoleGlyph role={r} label /></span>
        {#if c}
          <span role="cell" class="num k" class:dim={c.val_k < 0}>{signed(c.val_k, 1)}k</span>
          <span role="cell"><ForceBar value={c.pp} se={c.se_pp} {max} confirmed={c.identificado} /></span>
          <span role="cell" class="e">
            <span class="num v" class:slack={!c.identificado}>{signed(c.pp, 1)}</span>
            <span class="num se">± {(1.96 * c.se_pp).toFixed(1)} pp</span>
            <span class="state" class:slack={!c.identificado}>{c.identificado ? t.taut : t.slack}</span>
          </span>
        {:else}
          <span role="cell" class="nodata">{t.noData}</span><span role="cell"></span><span role="cell"></span>
        {/if}
      </div>
    {/each}
  </div>

  <div class="evo" role="table" aria-label={t.perMinute} style:--n={curve.length}>
    <div class="er label" role="row">
      <span role="columnheader">{t.perMinute}</span>
      {#each curve as pt, i}
        <button type="button" role="columnheader" class="mh" class:on={i === selected} onclick={() => (selected = i)}>
          {pt.landmark}′
        </button>
      {/each}
    </div>
    {#each ROLES as r}
      <div class="er" role="row">
        <span role="rowheader"><RoleGlyph role={r} size={14} label /></span>
        {#each table as row, i}
          {@const c = row[r]}
          <span role="cell" class="cell num" class:on={i === selected} class:slack={c && !c.identificado}>
            {#if c}
              <i style:--w="{Math.min(Math.abs(c.pp) / max, 1) * 100}%" class:neg={c.pp < 0}></i>
              {signed(c.pp, 0)}
            {:else}—{/if}
          </span>
        {/each}
      </div>
    {/each}
  </div>
</section>

<style>
  .forces { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; }
  header { display: grid; gap: 8px; }
  .prose { font-size: 13.5px; }

  .rows { display: grid; }
  .r {
    display: grid;
    grid-template-columns: 110px 92px minmax(140px, 1fr) 150px;
    align-items: center;
    gap: 16px;
    padding: 9px 0;
    border-bottom: 1px solid var(--rule);
  }
  .r.head { padding: 0 0 8px; border-bottom-color: var(--rule-strong); font-size: 9.5px; }
  .r.head span { display: flex; align-items: center; }
  .r.head .c { justify-content: center; }
  .k { font-size: 12.5px; text-align: right; padding-right: 8px; }
  .dim { color: var(--ink-3); }
  .e { display: grid; grid-template-columns: auto 1fr; align-items: baseline; column-gap: 8px; justify-content: end; }
  .r.head .e { display: flex; justify-content: flex-end; }
  .v { font-size: 15px; text-align: right; }
  .v.slack { color: var(--ink-3); }
  .se { font-size: 10.5px; color: var(--ink-3); }
  .state {
    grid-column: 1 / -1;
    justify-self: end;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 9.5px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--red-ink);
  }
  .state.slack { color: var(--ink-3); }
  .nodata { font-size: 11px; color: var(--ink-3); }

  .evo { display: grid; gap: 2px; padding: 14px; background: var(--paper); border: 1px solid var(--rule); border-radius: var(--radius); overflow-x: auto; }
  .er { display: grid; grid-template-columns: 96px repeat(var(--n, 6), minmax(44px, 1fr)); align-items: center; gap: 4px; }
  .er.label { font-size: 9.5px; margin-bottom: 4px; }
  .mh {
    font: inherit; letter-spacing: inherit; color: var(--ink-3);
    padding: 4px 0; text-align: center; border-bottom: 1px solid transparent;
  }
  .mh:hover { color: var(--ink); }
  .mh.on { color: var(--red-ink); border-bottom-color: var(--red); }
  .cell {
    position: relative;
    height: 26px;
    display: grid;
    place-items: center;
    font-size: 11.5px;
    border-radius: 2px;
    overflow: hidden;
  }
  .cell i {
    position: absolute; left: 50%; bottom: 3px; height: 2px; width: calc(var(--w) / 2);
    background: var(--red);
  }
  .cell i.neg { left: auto; right: 50%; }
  .cell.slack { color: var(--ink-3); }
  .cell.slack i { background: var(--ash); }
  .cell.on { background: var(--red-wash); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--red) 35%, transparent); }

  @media (max-width: 720px) {
    .r { grid-template-columns: 86px 1fr 96px; gap: 10px; }
    .r > :nth-child(2) { display: none; }
    .r.head > :nth-child(2) { display: none; }
    .e { grid-template-columns: 1fr; justify-items: end; }
  }
</style>
