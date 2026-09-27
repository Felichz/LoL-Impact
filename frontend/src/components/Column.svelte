<script lang="ts" module>
  export interface ColPoint { m: number; p: number; lo: number; hi: number }
  export interface LaneCord { rol: string; pp: number; identificado: boolean }
</script>

<script lang="ts">
  /* La columna: cada minuto evaluado es un nodo desplazado del eje del 50%.
     Tiempo hacia arriba, probabilidad de TU equipo en horizontal. */
  import { interval, pct } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";

  let {
    points,
    selected = $bindable(0),
    duration,
    win,
    cords = [],
  }: { points: ColPoint[]; selected?: number; duration: number; win: boolean | null; cords?: LaneCord[] } = $props();

  const SHORT: Record<string, string> = { TOP: "TOP", JUNGLE: "JG", MIDDLE: "MID", BOTTOM: "BOT", UTILITY: "SUP" };

  let W = $state(560);
  const H = $derived(W < 460 ? 560 : 620);
  const LBL = $derived(W < 460 ? 86 : 138);
  const X0 = $derived(LBL + (W < 460 ? 22 : 40));
  const X1 = $derived(W - 18);
  const TOP = 78;
  const BOT = $derived(H - 74);

  const mMin = $derived(Math.min(...points.map((p) => p.m)));
  const mMax = $derived(Math.max(...points.map((p) => p.m)));
  const y = (m: number) => BOT - ((m - (mMin - 1.3)) / (mMax + 1.3 - (mMin - 1.3))) * (BOT - TOP);
  const x = (p: number) => X0 + p * (X1 - X0);

  /* ---- animación: los nodos salen del eje en secuencia, con rebote ---- */
  let t = $state(1);
  let raf = 0;
  const backOut = (s: number) => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * (s - 1) ** 3 + c1 * (s - 1) ** 2; };
  $effect(() => {
    void points;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { t = 1; return; }
    cancelAnimationFrame(raf);
    const start = performance.now();
    const total = 650 + 95 * points.length;
    const tick = (now: number) => {
      t = Math.min((now - start) / total, 1);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    t = 0;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
  function ease(i: number) {
    const total = 650 + 95 * points.length;
    const local = (t * total - i * 95) / 650;
    return local <= 0 ? 0 : local >= 1 ? 1 : backOut(local);
  }

  const nodes = $derived(points.map((pt, i) => {
    const e = ease(i);
    const d = (v: number) => 0.5 + (v - 0.5) * e;
    const [lo50, hi50] = interval(pt.lo, pt.hi, 0.674);
    return {
      ...pt, i,
      cx: x(d(pt.p)), cy: y(pt.m),
      lo: x(d(pt.lo)), hi: x(d(pt.hi)),
      lo50: x(d(lo50)), hi50: x(d(hi50)),
    };
  }));

  const envelope = $derived(
    nodes.length
      ? `M${nodes.map((n) => `${n.lo},${n.cy}`).join(" L")} L${[...nodes].reverse().map((n) => `${n.hi},${n.cy}`).join(" L")} Z`
      : "",
  );

  /* barras entre nodos, recortadas para dejar ver el anillo */
  const rods = $derived(nodes.slice(1).map((b, k) => {
    const a = nodes[k];
    const dx = b.cx - a.cx, dy = b.cy - a.cy, len = Math.hypot(dx, dy) || 1;
    const r = 9;
    return { x1: a.cx + (dx / len) * r, y1: a.cy + (dy / len) * r, x2: b.cx - (dx / len) * r, y2: b.cy - (dy / len) * r };
  }));

  /* cables de línea del nodo activo: largo = pp en la misma escala del eje */
  const laneCords = $derived.by(() => {
    const n = nodes[selected];
    if (!n || !cords.length) return [];
    const ppx = (X1 - X0) / 100;
    const e = ease(selected);
    return cords.map((c, k) => {
      const dy = (k - (cords.length - 1) / 2) * 12;
      const ex = n.cx + c.pp * ppx * e;
      const ey = n.cy + dy;
      const right = c.pp >= 0;
      return {
        ...c, ex, ey, right,
        path: c.identificado
          ? `M${n.cx},${n.cy} L${ex},${ey}`
          : `M${n.cx},${n.cy} Q${(n.cx + ex) / 2},${(n.cy + ey) / 2 + 7} ${ex},${ey}`,
      };
    });
  });

  const last = $derived(nodes[nodes.length - 1]);
  const finalX = $derived(win == null ? x(0.5) : x(win ? 1 : 0));

  function onKey(e: KeyboardEvent, i: number) {
    let next = i;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") next = Math.min(i + 1, points.length - 1);
    else if (e.key === "ArrowDown" || e.key === "ArrowLeft") next = Math.max(i - 1, 0);
    else if (e.key === "Enter" || e.key === " ") { selected = i; e.preventDefault(); return; }
    else return;
    e.preventDefault();
    selected = next;
    (document.querySelector(`[data-node="${next}"]`) as SVGGElement | null)?.focus();
  }
</script>

<div class="col" bind:clientWidth={W}>
  <svg width={W} height={H} viewBox="0 0 {W} {H}" role="group" aria-label={i18n.t.column.ariaGroup}>
    <!-- rejilla de probabilidad -->
    {#each [0, 0.25, 0.75, 1] as g}
      <line x1={x(g)} x2={x(g)} y1={TOP - 26} y2={BOT + 16} class="grid" />
    {/each}
    <rect x={x(0.5)} y={TOP - 26} width={x(1) - x(0.5)} height={BOT - TOP + 42} class="favor" />

    <!-- envolvente del 95%: cables flojos a cada lado -->
    <path d={envelope} class="env" />
    {#if nodes.length > 1}
      <polyline points={nodes.map((n) => `${n.lo},${n.cy}`).join(" ")} class="slack" />
      <polyline points={nodes.map((n) => `${n.hi},${n.cy}`).join(" ")} class="slack" />
    {/if}

    <!-- eje del 50% -->
    <line x1={x(0.5)} x2={x(0.5)} y1={TOP - 40} y2={BOT + 26} class="axis" />
    <path d="M{x(0.5) - 4.5},{TOP - 46} h9 l-4.5,7 z" class="axis-tip" />
    <path d="M{x(0.5) - 4.5},{BOT + 32} h9 l-4.5,-7 z" class="axis-tip" />

    <!-- miembros de incertidumbre por nodo -->
    {#each nodes as n}
      <line x1={n.lo} x2={n.hi} y1={n.cy} y2={n.cy} class="ci95" />
      <line x1={n.lo} x2={n.lo} y1={n.cy - 4} y2={n.cy + 4} class="ci95" />
      <line x1={n.hi} x2={n.hi} y1={n.cy - 4} y2={n.cy + 4} class="ci95" />
      <line x1={n.lo50} x2={n.hi50} y1={n.cy} y2={n.cy} class="ci50" />
      <!-- cable de tensión: distancia a la moneda al aire -->
      <line x1={x(0.5)} x2={n.cx} y1={n.cy} y2={n.cy} class="cord" class:on={n.i === selected} />
    {/each}

    <!-- tramo final hasta el resultado -->
    {#if last && win != null}
      <line x1={last.cx} y1={last.cy} x2={finalX} y2={TOP - 34} class="final" />
      <circle cx={finalX} cy={TOP - 34} r="4.5" class="final-node" class:won={win} />
    {/if}

    <!-- barras de carbono -->
    {#each rods as r}
      <line x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} class="rod" />
    {/each}

    <!-- cables de línea en el nodo activo -->
    {#each laneCords as c}
      <path d={c.path} class="lane" class:slack={!c.identificado} />
      <circle cx={c.ex} cy={c.ey} r="2.3" class="lane-end" class:slack={!c.identificado} />
      <text x={c.right ? Math.max(c.ex, nodes[selected].cx + 16) + 5 : Math.min(c.ex, nodes[selected].cx - 16) - 5} y={c.ey + 3} class="lane-lbl" class:slack={!c.identificado}
        text-anchor={c.right ? "start" : "end"}>{SHORT[c.rol] ?? c.rol}</text>
    {/each}

    <!-- anotaciones con líneas guía -->
    {#each nodes as n}
      {@const sel = n.i === selected}
      <g class="ann" class:sel>
        <text x="14" y={n.cy - 6} class="ann-min">{i18n.t.column.minPrefix} {n.m}</text>
        <text x="14" y={n.cy + 14} class="ann-val">{pct(points[n.i].p)}</text>
        <path d="M{LBL - 6},{n.cy - 2} H{LBL + 8} L{LBL + 20},{n.cy} H{n.cx - 10}" class="leader" />
      </g>
    {/each}

    <!-- nodos -->
    {#each nodes as n}
      {@const sel = n.i === selected}
      <g
        class="node"
        class:sel
        data-node={n.i}
        role="button"
        tabindex={sel ? 0 : -1}
        aria-pressed={sel}
        aria-label={i18n.t.column.ariaNode(n.m, pct(points[n.i].p), pct(points[n.i].lo), pct(points[n.i].hi))}
        onclick={() => (selected = n.i)}
        onkeydown={(e) => onKey(e, n.i)}
      >
        <circle cx={n.cx} cy={n.cy} r="18" class="hit" />
        {#if sel}<circle cx={n.cx} cy={n.cy} r="13" class="halo" />{/if}
        <circle cx={n.cx} cy={n.cy} r="7.5" class="ring" />
        <circle cx={n.cx} cy={n.cy} r="2.6" class="core" />
      </g>
    {/each}

    <!-- rótulos -->
    {#if win != null}
      <text x={win ? X1 : X0} y={TOP - 50} class="final-lbl" text-anchor={win ? "end" : "start"}>
        {i18n.t.column.resultAt(win, duration)}
      </text>
    {/if}
    <text x={x(0.5)} y={H - 12} class="axis-lbl" text-anchor="middle">50%</text>
    <text x={x(0)} y={H - 12} class="axis-lbl" text-anchor="start">0%</text>
    <text x={x(1)} y={H - 12} class="axis-lbl" text-anchor="end">100%</text>
    <text x={x(0.5) - 12} y={BOT + 40} class="side-lbl" text-anchor="end">{i18n.t.column.rivalWins}</text>
    <text x={x(0.5) + 12} y={BOT + 40} class="side-lbl" text-anchor="start">{i18n.t.column.yourTeamWins}</text>
  </svg>
</div>

<style>
  .col { width: 100%; min-width: 0; }
  svg { overflow: visible; font-family: var(--font-mono); font-stretch: 87.5%; user-select: none; }

  .grid { stroke: var(--rule); stroke-width: 1; stroke-dasharray: 2 4; }
  .favor { fill: var(--red-wash); opacity: 0.35; }
  .env { fill: var(--ash); opacity: 0.1; }
  .slack { fill: none; stroke: var(--ash); stroke-width: 1; }
  .axis { stroke: var(--red); stroke-width: 1; stroke-dasharray: 5 4; }
  .axis-tip { fill: var(--red); }
  .ci95 { stroke: var(--ash); stroke-width: 1; }
  .ci50 { stroke: var(--ash); stroke-width: 3.5; stroke-linecap: round; opacity: 0.8; }
  .cord { stroke: var(--red); stroke-width: 1.1; opacity: 0.55; }
  .cord.on { opacity: 1; stroke-width: 1.6; }

  .rod { stroke: var(--ink); stroke-width: 8; stroke-linecap: round; }
  .lane { fill: none; stroke: var(--red); stroke-width: 1.3; }
  .lane.slack { stroke: var(--ash); stroke-dasharray: 3 2.5; }
  .lane-end { fill: var(--red); }
  .lane-end.slack { fill: var(--paper); stroke: var(--ash); stroke-width: 1.2; }
  .lane-lbl { font-size: 8.5px; letter-spacing: 0.06em; fill: var(--red-ink); paint-order: stroke; stroke: var(--ground); stroke-width: 3px; }
  .lane-lbl.slack { fill: var(--ink-3); }

  .final { stroke: var(--ink-3); stroke-width: 1; stroke-dasharray: 3 4; }
  .final-node { fill: var(--paper); stroke: var(--ink); stroke-width: 1.5; }
  .final-lbl { font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase; fill: var(--ink-2); }

  .ann-min { font-size: 10px; letter-spacing: 0.08em; fill: var(--ink-3); }
  .ann-val { font-size: 19px; font-weight: 400; fill: var(--ink); font-variant-numeric: tabular-nums; }
  .leader { fill: none; stroke: var(--ink-3); stroke-width: 0.8; stroke-dasharray: 1 2.5; }
  .ann.sel .ann-min, .ann.sel .ann-val { fill: var(--red-ink); }
  .ann.sel .leader { stroke: var(--red); opacity: 1; }

  .node { cursor: pointer; outline: none; }
  .hit { fill: transparent; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 2.6; transition: stroke 0.2s; }
  .core { fill: var(--ink); }
  .halo { fill: none; stroke: var(--red); stroke-width: 1; }
  .node:hover .ring { stroke: var(--red); }
  .node.sel .ring { stroke: var(--red); }
  .node.sel .core { fill: var(--red); }
  .node:focus-visible .ring { stroke: var(--red); stroke-width: 3.5; }

  .axis-lbl { font-size: 10px; fill: var(--ink-3); font-variant-numeric: tabular-nums; }
  .side-lbl { font-size: 10px; letter-spacing: 0.04em; fill: var(--ink-3); }
</style>
