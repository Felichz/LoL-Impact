<script lang="ts">
  import { api, ApiError, ROLE_ES, type LiveEntry, type LiveResult } from "../lib/api";
  import { app } from "../lib/state.svelte";
  import { champions } from "../lib/champions.svelte";
  import { signed } from "../lib/format";
  import ChampIcon from "../components/ChampIcon.svelte";
  import ForceBar from "../components/ForceBar.svelte";
  import Loader from "../components/Loader.svelte";
  import Rod from "../components/Rod.svelte";

  let status = $state<"idle" | "loading" | "ok" | "error">("idle");
  let data = $state<LiveResult | null>(null);
  let error = $state("");

  async function detect() {
    if (!app.riotId.trim()) return;
    status = "loading";
    try {
      data = await api.live(app.riotId.trim(), app.region);
      status = "ok";
    } catch (e) {
      status = "error";
      error = e instanceof ApiError && e.status === 503
        ? "No hay claves de la API vivas: la detección en vivo necesita consultar a Riot. Regenera las claves (caducan cada 24 h)."
        : e instanceof ApiError && e.status === 404
        ? `No encontramos la cuenta ${app.riotId} en ${app.region}.`
        : e instanceof Error ? e.message : "Error desconocido.";
    }
  }

  const sorted = (xs: LiveEntry[]) => [...xs].sort((a, b) => b.kill2 - a.kill2);
  const game = $derived(data && data.en_partida ? data : null);
  const groups = $derived(game ? [
    { title: "Rival: no les des kills", note: "cuanto más largo el cable, más gana su equipo si se ponen 2-0", rows: sorted(game[game.tu_lado === "blue" ? "red" : "blue"]) },
    { title: "Tu equipo: dónde una kill vale más", note: "prioriza jugar alrededor de los de arriba", rows: sorted(game[game.tu_lado]) },
  ] : []);
  const MAX = 30;
  const SAMPLE = [
    { champ: "Jinx", cls: "Bot · Marksman", v: 15.5, se: 2.4, ok: true },
    { champ: "Ahri", cls: "Mid · Mage · Assassin", v: 13.3, se: 2.5, ok: true },
    { champ: "Leona", cls: "Soporte · Tank · Support", v: 2.1, se: 2.2, ok: false },
  ];
</script>

