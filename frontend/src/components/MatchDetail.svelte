<script lang="ts">
  import { api, ApiError, type DraftResult, type MatchDetail, type Role } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { chance, pct } from "../lib/format";
  import { app } from "../lib/state.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import { lanesFor, verdictOf, type WCEntry } from "../lib/story";
  import LaneMatrix from "./LaneMatrix.svelte";
  import LaneRank from "./LaneRank.svelte";
  import Legend from "./Legend.svelte";
  import Loader from "./Loader.svelte";
  import PlayersTable from "./PlayersTable.svelte";
  import Timeline from "./Timeline.svelte";
  import WinCondition from "./WinCondition.svelte";

  let { matchId }: { matchId: string } = $props();

  let data = $state<MatchDetail | null>(null);
  let status = $state<"loading" | "ok" | "error">("loading");
  let error = $state("");
  let selected = $state(0);
  let pre = $state<DraftResult | null>(null);

  const t = $derived(i18n.t);

  $effect(() => {
    const id = matchId;
    const region = app.region;
    status = "loading";
    let alive = true;
    api.match(region, id).then(
      (d) => {
        if (!alive) return;
        data = d;
        status = "ok";
        selected = Math.max(0, d.curve.length - 1);
      },
      (e) => {
        if (!alive) return;
        status = "error";
        error = e instanceof ApiError && e.status === 503 ? i18n.t.matchDetail.noTimeline
          : e instanceof ApiError && e.status === 404 ? i18n.t.matchDetail.notCached
          : e instanceof ApiError ? i18n.server(e.message)
          : e instanceof Error ? e.message : i18n.t.common.unknownError;
      },
    );
    return () => { alive = false; };
  });

  $effect(() => {
    const d = data;
    pre = null;
    if (!d?.curve.length) return;
    const lm = d.curve[0].landmark;
    const picks = { blue: {} as Partial<Record<Role, string>>, red: {} as Partial<Record<Role, string>> };
    for (const p of d.players) if (p.landmark === lm && p.role) picks[p.side][p.role] = p.champ;
    let alive = true;
    api.draft(picks.blue, picks.red).then((r) => { if (alive) pre = r; }, () => {});
    return () => { alive = false; };
  });

  const me = $derived(data?.final.find((p) => p.name.toLowerCase() === app.loadedName.toLowerCase()) ?? null);
  const side = $derived(me?.side ?? "blue");
  const flip = $derived(side === "red");
  const myRole = $derived(data?.players.find((p) => p.name === me?.name)?.role ?? "");
  const win = $derived(me ? me.win : data?.blue_win == null ? null : !!data.blue_win);

  const points = $derived((data?.curve ?? []).map((c) => ({
    m: c.landmark,
    p: flip ? 1 - c.p_blue : c.p_blue,
    lo: flip ? 1 - c.hi : c.lo,
    hi: flip ? 1 - c.lo : c.hi,
  })));

  const v = $derived(data ? verdictOf(data.curve, side, win, myRole) : null);
  const lanesNow = $derived(lanesFor(data?.curve[selected], side));
  const barMax = $derived(
    Math.max(4, ...(data?.curve ?? []).flatMap((c) => c.contribs.map((x) => Math.abs(x.pp) + 1.96 * x.se_pp))) * 1.05,
  );

  const headline = $derived.by(() => {
    if (!v) return "";
    if (!me || v.win == null) return t.verdict.blueView;
    if (v.decisive) {
      const lane = t.verdict.lanePhrase[v.decisive.role];
      return v.win ? t.verdict.wonThrough(lane) : t.verdict.lostThrough(lane);
    }
    return v.win ? t.verdict.wonLate : t.verdict.lostLate;
  });

  const facts = $derived.by(() => {
    if (!v) return [] as string[];
    const out: string[] = [];
    const d = v.decisive;
    if (d) {
      const gold = `${Math.abs(d.goldK).toFixed(1)}k`;
      out.push(t.verdict.laneDetail(t.common.role[d.role], gold, d.goldK > 0, v.minute, chance(d.pp))
        + (d.sure ? "" : ` ${t.verdict.unsure}`));
    } else {
      out.push(t.verdict.noLane(v.minute));
    }
    if (v.mine) {
      out.push(d && d.role === v.mine.role
        ? t.verdict.yoursDecisive
        : t.verdict.yours(t.common.role[v.mine.role], `${v.mine.goldK > 0 ? "+" : v.mine.goldK < 0 ? "−" : ""}${Math.abs(v.mine.goldK).toFixed(1)}k`, chance(v.mine.pp)));
    }
    if (v.swing && Math.abs(v.swing.delta) >= 1) out.push(t.verdict.swing(v.swing.from, v.swing.to, chance(v.swing.delta)));
    return out;
  });

  const toWC = (xs: DraftResult["blue"]): WCEntry[] =>
    xs.map((x) => ({ champ: x.champ, role: x.role, tags: x.tags, value: x.pp_por_1000g, se: x.se, sure: x.identificado }));
  const rivalPre = $derived(pre ? toWC(side === "blue" ? pre.red : pre.blue) : []);
  const ownPre = $derived(pre ? toWC(side === "blue" ? pre.blue : pre.red) : []);

  /* the enemy lane that was furthest ahead at the selected minute, by its effect on your win chance */
  const threat = $derived.by(() => {
    const m = data?.curve[selected]?.landmark;
    if (m == null) return "";
    const worst = [...lanesNow].sort((a, b) => a.pp - b.pp)[0];
    if (!worst || worst.pp >= 0 || worst.goldK >= 0) return t.winCon.noThreat(m);
    const enemy = data!.players.find((p) => p.landmark === m && p.role === worst.role && p.side !== side);
    const lane = t.common.role[worst.role];
    return t.winCon.threat(m, enemy ? champions.name(enemy.champ) : lane, lane, `${Math.abs(worst.goldK).toFixed(1)}k`, chance(worst.pp));
  });

  const cur = $derived(points[selected]);
  const prev = $derived(selected > 0 ? points[selected - 1] : null);
  const standing = $derived(!cur ? "even" : cur.lo > 0.5 ? "ahead" : cur.hi < 0.5 ? "behind" : "even");
