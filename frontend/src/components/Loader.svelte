<script lang="ts">
  /* Columna que respira mientras carga. */
  let { label = "Loading…", sub = "" }: { label?: string; sub?: string } = $props();
  let t = $state(0);
  $effect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { t = 0.6; return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { t = (now - start) / 1000; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
  const N = 5;
  const nodes = $derived(Array.from({ length: N }, (_, i) => ({
    x: 30 + Math.sin(t * 2.2 - i * 0.9) * 14 * (i % 2 ? 1 : -1),
    y: 84 - i * 18,
  })));
</script>

<div class="loader" role="status">
  <svg viewBox="0 0 60 96" width="60" height="96" aria-hidden="true">
    <line x1="30" x2="30" y1="0" y2="96" class="axis" />
    {#each nodes as n}<line x1="30" x2={n.x} y1={n.y} y2={n.y} class="cord" />{/each}
    <polyline points={nodes.map((n) => `${n.x},${n.y}`).join(" ")} class="rod" />
    {#each nodes as n}<circle cx={n.x} cy={n.y} r="3.4" class="ring" />{/each}
  </svg>
  <span class="label">{label}</span>
  {#if sub}<span class="sub">{sub}</span>{/if}
</div>

<style>
  .loader { display: grid; justify-items: center; gap: 12px; }
  .axis { stroke: var(--red); stroke-dasharray: 3 3; }
  .cord { stroke: var(--red); stroke-width: 1; opacity: 0.6; }
  .rod { fill: none; stroke: var(--ink); stroke-width: 4.5; stroke-linecap: round; stroke-linejoin: round; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 1.6; }
  .sub { font-size: 12.5px; color: var(--ink-3); max-width: 42ch; text-align: center; }
</style>
