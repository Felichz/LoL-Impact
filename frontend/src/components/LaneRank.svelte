<script lang="ts">
  /* Lanes ranked by how much they moved the team's chance to win at one minute. */
  import { i18n } from "../lib/i18n.svelte";
  import { chance, goldK } from "../lib/format";
  import type { LaneEffect } from "../lib/story";
  import ForceBar from "./ForceBar.svelte";
  import RoleGlyph from "./RoleGlyph.svelte";
  import Tip from "./Tip.svelte";

  let { lanes, minute, myRole, max }: { lanes: LaneEffect[]; minute: number; myRole: string; max: number } = $props();

  const t = $derived(i18n.t);
  const ranked = $derived([...lanes].sort((a, b) => Math.abs(b.pp) - Math.abs(a.pp)));
</script>

<section class="lanes" aria-labelledby="lr-h">
  <header>
    <h2 id="lr-h" class="sec-title">{t.lanes.title(minute)}</h2>
    <p class="prose">{t.lanes.intro}</p>
  </header>

  {#if ranked.length}
    <ol>
      {#each ranked as l}
        <li class:mine={l.role === myRole}>
          <span class="who">
            <RoleGlyph role={l.role} label />
            {#if l.role === myRole}<span class="tag-you">{t.lanes.yourLane}</span>{/if}
          </span>
          <span class="gold num" class:dim={l.goldK < 0}>{t.lanes.gold(goldK(l.goldK))}</span>
          <ForceBar value={l.pp} se={l.se} {max} confirmed={l.sure} />
          <span class="eff">
            <span class="v num" class:slack={!l.sure}>{chance(l.pp)}</span>
            {#if l.sure}
              <span class="state">{t.common.sure}</span>
            {:else}
              <span class="state slack">{t.common.notSure}<Tip text={t.common.notSureTip} /></span>
            {/if}
          </span>
        </li>
      {/each}
    </ol>
  {:else}
    <p class="prose">{t.lanes.noData}</p>
  {/if}
</section>

<style>
  .lanes { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
  header { display: grid; gap: 8px; }
  .prose { font-size: 13.5px; }
  ol { list-style: none; padding: 0; border-top: 1px solid var(--rule-strong); }
  li {
    display: grid;
    grid-template-columns: 150px 96px minmax(120px, 1fr) 110px;
    gap: 16px;
    align-items: center;
    padding: 11px 0;
    border-bottom: 1px solid var(--rule);
  }
  li.mine { background: color-mix(in srgb, var(--paper) 70%, transparent); }
  .who { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .gold { font-size: 12.5px; text-align: right; color: var(--ink-2); white-space: nowrap; }
  .dim { color: var(--ink-3); }
  .eff { display: grid; justify-items: end; line-height: 1.25; }
  .v { font-size: 18px; }
  .v.slack { color: var(--ink-3); }
  .state {
    display: inline-flex; align-items: center;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 10.5px; letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--red-ink);
  }
  .state.slack { color: var(--ink-3); }

  @media (max-width: 640px) {
    li { grid-template-columns: 1fr auto; row-gap: 4px; column-gap: 12px; }
    .who { grid-column: 1; grid-row: 1; }
    .gold { grid-column: 1; grid-row: 2; text-align: left; font-size: 11.5px; }
    .eff { grid-column: 2; grid-row: 1 / span 2; }
    li :global(.fb) { grid-column: 1 / -1; grid-row: 3; }
  }
</style>