</script>

{#if status === "loading"}
  <div class="state"><Loader label={t.matchDetail.loading} /></div>
{:else if status === "error"}
  <div class="state err" role="alert">
    <h2 class="sec-title">{t.matchDetail.loadFailedTitle}</h2>
    <p class="prose">{error}</p>
  </div>
{:else if data && v}
  <article class="detail">
    <header class="intro">
      <h1 class="display title">
        {#if me}{t.matchDetail.yourChamp(champions.name(me.champ))}{:else}{t.matchDetail.matchFallback(data.match_id)}{/if}
      </h1>
      <p class="meta label">
        {#if me}<span class="res" class:w={me.win}>{t.common[me.win ? "win" : "loss"]}</span>
          · {t.common.role[myRole] ?? ""} · <span class="num">{me.kda.join(" / ")}</span> ·{/if}
        {data.duration_min} {t.matchDetail.minSuffix} · {t.matchDetail.patch} {data.patch}
      </p>
      {#if !me}<p class="note">{t.matchDetail.notFoundNote}</p>{/if}
    </header>

    <section class="verdict" aria-live="polite">
      <p class="headline">{headline}</p>
      <ul class="facts">
        {#each facts as f}<li>{f}</li>{/each}
      </ul>
    </section>

    <section class="chart" aria-labelledby="ch-h">
      <header>
        <h2 id="ch-h" class="sec-title">{t.matchDetail.chartTitle}</h2>
        <p class="hint">{t.matchDetail.chartHint}</p>
      </header>
      <Timeline {points} bind:selected duration={data.duration_min} {win} />
      {#if cur}
        <div class="readout">
          <span class="chip" class:even={standing === "even"} class:behind={standing === "behind"}>{t.matchDetail.state[standing]}</span>
          <p>
            <b>{t.matchDetail.readout(cur.m, pct(cur.p))}</b>
            <span class="sub">({t.matchDetail.range(pct(cur.lo), pct(cur.hi))}){#if prev}{" · "}{t.matchDetail.change(chance((cur.p - prev.p) * 100), prev.m)}{/if}</span>
          </p>
          <p class="threat">{threat}</p>
          <div class="nav">
            <button class="btn ghost" type="button" disabled={selected === 0} onclick={() => selected--}>{t.matchDetail.prevMin}</button>
            <button class="btn ghost" type="button" disabled={selected === points.length - 1} onclick={() => selected++}>{t.matchDetail.nextMin}</button>
          </div>
        </div>
      {/if}
    </section>

    <LaneRank lanes={lanesNow} minute={cur?.m ?? 0} {myRole} max={barMax} />

    {#if pre}
      <WinCondition title={t.winCon.titleMatch} rival={rivalPre} own={ownPre} unit={t.winCon.perGold} />
    {/if}

    <details class="more">
      <summary>
        <span class="sec-title">{t.matchDetail.details}</span>
        <span class="sub">{t.matchDetail.detailsSub}</span>
      </summary>
      <div class="more-body">
        {#if cur}<p class="accuracy">{t.matchDetail.accuracy(cur.m, pct(data.curve[selected].confidence))}</p>{/if}
        <LaneMatrix curve={data.curve} bind:selected {side} max={barMax} />
        <PlayersTable players={data.players} minute={cur?.m ?? 0} mySide={side} me={app.loadedName} />
        <Legend />
      </div>
    </details>
  </article>
{/if}

<style>
  .state { padding: 64px 0; display: grid; place-items: center; gap: 12px; text-align: center; }
  .state.err { place-items: start; text-align: left; }
  .detail { display: grid; grid-template-columns: minmax(0, 1fr); gap: 48px; max-width: 980px; }
  .detail > :global(*) { min-width: 0; }

  .intro { display: grid; gap: 10px; }
  .title { font-size: clamp(38px, 5vw, 64px); text-wrap: balance; }
  .meta { font-size: 11px; color: var(--ink-2); }
  .res { color: var(--ink-3); }
  .res.w { color: var(--red-ink); }
  .note { font-size: 12.5px; color: var(--ink-3); }

  .verdict { display: grid; gap: 14px; padding: 22px 24px; background: var(--paper); border-style: solid; border-width: 1px 1px 1px 0; border-color: var(--rule); border-radius: var(--radius); position: relative; }
  .verdict::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 1px; background: var(--red); }
  .headline { font-size: clamp(22px, 2.6vw, 30px); line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; color: var(--ink); text-wrap: balance; }
  .facts { list-style: none; padding: 0; display: grid; gap: 8px; }
  .facts li { position: relative; padding-left: 20px; font-size: 15px; line-height: 1.5; color: var(--ink-2); max-width: 68ch; }
  .facts li::before { content: ""; position: absolute; left: 2px; top: 11px; width: 9px; height: 1px; background: var(--red); }

  .chart { display: grid; gap: 14px; }
  .chart header { display: grid; gap: 6px; }
  .hint { font-size: 13px; color: var(--ink-3); }
  .readout { display: flex; flex-wrap: wrap; align-items: center; gap: 10px 16px; padding-top: 12px; border-top: 1px solid var(--rule); }
  .readout p { flex: 1 1 280px; font-size: 14px; color: var(--ink-2); min-width: 0; }
  .readout b { color: var(--ink); font-weight: 600; }
  .readout .sub { color: var(--ink-3); }
  .chip {
    display: inline-flex; align-items: center; gap: 7px; height: 24px; padding: 0 10px;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--paper); background: var(--red-ink); border-radius: 2px;
  }
  .chip.behind { background: var(--ink); }
  .chip.even { background: transparent; color: var(--ink-2); box-shadow: inset 0 0 0 1px var(--ash); }
  .threat { flex: 1 1 100%; order: 3; font-size: 14px; color: var(--ink-2); padding-left: 12px; box-shadow: inset 1px 0 0 var(--red); }
  .nav { display: flex; gap: 8px; }
  .nav .btn { --h: 32px; height: 32px; font-size: 10px; padding: 0 12px; --ghost-bg: var(--ground); }

  .more { border-top: 1px solid var(--rule-strong); padding-top: 18px; }
  .more summary { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px 14px; cursor: pointer; list-style: none; }
  .more summary::-webkit-details-marker { display: none; }
  .more summary .sec-title::after { content: "+"; margin-left: 10px; color: var(--red-ink); }
  .more[open] summary .sec-title::after { content: "−"; }
  .more summary .sub { font-size: 13px; color: var(--ink-3); }
  .more summary:hover .sec-title { color: var(--red-ink); }
  .more-body { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; padding-top: 26px; }
  .accuracy { font-size: 13.5px; color: var(--ink-2); }

  @media (max-width: 640px) {
    .verdict { padding: 18px 16px; }
    .nav { width: 100%; }
    .nav .btn { flex: 1; justify-content: center; }
  }
</style>
