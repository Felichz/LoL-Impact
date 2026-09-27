<script lang="ts">
  import type { Range } from "../lib/api";
  import { signed } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import Tip from "./Tip.svelte";

  let { wins, losses }: { wins: Range; losses: Range } = $props();

  const t = $derived(i18n.t.pattern);
  const rows = $derived([
    { k: t.wins, r: wins },
    { k: t.losses, r: losses },
  ].filter((x) => x.r.mean != null && x.r.lo != null && x.r.hi != null));

  const lim = $derived(Math.max(300, ...rows.flatMap((x) => [Math.abs(x.r.lo!), Math.abs(x.r.hi!)])) * 1.1);
  const X = (v: number) => 50 + (v / lim) * 50;   // % del ancho

  const overlap = $derived(
    rows.length === 2 && Math.max(wins.lo!, losses.lo!) <= Math.min(wins.hi!, losses.hi!),
  );
</script>

<section class="pattern" aria-labelledby="pat-h">
  <h2 id="pat-h" class="sec-title">
    {t.title}
    <Tip text={t.tip} />
  </h2>

  <div class="plot">
    {#each rows as { k, r }}
      <div class="row">
        <span class="k">{k} <span class="n">{r.n}</span></span>
        <div class="track">
          <span class="zero"></span>
          <span class="span" style:left="{X(r.lo!)}%" style:width="{X(r.hi!) - X(r.lo!)}%"></span>
          <span class="mean" style:left="{X(r.mean!)}%"></span>
        </div>
        <span class="v num">{signed(r.mean!)}g</span>
      </div>
    {/each}
    <div class="scale num" aria-hidden="true">
      <span>{signed(-Math.round(lim))}</span><span>{t.zeroAvg}</span><span>{signed(Math.round(lim))}</span>
    </div>
  </div>

  <p class="verdict">
    {#if overlap}
      <b>{t.overlapVerdict}</b> {t.overlapRest}
    {:else}
      <b>{t.noOverlapVerdict}</b> {t.noOverlapRest}
    {/if}
  </p>
</section>

<style>
  .pattern { display: grid; gap: 14px; }
  .plot { display: grid; gap: 10px; }
  .row { display: grid; grid-template-columns: 92px 1fr 58px; align-items: center; gap: 10px; }
  .k { font-family: var(--font-mono); font-stretch: 87.5%; font-size: 11px; color: var(--ink-2); }
  .n { color: var(--ink-3); font-size: 10px; }
  .n::before { content: "n="; }
  .track { position: relative; height: 14px; }
  .track::before { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--rule); }
  .zero { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 0; border-left: 1px dashed var(--red); }
  .span { position: absolute; top: 50%; height: 4px; margin-top: -2px; background: var(--ash); border-radius: 2px; }
  .mean {
    position: absolute; top: 50%; width: 11px; height: 11px; margin: -5.5px 0 0 -5.5px;
    border-radius: 50%; background: var(--paper); box-shadow: inset 0 0 0 2.5px var(--ink);
  }
  .v { font-size: 12px; text-align: right; }
  .scale {
    display: flex; justify-content: space-between; margin-left: 102px; margin-right: 68px;
    font-size: 9.5px; color: var(--ink-3);
  }
  .verdict { font-size: 13px; color: var(--ink-2); line-height: 1.5; }
  .verdict b { color: var(--ink); font-weight: 600; }
</style>
