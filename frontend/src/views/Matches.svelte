<script lang="ts">
  import { app } from "../lib/state.svelte";
  import { REGIONS } from "../lib/api";
  import { i18n } from "../lib/i18n.svelte";
  import Column from "../components/Column.svelte";
  import Loader from "../components/Loader.svelte";
  import MatchDetail from "../components/MatchDetail.svelte";
  import MatchList from "../components/MatchList.svelte";
  import Pattern from "../components/Pattern.svelte";
  import Rod from "../components/Rod.svelte";

  const t = $derived(i18n.t);
  const current = $derived(app.route.matchId ?? app.profile?.matches[0]?.match_id ?? null);

  // ejemplo ilustrativo para la portada (no son datos reales)
  const SAMPLE = [
    { m: 8, p: 0.46, lo: 0.36, hi: 0.57 },
    { m: 10, p: 0.41, lo: 0.3, hi: 0.53 },
    { m: 12, p: 0.52, lo: 0.4, hi: 0.63 },
    { m: 15, p: 0.71, lo: 0.59, hi: 0.81 },
    { m: 18, p: 0.78, lo: 0.66, hi: 0.87 },
    { m: 20, p: 0.86, lo: 0.75, hi: 0.93 },
  ];
  let sampleSel = $state(3);

  function submit(e: SubmitEvent) {
    e.preventDefault();
    app.loadProfile();
  }
</script>

