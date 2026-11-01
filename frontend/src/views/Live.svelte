<script lang="ts">
  import { api, ApiError, type LiveEntry, type LiveResult } from "../lib/api";
  import { app } from "../lib/state.svelte";
  import { champions } from "../lib/champions.svelte";
  import { chance } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import ChampIcon from "../components/ChampIcon.svelte";
  import ForceBar from "../components/ForceBar.svelte";
  import Loader from "../components/Loader.svelte";
  import Rod from "../components/Rod.svelte";
  import WinCondition from "../components/WinCondition.svelte";
  import type { WCEntry } from "../lib/story";

  let status = $state<"idle" | "loading" | "ok" | "error">("idle");
  let data = $state<LiveResult | null>(null);
  let error = $state("");

  const t = $derived(i18n.t.liveView);
  const tc = $derived(i18n.t.common);

  async function detect() {
    if (!app.riotId.trim()) return;
    status = "loading";
    try {
      data = await api.live(app.riotId.trim(), app.region);
      status = "ok";
    } catch (e) {
      status = "error";
      error = e instanceof ApiError && e.status === 503
        ? t.noKeysError
        : e instanceof ApiError && e.status === 404
        ? t.accountNotFound(app.riotId, app.region)
        : e instanceof ApiError ? i18n.server(e.message)
        : e instanceof Error ? e.message : tc.unknownError;
    }
  }

  const sorted = (xs: LiveEntry[]) => [...xs].sort((a, b) => b.kill2 - a.kill2);
  const game = $derived(data && data.en_partida ? data : null);
  const rivals = $derived(game ? sorted(game[game.tu_lado === "blue" ? "red" : "blue"]) : []);
  const allies = $derived(game ? sorted(game[game.tu_lado]) : []);
  const MAX = 30;
  const toWC = (xs: LiveEntry[]): WCEntry[] =>
    xs.map((x) => ({ champ: x.champ, role: x.role, tags: x.tags, value: x.kill2, se: x.se_kill2, sure: x.identificado }));

  const SAMPLE: LiveEntry[] = [
    { champ: "Jinx", role: "BOTTOM", tags: ["Marksman"], pp1000: 12.9, se: 2, kill1: 7.7, kill2: 15.5, se_kill2: 2.4, identificado: true },
    { champ: "Ahri", role: "MIDDLE", tags: ["Mage", "Assassin"], pp1000: 11.1, se: 2.1, kill1: 6.7, kill2: 13.3, se_kill2: 2.5, identificado: true },
    { champ: "Leona", role: "UTILITY", tags: ["Tank", "Support"], pp1000: 1.8, se: 1.8, kill1: 1.1, kill2: 2.1, se_kill2: 2.2, identificado: false },
  ];
</script>


