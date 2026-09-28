<script lang="ts">
  /* Divergent force cord from the axis. Taut (confirmed) = straight red;
     slack (the interval covers 0) = ash gray, dotted and hanging. */
  let {
    value,
    se = 0,
    max,
    confirmed,
    height = 22,
  }: { value: number; se?: number; max: number; confirmed: boolean; height?: number } = $props();

  let w = $state(200);
  const cx = $derived(w / 2);
  const s = $derived((v: number) => cx + (Math.max(-max, Math.min(max, v)) / max) * (w / 2 - 8));
  const end = $derived(s(value));
  const mid = $derived(height / 2);
  const sag = $derived(Math.min(7, Math.abs(end - cx) / 6 + 2));
  const lo = $derived(s(value - 1.96 * se));
  const hi = $derived(s(value + 1.96 * se));
</script>

<div class="fb" bind:clientWidth={w} style:height="{height}px">
  <svg width={w} {height} aria-hidden="true">
    <line x1="0" x2={w} y1={mid} y2={mid} class="base" />
    {#if se > 0}
      <line x1={lo} x2={hi} y1={mid + 5.5} y2={mid + 5.5} class="whisk" />
      <line x1={lo} x2={lo} y1={mid + 3} y2={mid + 8} class="whisk" />
      <line x1={hi} x2={hi} y1={mid + 3} y2={mid + 8} class="whisk" />
    {/if}
    {#if confirmed}
      <line x1={cx} x2={end} y1={mid} y2={mid} class="taut" />
      <circle cx={end} cy={mid} r="3.6" class="n-taut" />
    {:else}
      <path d="M{cx},{mid} Q{(cx + end) / 2},{mid + sag * 2} {end},{mid}" class="slack" />
      <circle cx={end} cy={mid} r="3.4" class="n-slack" />
    {/if}
    <line x1={cx} x2={cx} y1="1" y2={height - 1} class="axis" />
  </svg>
</div>

<style>
  .fb { width: 100%; min-width: 60px; }
  svg { overflow: visible; }
  .base { stroke: var(--rule); stroke-width: 1; }
  .axis { stroke: var(--red); stroke-width: 1; stroke-dasharray: 2 2; }
  .taut { stroke: var(--red); stroke-width: 2.2; stroke-linecap: round; }
  .n-taut { fill: var(--red); }
  .slack { fill: none; stroke: var(--ash); stroke-width: 1.4; stroke-dasharray: 3 2.5; }
  .n-slack { fill: var(--paper); stroke: var(--ash); stroke-width: 1.4; }
  .whisk { stroke: var(--ink-3); stroke-width: 0.9; opacity: 0.7; }
</style>
