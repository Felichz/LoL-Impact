<script lang="ts">
  import { api, ApiError, type MatchDetail } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { pct, signed, verdict } from "../lib/format";
  import { app } from "../lib/state.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import Column from "./Column.svelte";
  import LaneForces from "./LaneForces.svelte";
  import Legend from "./Legend.svelte";
  import Loader from "./Loader.svelte";
  import PlayersTable from "./PlayersTable.svelte";
  import Tip from "./Tip.svelte";

  let { matchId }: { matchId: string } = $props();

  let data = $state<MatchDetail | null>(null);
  let status = $state<"loading" | "ok" | "error">("loading");
  let error = $state("");
  let selected = $state(0);

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
        selected = turningPoint(d);
      },
      (e) => {
        if (!alive) return;
        status = "error";
        error = e instanceof ApiError && e.status === 503
          ? (i18n.lang === "es"
              ? "No hay timeline para esta partida: las claves de la API caducaron y no está en caché. Regenera las claves en developer.riotgames.com y vuelve a intentarlo."
              : "No timeline for this game: the API keys expired and it's not cached. Regenerate the keys at developer.riotgames.com and try again.")
          : e instanceof ApiError && e.status === 404
          ? (i18n.lang === "es"
              ? "Esta partida no está en caché y la API no la devolvió."
              : "This game isn't cached and the API didn't return it.")
          : e instanceof ApiError ? i18n.server(e.message)
          : e instanceof Error ? e.message : i18n.t.common.unknownError;
      },
    );
    return () => { alive = false; };
  });

  const me = $derived(data?.final.find((p) => p.name.toLowerCase() === app.loadedName.toLowerCase()) ?? null);
  const mySide = $derived(me?.side ?? "blue");
  const flip = $derived(mySide === "red");
  const myRole = $derived(data?.players.find((p) => p.name === me?.name)?.role ?? "");

  const points = $derived((data?.curve ?? []).map((c) => ({
    m: c.landmark,
    p: flip ? 1 - c.p_blue : c.p_blue,
    lo: flip ? 1 - c.hi : c.lo,
    hi: flip ? 1 - c.lo : c.hi,
  })));

  function turningPoint(d: MatchDetail) {
    const f = (d.final.find((p) => p.name.toLowerCase() === app.loadedName.toLowerCase())?.side ?? "blue") === "red";
    const ps = d.curve.map((c) => (f ? 1 - c.p_blue : c.p_blue));
    let best = ps.length - 1, jump = -1;
    for (let i = 1; i < ps.length; i++) {
      const j = Math.abs(ps[i] - ps[i - 1]);
      if (j > jump) { jump = j; best = i; }
    }
    return Math.max(0, best);
  }

  const cords = $derived((data?.curve[selected]?.contribs ?? []).map((c) => ({
    rol: c.rol, pp: flip ? -c.pp : c.pp, identificado: c.identificado,
  })));

  const cur = $derived(points[selected]);
  const prev = $derived(selected > 0 ? points[selected - 1] : null);
  const v = $derived(cur ? verdict(cur.lo, cur.hi) : null);

  const summary = $derived.by(() => {
    if (points.length < 2) return "";
    const a = points[0], b = points[points.length - 1];
    let k = 1, jump = 0;
    for (let i = 1; i < points.length; i++) {
      const j = points[i].p - points[i - 1].p;
      if (Math.abs(j) > Math.abs(jump)) { jump = j; k = i; }
    }
    return i18n.t.matchDetail.summary(pct(a.p), a.m, pct(b.p), b.m, points[k - 1].m, points[k].m, signed(jump * 100));
  });
</script>