<section class="live">
  <header class="head">
    <h1 class="display">En vivo</h1>
    <p class="prose">
      Detecta tu partida en curso y te dice qué rentan las kills tempranas de cada línea. Asumimos que
      <b>una kill ≈ 600 de oro de diferencia</b> en la línea (+300 quien mata, −300 quien muere), sin contar placas ni experiencia.
    </p>
    <button class="btn" type="button" onclick={detect} disabled={!app.riotId.trim() || status === "loading"}>
      {status === "loading" ? "Buscando" : "Detectar partida"}<Rod />
    </button>
  </header>

  {#if !app.riotId.trim()}
    <p class="empty prose">Escribe tu Riot ID arriba para poder buscar tu partida.</p>
  {:else if status === "idle"}
    <div class="empty">
      <p class="prose">Pulsa <b>Detectar partida</b> en la pantalla de carga o durante los primeros minutos. Buscaremos a <b>{app.riotId}</b> en {app.region}.</p>
      <figure class="preview" aria-label="Ejemplo ilustrativo del resultado">
        <ol>
          {#each SAMPLE as x, i}
            <li>
              <span class="rank num">{i + 1}</span>
              <ChampIcon id={x.champ} size={36} />
              <span class="who"><span class="nm">{champions.name(x.champ)}</span><span class="cls">{x.cls}</span></span>
              <ForceBar value={x.v} se={x.se} max={MAX} confirmed={x.ok} />
              <span class="vals"><span class="num v" class:slack={!x.ok}>{signed(x.v, 1)} pp</span><span class="sub">± {(1.96 * x.se).toFixed(1)} · si va 2-0</span></span>
            </li>
          {/each}
        </ol>
        <figcaption class="label">Ejemplo ilustrativo · así se verá cuando estés en partida</figcaption>
      </figure>
    </div>
  {:else if status === "loading"}
    <div class="center"><Loader label="Buscando tu partida…" /></div>
  {:else if status === "error"}
    <p class="err" role="alert">{error}</p>
  {:else if data && !data.en_partida}
    <div class="empty">
      <h2 class="sec-title">Sin partida en curso</h2>
      <p class="prose">{data.mensaje} Si acabas de entrar a la pantalla de carga, espera unos segundos y vuelve a intentarlo.</p>
    </div>
  {:else if game}
    <p class="meta label">
      <span class="dot"></span>{game.gameMode} · min {game.minutos} · impacto por clase, medido en el min 8
    </p>
    <div class="groups">
      {#each groups as g}
        <section class="group">
          <h2 class="sec-title">{g.title}</h2>
          <p class="note">{g.note}</p>
          <ol>
            {#each g.rows as x, i}
              <li>
                <span class="rank num">{i + 1}</span>
                <ChampIcon id={x.champ} size={36} />
                <span class="who">
                  <span class="nm">{champions.name(x.champ)}</span>
                  <span class="cls">{ROLE_ES[x.role] ?? x.role} · {x.tags.join(" · ") || "sin clase"}</span>
                </span>
                <ForceBar value={x.kill2} se={x.se_kill2} max={MAX} confirmed={x.identificado} />
                <span class="vals">
                  <span class="num v" class:slack={!x.identificado}>{signed(x.kill2, 1)} pp</span>
                  <span class="sub">± {(1.96 * x.se_kill2).toFixed(1)} · si va 2-0</span>
                </span>
              </li>
            {/each}
          </ol>
        </section>
      {/each}
    </div>
    <p class="fine">{game.nota} El rol de cada campeón se infiere de sus tags y puede fallar en picks poco habituales.</p>
  {/if}
</section>

<style>
  .live { display: grid; grid-template-columns: minmax(0, 1fr); gap: 36px; }
  .head { display: grid; grid-template-columns: auto 1fr auto; gap: 12px 40px; align-items: end; }
  .head h1 { font-size: clamp(44px, 5.5vw, 76px); }
  .head .prose { font-size: 14.5px; padding-bottom: 6px; }
  .head .btn { margin-bottom: 6px; }
  .empty { display: grid; gap: 10px; padding: 32px 0; border-top: 1px solid var(--rule-strong); }
  .preview { display: grid; gap: 10px; max-width: 760px; margin-top: 14px; opacity: 0.55; filter: grayscale(0.4); pointer-events: none; }
  .preview figcaption { text-align: left; }
  .center { min-height: 30vh; display: grid; place-items: center; }
  .err { color: var(--red-ink); font-size: 14px; max-width: 70ch; }
  .meta { display: flex; align-items: center; gap: 8px; color: var(--ink-2); }
  .meta .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--red); animation: pulse 1.6s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: 0.3; } }
  .groups { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 56px); }
  .group { display: grid; gap: 8px; align-content: start; }
  .note { font-size: 12.5px; color: var(--ink-3); }
  ol { list-style: none; padding: 0; border-top: 1px solid var(--rule-strong); margin-top: 6px; }
  li {
    display: grid;
    grid-template-columns: 18px 36px minmax(110px, 1fr) minmax(110px, 1.2fr) 118px;
    gap: 12px;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid var(--rule);
  }
  .rank { font-size: 11px; color: var(--ink-3); }
  li:first-child .rank { color: var(--red-ink); }
  .who { display: grid; min-width: 0; line-height: 1.3; }
  .nm { font-weight: 550; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .cls { font-size: 11px; color: var(--ink-3); }
  .vals { display: grid; text-align: right; }
  .v { font-size: 15px; }
  .v.slack { color: var(--ink-3); }
  .sub { font-size: 10.5px; color: var(--ink-3); }
  .fine { font-size: 12px; color: var(--ink-3); max-width: 90ch; }

  @media (max-width: 1100px) { .groups { grid-template-columns: minmax(0, 1fr); } }
  @media (max-width: 640px) {
    .head { grid-template-columns: 1fr; }
    li { grid-template-columns: 18px 32px 1fr 96px; }
    li :global(.fb) { grid-column: 2 / -1; grid-row: 2; }
  }
</style>
