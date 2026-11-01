<script lang="ts">
  /* The win-chance line breathing around the 50% axis, shown while loading. */
  let { label = "Loading…", sub = "", progress = null }: { label?: string; sub?: string; progress?: number | null } = $props();
  let t = $state(0);
  $effect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { t = 0.6; return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => { t = (now - start) / 1000; raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
  const N = 6;
  const nodes = $derived(Array.from({ length: N }, (_, i) => ({
    x: 10 + i * 20,
    y: 30 + Math.sin(t * 2.2 - i * 0.9) * 13 * (i % 2 ? 1 : -1),
  })));
</script>

<div class="loader" role="status">
  <svg viewBox="0 0 120 60" width="120" height="60" aria-hidden="true">
    <line x1="0" x2="120" y1="30" y2="30" class="axis" />
    <polyline points={nodes.map((n) => `${n.x},${n.y}`).join(" ")} class="line" />
    {#each nodes as n}<circle cx={n.x} cy={n.y} r="3.4" class="ring" />{/each}
  </svg>
  <span class="label">{label}</span>
  {#if progress != null}<span class="bar" style:--f={progress}></span>{/if}
  {#if sub}<span class="sub">{sub}</span>{/if}
</div>

<style>
  .loader { display: grid; justify-items: center; gap: 12px; }
  .axis { stroke: var(--red); stroke-dasharray: 4 3; }
  .line { fill: none; stroke: var(--ink); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 1.6; }
  .bar {
    width: 220px; height: 2px;
    background: linear-gradient(var(--red), var(--red)) left / calc(var(--f) * 100%) 100% no-repeat, var(--rule);
    transition: background-size 0.4s var(--ease-out);
  }
  .sub { font-size: 12.5px; color: var(--ink-3); max-width: 42ch; text-align: center; }
</style>
