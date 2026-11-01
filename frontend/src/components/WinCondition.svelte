<script lang="ts">
  /* What the model can say before a game: the confirmed win condition (marksmen),
     the early-gold rule, and every enemy's conversion without a false ranking. */
  import { ROLES } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { chance } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import { isMarksman, type WCEntry } from "../lib/story";
  import ChampIcon from "./ChampIcon.svelte";
  import ForceBar from "./ForceBar.svelte";
  import Tip from "./Tip.svelte";

  let { title, rival, own = [], unit, max = 30 }:
    { title: string; rival: WCEntry[]; own?: WCEntry[]; unit: string; max?: number } = $props();

  const t = $derived(i18n.t.winCon);
  const tc = $derived(i18n.t.common);
  const rivalMk = $derived(rival.filter(isMarksman));
  const ownMk = $derived(own.filter(isMarksman));
  const ordered = $derived([...rival].sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role)));
  const names = (xs: WCEntry[]) => xs.map((x) => champions.name(x.champ)).join(" / ");
</script>

<section class="wc">
  <h2 class="sec-title">{title}</h2>

  <div class="lead">
    <p class="head">
      {#if rivalMk.length}{t.marksman(names(rivalMk), tc.role[rivalMk[0].role])}{:else}{t.noMarksman}{/if}
    </p>
    <ul class="facts">
      <li>{t.earlyRule}</li>
      {#if ownMk.length}<li>{t.ownMarksman(names(ownMk))}</li>{/if}
    </ul>
  </div>

  {#if ordered.length}
    <h3 class="label">{t.listTitle}</h3>
    <ul class="list">
      {#each ordered as e}
        {@const mk = isMarksman(e)}
        <li class:mk>
          <ChampIcon id={e.champ} size={32} />
          <span class="who">
            <span class="nm">{champions.name(e.champ)}{#if mk} <span class="tag-you">{t.confirmed}</span>{/if}</span>
            <span class="cls">{tc.role[e.role] ?? e.role} · {e.tags.join(" · ") || tc.noClass}</span>
          </span>
          <ForceBar value={e.value} se={e.se} {max} confirmed={e.sure} />
          <span class="vals">
            <span class="num v" class:slack={!e.sure}>{chance(e.value)}</span>
            <span class="sub">{t.range(chance(e.value - 1.96 * e.se), chance(e.value + 1.96 * e.se))}{#if !e.sure}{" · "}{tc.notSure}<Tip text={tc.notSureTip} />{/if}</span>
          </span>
        </li>
      {/each}
    </ul>
    <p class="fine">{unit}. {t.rest}</p>
  {/if}
</section>

<style>
  .wc { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .lead { display: grid; gap: 10px; padding: 18px 22px; background: var(--paper); border: 1px solid var(--rule); border-radius: var(--radius); }
  .head { font-size: 16.5px; line-height: 1.45; font-weight: 550; color: var(--ink); max-width: 72ch; text-wrap: pretty; }
  .facts { list-style: none; padding: 0; display: grid; gap: 6px; }
  .facts li { position: relative; padding-left: 20px; font-size: 14px; color: var(--ink-2); }
  .facts li::before { content: ""; position: absolute; left: 2px; top: 10px; width: 9px; height: 1px; background: var(--red); }
  h3 { margin-top: 6px; }
  .list { list-style: none; padding: 0; border-top: 1px solid var(--rule-strong); }
  .list li {
    display: grid; grid-template-columns: 32px minmax(140px, 1fr) minmax(120px, 1.2fr) 150px;
    gap: 12px; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--rule);
  }
  .list li.mk { background: color-mix(in srgb, var(--paper) 70%, transparent); }
  .who { display: grid; min-width: 0; line-height: 1.3; }
  .nm { font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cls { font-size: 11.5px; color: var(--ink-3); }
  .vals { display: grid; justify-items: end; text-align: right; line-height: 1.3; }
  .v { font-size: 16px; }
  .v.slack { color: var(--ink-3); }
  .sub { display: inline-flex; align-items: center; font-size: 11px; color: var(--ink-3); }
  .fine { font-size: 12px; color: var(--ink-3); max-width: 90ch; }

  @media (max-width: 640px) {
    .lead { padding: 16px; }
    .list li { grid-template-columns: 32px 1fr auto; }
    .list li :global(.fb) { grid-column: 2 / -1; grid-row: 2; }
  }
</style>