{#if status === "loading"}
  <div class="state"><Loader label={i18n.t.matchDetail.loading} /></div>
{:else if status === "error"}
  <div class="state err" role="alert">
    <h2 class="sec-title">{i18n.t.matchDetail.loadFailedTitle}</h2>
    <p class="prose">{error}</p>
  </div>
{:else if data}
  <article class="detail">
    <div class="hero">
      <div class="intro">
        <h1 class="display title">
          {#if me}{i18n.t.matchDetail.yourChamp(champions.name(me.champ))}{:else}{i18n.t.matchDetail.matchFallback(data.match_id)}{/if}
        </h1>
        <p class="meta label">
          {#if me}<span class="res" class:w={me.win}>{i18n.t.common[me.win ? "win" : "loss"]}</span>
            · {i18n.t.common.role[myRole] ?? ""} · <span class="num">{me.kda.join(" / ")}</span> ·{/if}
          {data.duration_min} {i18n.t.matchDetail.minSuffix} · {i18n.t.matchDetail.patch} {data.patch}
        </p>
        {#if !me}
          <p class="note">{i18n.t.matchDetail.notFoundNote}</p>
        {/if}
        {#if summary}<p class="summary">{summary}</p>{/if}

        {#if cur && v}
          <div class="readout panel" aria-live="polite">
            <div class="ro-head">
              <span class="ro-min display">{i18n.t.matchDetail.minLabel(cur.m)}</span>
              <span class="ro-state" class:mid={v.key === "unclear"}>{v.word}</span>
            </div>
            <dl>
              <div><dt>{i18n.t.matchDetail.probLabel}</dt><dd class="num big">{pct(cur.p)}</dd></div>
              <div><dt>{i18n.t.matchDetail.likelyRange}
                <Tip text={i18n.t.matchDetail.likelyRangeTip} /></dt>
                <dd class="num">{pct(cur.lo)} – {pct(cur.hi)}</dd></div>
              {#if prev}
                <div><dt>{i18n.t.matchDetail.changeSince(prev.m)}</dt><dd class="num">{signed((cur.p - prev.p) * 100)} pp</dd></div>
              {/if}
              <div><dt>{i18n.t.matchDetail.modelAccuracy}
                <Tip text={i18n.t.matchDetail.modelAccuracyTip} /></dt>
                <dd class="num">{pct(data.curve[selected].confidence)}</dd></div>
            </dl>
            <p class="ro-why">{v.detail}.</p>
            <div class="ro-nav">
              <button class="btn ghost" type="button" disabled={selected === 0} onclick={() => selected--}>{i18n.t.matchDetail.prevMin}</button>
              <button class="btn ghost" type="button" disabled={selected === points.length - 1} onclick={() => selected++}>{i18n.t.matchDetail.nextMin}</button>
            </div>
          </div>
        {/if}
      </div>

      <div class="chart">
        <Column {points} bind:selected duration={data.duration_min} {cords}
          win={me ? me.win : data.blue_win == null ? null : !!data.blue_win} />
        <p class="key">
          <span><i class="k-ci"></i>{i18n.t.matchDetail.keyCi}</span>
          <span><i class="k-taut"></i>{i18n.t.matchDetail.keyTaut}</span>
          <span><i class="k-slack"></i>{i18n.t.matchDetail.keySlack}</span>
          <span class="hint">{i18n.t.matchDetail.keyHint}</span>
        </p>
      </div>
    </div>

    <LaneForces curve={data.curve} bind:selected {flip} />

    <PlayersTable players={data.players} minute={data.curve[selected]?.landmark ?? 0} {mySide} me={app.loadedName} />

    <Legend />
  </article>
{/if}

<style>
  .state { padding: 64px 0; display: grid; place-items: center; gap: 12px; text-align: center; }
  .state.err { place-items: start; text-align: left; }
  .detail { display: grid; grid-template-columns: minmax(0, 1fr); gap: 56px; }
  .detail > :global(*) { min-width: 0; }

  .hero {
    display: grid;
    grid-template-columns: minmax(300px, 430px) minmax(0, 1fr);
    gap: clamp(24px, 4vw, 56px);
    align-items: start;
  }
  .intro { display: grid; gap: 14px; padding-top: 6px; }
  .title { font-size: clamp(40px, 5.2vw, 68px); text-wrap: balance; }
  .meta { font-size: 11px; color: var(--ink-2); }
  .res { color: var(--ink-3); }
  .res.w { color: var(--red-ink); }
  .note { font-size: 12.5px; color: var(--ink-3); }
  .summary { font-size: 15px; line-height: 1.55; color: var(--ink-2); max-width: 44ch; text-wrap: pretty; }

  .readout { margin-top: 8px; padding: 18px 18px 16px; display: grid; gap: 12px; --ghost-bg: var(--paper); }
  .ro-head { display: flex; align-items: baseline; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--red); }
  .ro-min { font-size: 26px; color: var(--red-ink); }
  .ro-state {
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 7px;
  }
  .ro-state::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--red); }
  .ro-state.mid::before { background: transparent; box-shadow: inset 0 0 0 1.5px var(--ash); }
  dl { display: grid; }
  dl > div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--rule); }
  dt { font-size: 12.5px; color: var(--ink-2); display: flex; align-items: center; }
  dd { font-size: 14px; white-space: nowrap; }
  dd.big { font-size: 22px; }
  .ro-why { font-size: 12px; color: var(--ink-3); }
  .ro-nav { display: flex; gap: 8px; }
  .ro-nav .btn { --h: 32px; height: 32px; font-size: 10px; padding: 0 12px; flex: 1; justify-content: center; }

  .chart { min-width: 0; display: grid; gap: 14px; }
  .key {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 10px; letter-spacing: 0.04em; color: var(--ink-3);
  }
  .key span { display: inline-flex; align-items: center; gap: 7px; }
  .key i { display: inline-block; width: 22px; height: 7px; }
  .key .k-ci { background: linear-gradient(var(--ash), var(--ash)) center / 100% 1px no-repeat, linear-gradient(var(--ash), var(--ash)) center / 50% 3.5px no-repeat; }
  .key .k-taut { background: linear-gradient(var(--red), var(--red)) center / 100% 1.3px no-repeat; }
  .key .k-slack { background: repeating-linear-gradient(90deg, var(--ash) 0 3px, transparent 3px 5.5px) center / 100% 1.3px no-repeat; }
  .key .hint { color: var(--ink-2); }

  @media (max-width: 1100px) {
    .hero { grid-template-columns: minmax(0, 1fr); }
    .readout dl { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); column-gap: 20px; }
    .readout dl > div { flex-direction: column; align-items: flex-start; gap: 2px; }
  }
</style>
