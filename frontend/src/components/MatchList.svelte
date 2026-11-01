<script lang="ts">
  import type { MatchSummary } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { storyOf } from "../lib/story";
  import ChampIcon from "./ChampIcon.svelte";
  import Tip from "./Tip.svelte";

  let { matches, current, onpick }: { matches: MatchSummary[]; current: string | null; onpick: (id: string) => void } = $props();

  const t = $derived(i18n.t);
  const wins = $derived(matches.filter((m) => m.win).length);
</script>

<section class="list" aria-labelledby="ml-h">
  <div class="head">
    <h2 id="ml-h" class="sec-title">{t.matchList.title} <Tip text={t.matchList.storyTip} /></h2>
    <span class="tally num">{t.matchList.tally(wins, matches.length - wins)}</span>
  </div>

  <ol>
    {#each matches as m (m.match_id)}
      {@const story = storyOf(m)}
      <li>
        <button type="button" class="item" class:on={m.match_id === current} class:loss={!m.win}
          onclick={() => onpick(m.match_id)} aria-current={m.match_id === current ? "true" : undefined}>
          <span class="res" class:w={m.win}>{t.matchList.result(m.win)}</span>
          <ChampIcon id={m.champ} size={36} />
          <span class="who">
            <span class="champ">{champions.name(m.champ)}</span>
            <span class="meta">{t.common.role[m.role] ?? "—"} · <span class="num">{m.kda.join("/")}</span> · {m.duration_min}′</span>
          </span>
          <span class="story" class:none={!story}>{story ? t.matchList.story[story] : t.matchList.noTimeline}</span>
        </button>
      </li>
    {/each}
  </ol>
</section>

<style>
  .list { display: grid; gap: 10px; }
  .head { display: flex; justify-content: space-between; align-items: baseline; padding-bottom: 8px; border-bottom: 1px solid var(--rule-strong); }
  .tally { font-size: 11px; color: var(--ink-3); }
  ol { list-style: none; padding: 0; display: grid; }
  li + li { border-top: 1px solid var(--rule); }
  .item {
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 54px 36px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 10px 8px;
    text-align: left;
    transition: background 0.15s;
  }
  .item:hover { background: var(--paper-2); }
  .item.on { background: var(--paper); box-shadow: inset 0 0 0 1px var(--rule); }
  .item.on::before {
    content: ""; position: absolute; left: -6px; top: 50%; width: 7px; height: 7px; margin-top: -3.5px;
    border-radius: 50%; background: var(--red);
  }
  .res {
    display: grid; place-items: center; height: 22px;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 9.5px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink-2); border-radius: 2px; box-shadow: inset 0 0 0 1px var(--ash);
  }
  .res.w { color: var(--paper); background: var(--ink); box-shadow: none; }
  .who { min-width: 0; display: grid; gap: 1px; }
  .champ { font-weight: 550; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .meta { font-size: 11.5px; color: var(--ink-3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .item.loss .champ { color: var(--ink-2); }
  .story {
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 10.5px; letter-spacing: 0.04em;
    color: var(--ink-2); text-align: right; white-space: nowrap;
  }
  .story.none { color: var(--ink-3); }
</style>
