<script lang="ts">
  import { onMount } from "svelte";
  import { app } from "./lib/state.svelte";
  import { champions } from "./lib/champions.svelte";
  import Header from "./components/Header.svelte";
  import Matches from "./views/Matches.svelte";
  import Live from "./views/Live.svelte";
  import Draft from "./views/Draft.svelte";

  onMount(() => {
    app.loadHealth();
    champions.ensure();
    if (app.riotId.trim()) app.loadProfile();
    const t = setInterval(() => app.loadHealth(), 60_000);
    return () => clearInterval(t);
  });
</script>

<Header />

<main>
  {#if app.route.view === "vivo"}
    <Live />
  {:else if app.route.view === "draft"}
    <Draft />
  {:else}
    <Matches />
  {/if}
</main>

<footer>
  <span>LoLImpact no está afiliado ni respaldado por Riot Games. League of Legends es propiedad de Riot Games, Inc.</span>
  <span>Modelo v3 · ~30k partidas Esmeralda+ LAS · atribuciones correlacionales, no causales</span>
</footer>

<style>
  main {
    width: 100%;
    max-width: 1480px;
    margin: 0 auto;
    padding: clamp(24px, 4vh, 44px) var(--gutter) 72px;
    min-height: calc(100dvh - 140px);
  }
  footer {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px 24px;
    max-width: 1480px;
    margin: 0 auto;
    padding: 18px var(--gutter) 28px;
    border-top: 1px solid var(--rule);
    font-size: 11.5px;
    color: var(--ink-3);
  }
</style>
