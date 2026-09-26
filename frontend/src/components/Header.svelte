<script lang="ts">
  import { app, type View } from "../lib/state.svelte";
  import { REGIONS } from "../lib/api";
  import Rod from "./Rod.svelte";

  const NAV: { id: View; label: string }[] = [
    { id: "partidas", label: "Partidas" },
    { id: "vivo", label: "En vivo" },
    { id: "draft", label: "Draft" },
  ];
  const THEME_LABEL = { system: "Auto", light: "Claro", dark: "Oscuro" } as const;
  const nextTheme = { system: "light", light: "dark", dark: "system" } as const;

  const keys = $derived(app.health?.claves_vivas ?? 0);
  const status = $derived(
    app.healthError ? { on: false, text: "Servidor caído" }
    : !app.health ? { on: false, text: "Conectando…" }
    : keys > 0 ? { on: true, text: `API Riot · ${keys} ${keys === 1 ? "clave" : "claves"}` }
    : { on: false, text: "Sin claves · solo caché" },
  );

  function submit(e: SubmitEvent) {
    e.preventDefault();
    if (app.route.view !== "partidas") app.go("partidas");
    app.loadProfile();
  }
</script>

<header class="top">
  <a class="brand" href="#/partidas" aria-label="LoLImpact, inicio">
    <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
      <path d="M9 26 L20 6 M12 6 L23 26" class="cord" />
      <path d="M8 25 L15 11 M17 21 L24 7" class="rod" />
      <circle cx="15" cy="11" r="1.7" class="joint" /><circle cx="17" cy="21" r="1.7" class="joint" />
    </svg>
    <span class="word">LoL<b>Impact</b></span>
  </a>

  <nav aria-label="Secciones">
    {#each NAV as n}
      <a href="#/{n.id}" class:active={app.route.view === n.id} aria-current={app.route.view === n.id ? "page" : undefined}>
        {n.label}
      </a>
    {/each}
  </nav>

  <div class="status" class:off={!status.on} title={app.health ? `${app.health.claves_vivas} vivas, ${app.health.claves_muertas} caducadas · modelo ${app.health.modelo}` : ""}>
    <span class="dot"></span>{status.text}
  </div>

  <form class="profile" onsubmit={submit} class:hidden={app.route.view === "partidas" && !app.profile && app.profileStatus !== "loading"}>
    <label class="sr-only" for="rid">Riot ID</label>
    <input id="rid" class="field rid" placeholder="Nombre#TAG" autocomplete="off" spellcheck="false"
      bind:value={app.riotId} />
    <label class="sr-only" for="reg">Región</label>
    <select id="reg" class="field reg" bind:value={app.region}>
      {#each REGIONS as r}<option>{r}</option>{/each}
    </select>
    <button class="btn" type="submit" disabled={!app.riotId.trim() || app.profileStatus === "loading"}>
      {app.profileStatus === "loading" ? "Cargando" : "Cargar"}<Rod />
    </button>
  </form>

  <button class="theme" type="button" onclick={() => app.setTheme(nextTheme[app.theme])}
    aria-label="Cambiar tema (ahora: {THEME_LABEL[app.theme]})">
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" stroke-width="1.2" />
      <path d="M8 2 A6 6 0 0 1 8 14 Z" fill="currentColor" />
    </svg>
    <span>{THEME_LABEL[app.theme]}</span>
  </button>
</header>

<style>
  .top {
    position: sticky;
    top: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    gap: 28px;
    padding: 12px var(--gutter);
    background: color-mix(in srgb, var(--ground) 90%, transparent);
    backdrop-filter: blur(8px);
    border-bottom: 1px solid var(--rule-strong);
  }
  .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--ink); }
  .brand .rod { stroke: var(--ink); stroke-width: 3.6; stroke-linecap: round; fill: none; }
  .brand .cord { stroke: var(--red); stroke-width: 1.3; fill: none; }
  .brand .joint { fill: var(--ground); }
  .word {
    font-family: var(--font-mono);
    font-stretch: 81%;
    font-size: 17px;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .word b { font-weight: 400; color: var(--ink-2); }

  nav { display: flex; gap: 4px; }
  nav a {
    position: relative;
    padding: 8px 12px;
    font-family: var(--font-mono);
    font-stretch: 87.5%;
    font-size: 11.5px;
    font-weight: 450;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ink-2);
    text-decoration: none;
    transition: color 0.15s;
  }
  nav a:hover { color: var(--ink); }
  nav a.active { color: var(--red-ink); }
  nav a.active::after {
    content: "";
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: -13px;
    height: 1px;
    background: var(--red);
  }
  nav a.active::before {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -16px;
    width: 7px;
    height: 7px;
    margin-left: -3.5px;
    border-radius: 50%;
    background: var(--red);
  }

  .status {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-stretch: 87.5%;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-2);
    white-space: nowrap;
  }
  .status .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ink); }
  .status.off .dot { background: transparent; box-shadow: inset 0 0 0 1.5px var(--red); }
  .status.off { color: var(--red-ink); }

  .profile { display: flex; gap: 6px; }
  .profile.hidden { display: none; }
  .rid { width: 190px; }
  .reg { width: 78px; padding-right: 6px; }

  .theme {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 38px;
    padding: 0 4px;
    font-family: var(--font-mono);
    font-stretch: 87.5%;
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-3);
  }
  .theme:hover { color: var(--ink); }

  @media (max-width: 1180px) {
    .top { flex-wrap: wrap; row-gap: 10px; gap: 18px; }
    .profile { order: 5; width: 100%; justify-content: flex-end; }
    .rid { flex: 0 1 300px; width: auto; }
    nav a.active::after, nav a.active::before { display: none; }
    nav a.active { text-decoration: underline; text-decoration-color: var(--red); text-underline-offset: 6px; }
  }
  @media (max-width: 640px) {
    .top { position: static; gap: 10px 14px; }
    .profile { justify-content: stretch; }
    .rid { flex: 1; min-width: 0; }
    .profile .btn { padding: 0 12px; }
    .profile .btn :global(.rod) { display: none; }
    nav { order: 4; width: 100%; justify-content: space-between; border-top: 1px solid var(--rule); padding-top: 6px; }
    .status { font-size: 9.5px; }
    .theme span { display: none; }
  }
</style>
