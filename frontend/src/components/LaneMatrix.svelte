<script lang="ts">
  /* Every lane's effect on the win chance at every evaluated minute. */
  import type { CurvePoint, Side } from "../lib/api";
  import { ROLES } from "../lib/api";
  import { signed } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import { lanesFor } from "../lib/story";
  import RoleGlyph from "./RoleGlyph.svelte";

  let { curve, selected = $bindable(0), side, max }: { curve: CurvePoint[]; selected?: number; side: Side; max: number } = $props();

  const t = $derived(i18n.t.matrix);
  const table = $derived(curve.map((c) => Object.fromEntries(lanesFor(c, side).map((l) => [l.role, l]))));
</script>

<section class="matrix" aria-labelledby="mx-h">
  <h3 id="mx-h" class="sec-title">{t.title}</h3>
  <p class="prose">{t.intro}</p>
  <div class="grid" role="table" aria-label={t.title} style:--n={curve.length}>
    <div class="row label" role="row">
      <span role="columnheader">{t.corner}</span>
      {#each curve as pt, i}
        <button type="button" role="columnheader" class="mh" class:on={i === selected} onclick={() => (selected = i)}>
          {pt.landmark}′
        </button>
      {/each}
    </div>
    {#each ROLES as r}
      <div class="row" role="row">
        <span role="rowheader"><RoleGlyph role={r} size={14} label /></span>
        {#each table as row, i}
          {@const c = row[r]}
          <span role="cell" class="cell num" class:on={i === selected} class:slack={c && !c.sure}>
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
  .matrix { display: grid; gap: 10px; }
  .prose { font-size: 13px; }
  .grid { display: grid; gap: 2px; padding: 14px; background: var(--paper); border: 1px solid var(--rule); border-radius: var(--radius); overflow-x: auto; }
  .row { display: grid; grid-template-columns: 96px repeat(var(--n, 6), minmax(44px, 1fr)); align-items: center; gap: 4px; }
  .row.label { font-size: 10px; margin-bottom: 4px; }
  .mh { font: inherit; letter-spacing: inherit; color: var(--ink-3); padding: 4px 0; text-align: center; border-bottom: 1px solid transparent; }
  .mh:hover { color: var(--ink); }
  .mh.on { color: var(--red-ink); border-bottom-color: var(--red); }
  .cell { position: relative; height: 26px; display: grid; place-items: center; font-size: 11.5px; border-radius: 2px; overflow: hidden; }
  .cell i { position: absolute; left: 50%; bottom: 3px; height: 2px; width: calc(var(--w) / 2); background: var(--red); }
  .cell i.neg { left: auto; right: 50%; }
  .cell.slack { color: var(--ink-3); }
  .cell.slack i { background: var(--ash); }
  .cell.on { background: var(--red-wash); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--red) 35%, transparent); }
</style>
