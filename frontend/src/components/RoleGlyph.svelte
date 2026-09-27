<script lang="ts">
  import { i18n } from "../lib/i18n.svelte";
  let { role, size = 18, label = false }: { role: string; size?: number; label?: boolean } = $props();
  const roleName = $derived(i18n.t.common.role[role] ?? role);
</script>

<span class="role" title={roleName}>
  <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
    <rect x="1.5" y="1.5" width="15" height="15" rx="1.5" class="frame" />
    {#if role === "TOP"}
      <path d="M4 14 V4 H14" class="rod" /><circle cx="4" cy="4" r="1.7" class="node" />
    {:else if role === "MIDDLE"}
      <path d="M4.2 13.8 L13.8 4.2" class="rod" /><circle cx="9" cy="9" r="1.7" class="node" />
    {:else if role === "BOTTOM"}
      <path d="M4 14 H14 V4" class="rod" /><circle cx="14" cy="14" r="1.7" class="node" />
    {:else if role === "JUNGLE"}
      <path d="M4 11 L7.5 6 L10.5 12 L14 7" class="rod" /><circle cx="7.5" cy="6" r="1.4" class="node" /><circle cx="10.5" cy="12" r="1.4" class="node" />
    {:else if role === "UTILITY"}
      <path d="M4 14 H14 V4" class="thin" /><path d="M6.5 11.5 L10.5 7.5" class="rod" /><circle cx="10.5" cy="7.5" r="1.7" class="node" />
    {:else}
      <circle cx="9" cy="9" r="2" class="node" />
    {/if}
  </svg>
  {#if label}<span class="txt">{roleName}</span>{/if}
</span>

<style>
  .role { display: inline-flex; align-items: center; gap: 7px; }
  .frame { fill: none; stroke: var(--ash-soft); stroke-width: 1; }
  .rod { fill: none; stroke: var(--ink); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
  .thin { fill: none; stroke: var(--ash); stroke-width: 1; stroke-dasharray: 1.5 1.5; }
  .node { fill: var(--paper); stroke: var(--ink); stroke-width: 1.2; }
  .txt { font-family: var(--font-mono); font-stretch: 87.5%; font-size: 11.5px; color: var(--ink-2); }
</style>
