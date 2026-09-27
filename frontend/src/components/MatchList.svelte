<script lang="ts">
  import type { MatchSummary } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { signed } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import ChampIcon from "./ChampIcon.svelte";
  import MiniColumn from "./MiniColumn.svelte";
  import Tip from "./Tip.svelte";

  let { matches, current, onpick }: { matches: MatchSummary[]; current: string | null; onpick: (id: string) => void } = $props();

  const t = $derived(i18n.t);
  const wins = $derived(matches.filter((m) => m.win).length);
  const resultLetter = (win: boolean) => (i18n.lang === "es" ? (win ? "V" : "D") : (win ? "W" : "L"));
</script>

<section class="list" aria-labelledby="ml-h">
  <div class="head">
    <h2 id="ml-h" class="sec-title">{t.matchList.title}</h2>
    <span class="tally num"><b>{wins}</b>{resultLetter(true)} · <b>{matches.length - wins}</b>{resultLetter(false)}</span>
  </div>
  <div class="cols label" aria-hidden="true">
    <span>{t.matchList.champion}</span>
    <span class="r">{t.matchList.gold10}
      <Tip text={t.matchList.gold10Tip} /></span>
    <span class="r">{t.matchList.path}
      <Tip text={t.matchList.pathTip} /></span>
  </div>

  <ol>
    {#each matches as m (m.match_id)}
      <li>
        <button type="button" class="item" class:on={m.match_id === current} class:loss={!m.win}
          onclick={() => onpick(m.match_id)} aria-current={m.match_id === current ? "true" : undefined}>
          <ChampIcon id={m.champ} size={34} />
          <span class="who">
            <span class="champ">{champions.name(m.champ)}</span>
            <span class="meta">
              <span class="res" class:w={m.win} title={t.matchList.result(m.win)}>{resultLetter(m.win)}</span>
              {t.common.role[m.role] ?? "—"} · <span class="num">{m.kda.join("/")}</span>
            </span>
          </span>
          <span class="g num" class:dim={(m.my_gold_adv_10 ?? 0) < 0}>
            {m.my_gold_adv_10 != null ? signed(m.my_gold_adv_10) : "—"}
          </span>
          <span class="spark">
            {#if m.curve?.length}
              <MiniColumn curve={m.curve} flip={m.side === "red"} width={96} height={28} />
            {:else}
              <span class="nodata">{t.matchList.noTimeline}</span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ol>
</section>

<style>
  .list { display: grid; gap: 10px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; }
  .tally { font-size: 11px; color: var(--ink-3); }
  .tally b { color: var(--ink); font-weight: 500; }
  .cols {
    display: grid;
    grid-template-columns: 1fr 56px 104px;
    gap: 10px;
    padding: 0 10px 8px 54px;
    border-bottom: 1px solid var(--rule-strong);
    font-size: 9.5px;
  }
  .cols .r { display: flex; justify-content: flex-end; align-items: center; }
  ol { list-style: none; padding: 0; display: grid; }
  li + li { border-top: 1px solid var(--rule); }
  .item {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 34px 1fr 56px 104px;
    align-items: center;
    gap: 10px;
    padding: 10px;
    text-align: left;
    transition: background 0.15s;
  }
  .item:hover { background: var(--paper-2); }
  .item.on { background: var(--paper); }
  .item.on::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 50%;
    width: 7px;
    height: 7px;
    margin-top: -3.5px;
    border-radius: 50%;
    background: var(--red);
  }
  .who { min-width: 0; display: grid; gap: 1px; }
  .champ { font-weight: 550; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 11.5px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .res {
    display: inline-grid; place-items: center; width: 15px; height: 15px; margin-right: 4px;
    font-family: var(--font-mono); font-size: 9px; font-weight: 600; color: var(--ink-3);
    border-radius: 50%; box-shadow: inset 0 0 0 1px var(--ash); vertical-align: 1px;
  }
  .res.w { color: var(--paper); background: var(--ink); box-shadow: none; }
  .g { font-size: 12px; text-align: right; }
  .g.dim { color: var(--ink-3); }
  .spark { display: flex; justify-content: flex-end; }
  .nodata { font-size: 10px; color: var(--ink-3); font-family: var(--font-mono); }
  .item.loss .champ { color: var(--ink-2); }
</style>
