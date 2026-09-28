<script lang="ts">
  /* Match summary in the list: the same win-probability curve, in miniature. */
  let { curve, flip = false, width = 112, height = 30 }:
    { curve: { m: number; p: number }[]; flip?: boolean; width?: number; height?: number } = $props();

  const pts = $derived.by(() => {
    if (!curve?.length) return [];
    const ms = curve.map((c) => c.m);
    const a = Math.min(...ms), b = Math.max(...ms);
    return curve.map((c) => ({
      x: 4 + ((c.m - a) / (b - a || 1)) * (width - 8),
      y: 3 + (1 - (flip ? 1 - c.p : c.p)) * (height - 6),
    }));
  });
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" aria-hidden="true">
  <line x1="0" x2={width} y1={height / 2} y2={height / 2} class="axis" />
  <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} class="rod" />
  {#each pts as p}<circle cx={p.x} cy={p.y} r="1.7" class="node" />{/each}
</svg>

<style>
  svg { overflow: visible; }
  .axis { stroke: var(--red); stroke-width: 0.8; stroke-dasharray: 2 2; }
  .rod { fill: none; stroke: var(--ink); stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
  .node { fill: var(--paper); stroke: var(--ink); stroke-width: 1; }
</style>
