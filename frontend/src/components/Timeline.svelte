<script lang="ts" module>
  export interface TPoint { m: number; p: number; lo: number; hi: number }
</script>

<script lang="ts">
  /* Your team's chance to win, minute by minute: time left to right, like the in-client gold graph. */
  import { interval, pct } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";

  let {
    points,
    selected = $bindable(0),
    duration,
    win,
  }: { points: TPoint[]; selected?: number; duration: number; win: boolean | null } = $props();

  const t = $derived(i18n.t.timeline);

  let W = $state(640);
  const narrow = $derived(W < 520);
  const H = $derived(narrow ? 250 : 300);
  const PL = $derived(narrow ? 34 : 42);
  const PR = $derived(narrow ? 18 : 26);
  const PT = 34;
  const PB = 30;

  const mMin = $derived(Math.min(...points.map((p) => p.m)));
  const mMax = $derived(Math.max(...points.map((p) => p.m)));
  const mEnd = $derived(mMax + (win == null ? 1 : 3.2));
  const x = (m: number) => PL + ((m - (mMin - 1)) / (mEnd - (mMin - 1))) * (W - PL - PR);
  const y = (p: number) => PT + (1 - p) * (H - PT - PB);

  /* entrance: points rise from the 50% line one after another */
  let k = $state(1);
  $effect(() => {
    void points;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { k = 1; return; }
    const start = performance.now();
    const total = 600 + 80 * points.length;
    let raf = 0;
    const tick = (now: number) => {
      k = Math.min((now - start) / total, 1);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    k = 0;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
  const backOut = (s: number) => 1 + 2.25 * (s - 1) ** 3 + 1.25 * (s - 1) ** 2;
  function ease(i: number) {
    const total = 600 + 80 * points.length;
    const local = (k * total - i * 80) / 600;
    return local <= 0 ? 0 : local >= 1 ? 1 : backOut(local);
  }

  const nodes = $derived(points.map((pt, i) => {
    const e = ease(i);
    const d = (v: number) => 0.5 + (v - 0.5) * e;
    const [lo50, hi50] = interval(pt.lo, pt.hi, 0.674);
    return { ...pt, i, cx: x(pt.m), cy: y(d(pt.p)), lo: y(d(pt.lo)), hi: y(d(pt.hi)), lo50: y(d(lo50)), hi50: y(d(hi50)) };
  }));

  const band = (top: "hi" | "hi50", bot: "lo" | "lo50") =>
    nodes.length
      ? `M${nodes.map((n) => `${n.cx},${n[top]}`).join(" L")} L${[...nodes].reverse().map((n) => `${n.cx},${n[bot]}`).join(" L")} Z`
      : "";
  const band95 = $derived(band("hi", "lo"));
  const band50 = $derived(band("hi50", "lo50"));

  const last = $derived(nodes[nodes.length - 1]);
  const finalY = $derived(win == null ? y(0.5) : y(win ? 1 : 0));

  function onKey(e: KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = Math.min(i + 1, points.length - 1);
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(i - 1, 0);
    else if (e.key === "Enter" || e.key === " ") { selected = i; e.preventDefault(); return; }
    else return;
    e.preventDefault();
    selected = next;
    (e.currentTarget as SVGGElement).parentElement?.querySelector<SVGGElement>(`[data-node="${next}"]`)?.focus();
  }
</script>

<div class="tl" bind:clientWidth={W}>
  <svg width={W} height={H} viewBox="0 0 {W} {H}" role="group" aria-label={t.aria}>
    <!-- your-team-ahead half -->
    <rect x={PL} y={PT} width={W - PL - PR} height={y(0.5) - PT} class="ahead" />
    <text x={PL + 8} y={PT + 13} class="half">↑ {t.yourTeamAhead}</text>
    <text x={PL + 8} y={H - PB - 7} class="half">↓ {t.rivalAhead}</text>

    {#each [0, 0.25, 0.75, 1] as g}
      <line x1={PL} x2={W - PR} y1={y(g)} y2={y(g)} class="grid" />
    {/each}
    {#each [0, 0.5, 1] as g}
      <text x={PL - 8} y={y(g) + 3.5} class="ylbl" text-anchor="end">{g * 100}%</text>
    {/each}

    <!-- margin of error -->
    <path d={band95} class="b95" />
    <path d={band50} class="b50" />

    <!-- 50%: coin flip -->
    <line x1={PL} x2={W - PR} y1={y(0.5)} y2={y(0.5)} class="axis" />

    <!-- selected minute guide -->
    {#if nodes[selected]}
      <line x1={nodes[selected].cx} x2={nodes[selected].cx} y1={PT - 6} y2={H - PB + 4} class="guide" />
    {/if}

    <!-- after min 20: dashed to the result -->
    {#if last && win != null}
      <line x1={last.cx} y1={last.cy} x2={x(mEnd)} y2={finalY} class="final" />
      <circle cx={x(mEnd)} cy={finalY} r="4.5" class="final-node" class:won={win} />
      <text x={x(mEnd)} y={win ? finalY + 20 : finalY - 12} class="final-lbl" text-anchor="end">{t.resultAt(win, duration)}</text>
    {/if}

    <polyline points={nodes.map((n) => `${n.cx},${n.cy}`).join(" ")} class="line" />

    {#each nodes as n}
      {@const sel = n.i === selected}
      <text x={n.cx} y={n.cy - 13} class="val" class:sel text-anchor="middle">{pct(points[n.i].p)}</text>
      <text x={n.cx} y={H - PB + 19} class="xlbl" class:sel text-anchor="middle">{n.m}′</text>
      <g
        class="node"
        class:sel
        data-node={n.i}
        role="button"
        tabindex={sel ? 0 : -1}
        aria-pressed={sel}
        aria-label={t.node(n.m, pct(points[n.i].p), pct(points[n.i].lo), pct(points[n.i].hi))}
        onclick={() => (selected = n.i)}
        onkeydown={(e) => onKey(e, n.i)}
      >
        <circle cx={n.cx} cy={n.cy} r="18" class="hit" />
        {#if sel}<circle cx={n.cx} cy={n.cy} r="11" class="halo" />{/if}
        <circle cx={n.cx} cy={n.cy} r="6.5" class="ring" />
        <circle cx={n.cx} cy={n.cy} r="2.3" class="core" />
      </g>
    {/each}
  </svg>
</div>

<style>
  .tl { width: 100%; min-width: 0; }
  svg { display: block; overflow: visible; font-family: var(--font-mono); font-stretch: 87.5%; user-select: none; }
  .ahead { fill: var(--red-wash); opacity: 0.45; }
  .half { font-size: 9.5px; letter-spacing: 0.06em; text-transform: uppercase; fill: var(--ink-3); }
  .grid { stroke: var(--rule); stroke-width: 1; stroke-dasharray: 2 4; }
  .ylbl, .xlbl { font-size: 10.5px; fill: var(--ink-3); font-variant-numeric: tabular-nums; }
  .xlbl.sel { fill: var(--red-ink); }
  .b95 { fill: var(--ash); opacity: 0.16; }
  .b50 { fill: var(--ash); opacity: 0.22; }
  .axis { stroke: var(--red); stroke-width: 1; stroke-dasharray: 5 4; }
  .guide { stroke: var(--red); stroke-width: 1; opacity: 0.35; }
  .final { stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 3 4; }
  .final-node { fill: var(--paper); stroke: var(--ink); stroke-width: 1.5; }
  .final-node.won { fill: var(--ink); }
  .final-lbl { font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; fill: var(--ink-2); }
  .line { fill: none; stroke: var(--ink); stroke-width: 3.5; stroke-linecap: round; stroke-linejoin: round; }
  .val { font-size: 11.5px; fill: var(--ink-2); font-variant-numeric: tabular-nums; paint-order: stroke; stroke: var(--ground); stroke-width: 4px; }
  .val.sel { font-size: 14px; fill: var(--red-ink); font-weight: 500; }
  .node { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 2.4; transition: stroke 0.2s; }
  .core { fill: var(--ink); }
  .halo { fill: none; stroke: var(--red); stroke-width: 1; }
  .node:hover .ring, .node.sel .ring { stroke: var(--red); }
  .node.sel .core { fill: var(--red); }
  .node:focus-visible .ring { stroke: var(--red); stroke-width: 3.4; }
</style>
