<script lang="ts">
  import type { Snippet } from "svelte";
  let { text, children, label = "Qué significa" }: { text: string; children?: Snippet; label?: string } = $props();

  let open = $state(false);
  let host: HTMLSpanElement | undefined = $state();
  let pos = $state({ left: 0, top: 0, arrow: 0, below: false });
  const id = `tip-${Math.random().toString(36).slice(2, 8)}`;
  const W = 300;

  function show() {
    if (!host) return;
    const r = host.getBoundingClientRect();
    const w = Math.min(W, innerWidth * 0.8);
    const cx = r.left + r.width / 2;
    const left = Math.max(8, Math.min(cx - w / 2, innerWidth - w - 8));
    const below = r.top < 140;
    pos = { left, top: below ? r.bottom + 10 : r.top - 10, arrow: cx - left, below };
    open = true;
  }
  const hide = () => (open = false);
</script>

<svelte:window onscroll={hide} />

<span class="tip" bind:this={host} role="presentation" onmouseenter={show} onmouseleave={hide}>
  {#if children}
    <button type="button" class="trigger inline" aria-describedby={id}
      onfocus={show} onblur={hide} onclick={() => (open ? hide() : show())}>{@render children()}</button>
  {:else}
    <button type="button" class="trigger q" aria-label={label} aria-describedby={id}
      onfocus={show} onblur={hide} onclick={() => (open ? hide() : show())}>?</button>
  {/if}
  <span {id} role="tooltip" class="bubble" class:open class:below={pos.below}
    style:left="{pos.left}px" style:top="{pos.top}px" style:--arrow="{pos.arrow}px">{text}</span>
</span>

<style>
  .tip { position: relative; display: inline-flex; vertical-align: middle; }
  .trigger { cursor: help; }
  .q {
    display: inline-grid;
    place-items: center;
    width: 15px;
    height: 15px;
    margin-left: 5px;
    border-radius: 50%;
    border: 1px solid var(--ash);
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    color: var(--ink-3);
    line-height: 1;
    transition: border-color 0.15s, color 0.15s;
  }
  .q:hover, .q:focus-visible { border-color: var(--red); color: var(--red-ink); }
  .inline {
    text-align: inherit;
    text-decoration: underline dotted var(--ash);
    text-underline-offset: 3px;
  }
  .bubble {
    position: fixed;
    z-index: 60;
    display: none;
    width: max-content;
    max-width: min(300px, 80vw);
    padding: 10px 12px;
    background: var(--ink);
    color: var(--paper);
    font: 400 12.5px/1.5 var(--font-sans);
    text-transform: none;
    letter-spacing: 0;
    text-align: left;
    white-space: normal;
    border-radius: var(--radius);
    box-shadow: 0 10px 28px -8px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    transform: translateY(-100%);
    animation: tip-in 0.16s var(--ease-out);
  }
  .bubble.below { transform: none; }
  .bubble.open { display: block; }
  .bubble::after {
    content: "";
    position: absolute;
    left: var(--arrow);
    top: 100%;
    width: 1px;
    height: 9px;
    background: var(--red);
  }
  .bubble.below::after { top: auto; bottom: 100%; }
  @keyframes tip-in { from { opacity: 0; } }
</style>
