<script lang="ts">
  import { champions } from "../lib/champions.svelte";
  let { id, size = 32 }: { id: string; size?: number } = $props();
  let broken = $state(false);
  const src = $derived(champions.icon(id));
</script>

<span class="ci" style:width="{size}px" style:height="{size}px">
  {#if src && !broken}
    <img {src} alt="" width={size} height={size} loading="lazy" onerror={() => (broken = true)} />
  {:else}
    <span class="fallback" style:font-size="{Math.round(size * 0.36)}px">{id.slice(0, 2)}</span>
  {/if}
</span>

<style>
  .ci {
    position: relative;
    flex: none;
    display: inline-grid;
    place-items: center;
    background: var(--paper-2);
    border-radius: 2px;
    overflow: hidden;
    box-shadow: 0 0 0 1px var(--rule-strong);
  }
  img { width: 100%; height: 100%; object-fit: cover; transform: scale(1.1); filter: saturate(0.85) contrast(1.02); }
  .fallback { font-family: var(--font-mono); text-transform: uppercase; color: var(--ink-3); }
</style>
