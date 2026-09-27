<script lang="ts">
  import { champions } from "../lib/champions.svelte";
  import { i18n } from "../lib/i18n.svelte";
  import ChampIcon from "./ChampIcon.svelte";

  let { value = $bindable(""), label, taken = [] }: { value?: string; label: string; taken?: string[] } = $props();
  const t = $derived(i18n.t.draftView);

  let q = $state("");
  let open = $state(false);
  let active = $state(0);
  let input: HTMLInputElement | undefined = $state();
  const id = `cp-${Math.random().toString(36).slice(2, 8)}`;

  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const results = $derived(
    champions.list
      .filter((c) => !taken.includes(c.id) || c.id === value)
      .filter((c) => !q || norm(c.name).includes(norm(q)))
      .slice(0, 8),
  );

  function pick(cid: string) {
    value = cid;
    q = "";
    open = false;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === "ArrowDown") { open = true; active = Math.min(active + 1, results.length - 1); e.preventDefault(); }
    else if (e.key === "ArrowUp") { active = Math.max(active - 1, 0); e.preventDefault(); }
    else if (e.key === "Enter" && open && results[active]) { pick(results[active].id); e.preventDefault(); }
    else if (e.key === "Escape") { open = false; }
  }
</script>

<div class="cp">
  {#if value}
    <div class="chosen">
      <ChampIcon id={value} size={30} />
      <span class="nm">{champions.name(value)}</span>
      <button type="button" class="clear" aria-label={t.remove(champions.name(value), label)}
        onclick={() => { value = ""; queueMicrotask(() => input?.focus()); }}>
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true"><path d="M1 1 L9 9 M9 1 L1 9" stroke="currentColor" stroke-width="1.3" /></svg>
      </button>
    </div>
  {:else}
    <input
      bind:this={input}
      class="field"
      placeholder={champions.list.length ? t.searchPlaceholder : champions.failed ? t.ddragonOffline : t.loadingChamps}
      disabled={!champions.list.length}
      role="combobox"
      aria-label={t.champFor(label)}
      aria-expanded={open}
      aria-controls={id}
      aria-autocomplete="list"
      aria-activedescendant={open && results[active] ? `${id}-${active}` : undefined}
      bind:value={q}
      oninput={() => { open = true; active = 0; }}
      onfocus={() => (open = true)}
      onblur={() => setTimeout(() => (open = false), 120)}
      onkeydown={onKey}
    />
    {#if open && results.length}
      <ul {id} role="listbox" class="menu">
        {#each results as c, i}
          <li id="{id}-{i}" role="option" aria-selected={i === active} class:on={i === active}
            onmousedown={(e) => { e.preventDefault(); pick(c.id); }}
            onmouseenter={() => (active = i)}>
            <ChampIcon id={c.id} size={22} /> {c.name}
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>

<style>
  .cp { position: relative; min-width: 0; }
  .field { width: 100%; }
  .chosen {
    display: flex; align-items: center; gap: 10px; height: 38px;
  }
  .nm { font-weight: 550; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .clear {
    display: grid; place-items: center; width: 26px; height: 26px; color: var(--ink-3); border-radius: 2px;
  }
  .clear:hover { color: var(--red-ink); background: var(--paper-2); }
  .menu {
    position: absolute; z-index: 30; left: 0; right: 0; top: calc(100% + 4px);
    list-style: none; padding: 4px; margin: 0;
    background: var(--paper); border: 1px solid var(--rule-strong); border-radius: var(--radius);
    box-shadow: 0 14px 30px -12px rgba(0, 0, 0, 0.35);
  }
  li { display: flex; align-items: center; gap: 10px; padding: 6px 8px; font-size: 13.5px; cursor: pointer; border-radius: 2px; }
  li.on { background: var(--paper-2); color: var(--red-ink); }
</style>
