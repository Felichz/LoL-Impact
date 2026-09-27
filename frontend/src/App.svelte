<script lang="ts">
  import { onMount } from "svelte";
  import { app } from "./lib/state.svelte";
  import { champions } from "./lib/champions.svelte";
  import { i18n } from "./lib/i18n.svelte";
  import Header from "./components/Header.svelte";
  import Matches from "./views/Matches.svelte";
  import Live from "./views/Live.svelte";
  import Draft from "./views/Draft.svelte";

  $effect(() => { champions.ensure(i18n.lang); });

  onMount(() => {
    app.loadHealth();
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
  <span>{i18n.t.footer.disclaimer}</span>
  <span>{i18n.t.footer.modelInfo}</span>
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