{#snippet row(x: LiveEntry, i: number)}
  <li class="row">
    <span class="rank num">{i + 1}</span>
    <ChampIcon id={x.champ} size={32} />
    <span class="who">
      <span class="nm">{champions.name(x.champ)}</span>
      <span class="cls">{tc.role[x.role] ?? x.role} · {x.tags.join(" · ") || tc.noClass}</span>
    </span>
    <ForceBar value={x.kill2} se={x.se_kill2} max={MAX} confirmed={x.identificado} />
    <span class="vals">
      <span class="num v" class:slack={!x.identificado}>{chance(x.kill2)}</span>
      <span class="sub">± {(1.96 * x.se_kill2).toFixed(1)}</span>
    </span>
  </li>
{/snippet}

<section class="live">
  <header class="head">
    <h1 class="display">{t.title}</h1>
    <p class="prose">{t.intro}</p>
    <button class="btn" type="button" onclick={detect} disabled={!app.riotId.trim() || status === "loading"}>
      {status === "loading" ? t.detecting : t.detect}<Rod />
    </button>
  </header>

  {#if !app.riotId.trim()}
    <p class="empty prose">{t.noRiotId}</p>
  {:else if status === "idle"}
    <div class="empty">
      <p class="prose">{t.idlePrompt} {t.idleSearching(app.riotId, app.region)}</p>
      <figure class="preview" aria-label={t.previewLabel}>
        <WinCondition title={i18n.t.winCon.titleLive} rival={toWC(SAMPLE)} unit={i18n.t.winCon.perKills} />
        <figcaption class="label">{t.previewCaption}</figcaption>
      </figure>
    </div>
  {:else if status === "loading"}
    <div class="center"><Loader label={t.searching} /></div>
  {:else if status === "error"}
    <p class="err" role="alert">{error}</p>
  {:else if data && !data.en_partida}
    <div class="empty">
      <h2 class="sec-title">{t.noGameTitle}</h2>
      <p class="prose">{i18n.server(data.mensaje)} {t.noGameRest}</p>
    </div>
  {:else if game}
    <p class="meta label"><span class="dot"></span>{t.metaLine(game.gameMode, game.minutos)}</p>

    <WinCondition title={i18n.t.winCon.titleLive} rival={toWC(rivals)} own={toWC(allies)} unit={i18n.t.winCon.perKills} />

    <section class="all">
      <h2 class="sec-title">{t.allTitle}</h2>
      <div class="groups">
        <div>
          <h3 class="label">{t.rivalTitle}</h3>
          <ol class="rows">{#each rivals as x, i}{@render row(x, i)}{/each}</ol>
        </div>
        <div>
          <h3 class="label">{t.teamTitle}</h3>
          <ol class="rows">{#each allies as x, i}{@render row(x, i)}{/each}</ol>
        </div>
      </div>
    </section>
    <p class="fine">{i18n.server(game.nota)} {t.fine}</p>
  {/if}
</section>

<style>
  .live { display: grid; grid-template-columns: minmax(0, 1fr); gap: 36px; }
  .head { display: grid; grid-template-columns: auto 1fr auto; gap: 12px 40px; align-items: end; }
  .head h1 { font-size: clamp(44px, 5.5vw, 76px); }
  .head .prose { font-size: 14.5px; padding-bottom: 6px; }
  .head .btn { margin-bottom: 6px; }
  .empty { display: grid; gap: 14px; padding: 32px 0; border-top: 1px solid var(--rule-strong); }
  .preview { display: grid; gap: 12px; max-width: 900px; margin-top: 10px; opacity: 0.6; filter: grayscale(0.4); pointer-events: none; }
  .center { min-height: 30vh; display: grid; place-items: center; }
  .err { color: var(--red-ink); font-size: 14px; max-width: 70ch; }
  .meta { display: flex; align-items: center; gap: 8px; color: var(--ink-2); }
  .meta .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--red); animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.3; } }

  ol { list-style: none; padding: 0; }

  .all { display: grid; gap: 14px; padding-top: 22px; border-top: 1px solid var(--rule-strong); }
  .groups { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 56px); }
  .groups h3 { margin-bottom: 6px; }
  .rows { border-top: 1px solid var(--rule-strong); }
  .row {
    display: grid;
    grid-template-columns: 18px 32px minmax(110px, 1fr) minmax(100px, 1.2fr) 70px;
    gap: 12px; align-items: center; padding: 9px 0; border-bottom: 1px solid var(--rule);
  }
  .rank { font-size: 11px; color: var(--ink-3); }
  .who { display: grid; min-width: 0; line-height: 1.3; }
  .nm { font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cls { font-size: 11.5px; color: var(--ink-3); }
  .vals { display: grid; text-align: right; }
  .v { font-size: 15px; }
  .v.slack { color: var(--ink-3); }
  .sub { font-size: 11px; color: var(--ink-3); }
  .fine { font-size: 12px; color: var(--ink-3); max-width: 90ch; }

  @media (max-width: 1100px) { .groups { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 640px) {
    .head { grid-template-columns: 1fr; }
    .row { grid-template-columns: 18px 32px 1fr 64px; }
    .row :global(.fb) { grid-column: 2 / -1; grid-row: 2; }
  }
</style>