{#if app.profileStatus === "idle" || (app.profileStatus === "error" && !app.profile)}
  <section class="onboard">
    <div class="copy">
      <h1 class="display">{t.onboard.titleLine1}<br />{t.onboard.titleLine2}</h1>
      <p class="lead">{t.onboard.lead}</p>
      <form class="load" onsubmit={submit}>
        <label for="rid-big" class="label">{t.onboard.yourRiotId}</label>
        <div class="row">
          <input id="rid-big" class="field" placeholder={t.header.riotIdPlaceholder} autocomplete="off" spellcheck="false" bind:value={app.riotId} />
          <select class="field" bind:value={app.region} aria-label={t.onboard.region}>
            {#each REGIONS as r}<option>{r}</option>{/each}
          </select>
          <button class="btn" type="submit" disabled={!app.riotId.trim()}>{t.onboard.cta}<Rod /></button>
        </div>
      </form>
      {#if app.profileStatus === "error"}
        <p class="err" role="alert">{app.profileError}</p>
      {/if}
      <ul class="points">
        {#each t.onboard.points as p}
          <li><b>{p.b}</b> {p.rest}</li>
        {/each}
      </ul>
    </div>
    <figure class="sample">
      <Column points={SAMPLE} bind:selected={sampleSel} duration={31} win={true} />
      <figcaption class="label">{t.onboard.sampleCaption}</figcaption>
    </figure>
  </section>
{:else if app.profileStatus === "loading" && !app.profile}
  <div class="center">
    <Loader label={t.matches.loadingTitle} sub={t.matches.loadingSub} />
  </div>
{:else if app.profile}
  {#if app.profile.degradado}
    <p class="banner" role="status">
      <b>{t.matches.offline}</b> — {i18n.server(app.profile.motivo ?? "")}. {t.matches.offlineShowingCached}
    </p>
  {/if}
  {#if app.profileStatus === "loading"}
    <p class="refresh label" role="status"><span class="spin"></span>{t.matches.refreshing}</p>
  {/if}
  {#if app.profileStatus === "error"}
    <p class="banner" role="alert"><b>{t.matches.updateFailed}</b> — {app.profileError}</p>
  {/if}

  {#if app.profile.matches.length === 0}
    <div class="center"><p class="prose">{t.matches.noRankedGames}</p></div>
  {:else}
    <div class="split" class:has-detail={!!app.route.matchId}>
      <aside class="rail">
        {#if app.profile.patron}
          <Pattern wins={app.profile.patron.wins} losses={app.profile.patron.losses} />
        {/if}
        <MatchList matches={app.profile.matches} {current} onpick={(id) => app.go("partidas", id)} />
      </aside>
      <div class="main">
        <a class="back label" href="#/partidas">{t.matches.backToAll}</a>
        {#if current}
          {#key current}<MatchDetail matchId={current} />{/key}
        {/if}
      </div>
    </div>
  {/if}
{/if}

<style>
  .onboard {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    gap: clamp(32px, 6vw, 96px);
    align-items: center;
    padding: clamp(24px, 6vh, 72px) 0;
  }
  .copy { display: grid; gap: 22px; }
  h1 { font-size: clamp(46px, 6.4vw, 92px); line-height: 1.04; }
  .lead { font-size: 17px; line-height: 1.55; color: var(--ink-2); max-width: 48ch; text-wrap: pretty; }
  .load { display: grid; gap: 8px; margin-top: 6px; }
  .load .row { display: flex; gap: 8px; flex-wrap: wrap; }
  .load .field { height: 44px; font-size: 14px; }
  .load input { flex: 1 1 220px; }
  .load .btn { height: 44px; }
  .err { font-size: 13.5px; color: var(--red-ink); max-width: 60ch; }
  .points { list-style: none; padding: 0; display: grid; gap: 8px; margin-top: 8px; border-top: 1px solid var(--rule); padding-top: 18px; }
  .points li { font-size: 13.5px; color: var(--ink-2); padding-left: 20px; position: relative; }
  .points li::before { content: ""; position: absolute; left: 2px; top: 8px; width: 9px; height: 1px; background: var(--red); }
  .points b { color: var(--ink); font-weight: 600; }
  .sample { display: grid; gap: 10px; max-width: 560px; justify-self: end; width: 100%; }
  .sample figcaption { text-align: center; }

  .center { min-height: 50vh; display: grid; place-items: center; }

  .banner {
    margin-bottom: 20px;
    padding: 10px 14px;
    font-size: 13px;
    color: var(--ink-2);
    background: repeating-linear-gradient(-45deg, transparent 0 6px, var(--red-wash) 6px 12px), var(--paper);
    border: 1px solid color-mix(in srgb, var(--red) 40%, transparent);
    border-radius: var(--radius);
  }
  .banner b { color: var(--red-ink); font-weight: 600; }

  .refresh { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; color: var(--ink-2); }
  .spin { width: 18px; height: 1px; background: var(--red); transform-origin: left; animation: tense 1.2s var(--ease-out) infinite alternate; }
  @keyframes tense { from { transform: scaleX(0.2); } to { transform: scaleX(1); } }

  .split {
    --railw: var(--rail);
    --gap: 56px;
    position: relative;
    display: grid;
    grid-template-columns: var(--railw) minmax(0, 1fr);
    gap: var(--gap);
    align-items: start;
  }
  /* bastidor: regla vertical entre riel y lienzo, anclada a la cabecera con un nodo rojo */
  .split::before {
    content: "";
    position: absolute;
    left: calc(var(--railw) + var(--gap) / 2);
    top: calc(-1 * clamp(24px, 4vh, 44px));
    bottom: -72px;
    width: 1px;
    background: var(--rule);
  }
  .split::after {
    content: "";
    position: absolute;
    left: calc(var(--railw) + var(--gap) / 2 - 3.5px);
    top: calc(-1 * clamp(24px, 4vh, 44px) - 4px);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--red);
  }
  .rail {
    position: sticky;
    top: 86px;
    display: grid;
    gap: 36px;
    max-height: calc(100dvh - 110px);
    overflow-y: auto;
    padding: 4px 8px 24px 8px;
    margin-left: -8px;
    scrollbar-width: thin;
  }
  .main { min-width: 0; }
  .back { display: none; margin-bottom: 18px; text-decoration: none; color: var(--ink-2); }

  @media (max-width: 1180px) {
    .split { --railw: 320px; --gap: 40px; }
  }
  @media (max-width: 960px) {
    .onboard { grid-template-columns: minmax(0, 1fr); }
    .sample { justify-self: stretch; }
    .split { grid-template-columns: minmax(0, 1fr); }
    .split::before, .split::after { display: none; }
    .rail { position: static; max-height: none; overflow: visible; }
    .split.has-detail .rail { display: none; }
    .split:not(.has-detail) .main { display: none; }
    .back { display: inline-block; }
  }
</style>
