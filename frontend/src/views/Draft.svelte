<script lang="ts">
  import { api, ROLES, type DraftEntry, type DraftResult, type Role } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { chance } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import ChampPicker from "../components/ChampPicker.svelte";
  import ForceBar from "../components/ForceBar.svelte";
  import RoleGlyph from "../components/RoleGlyph.svelte";
  import Tip from "../components/Tip.svelte";
  import WinCondition from "../components/WinCondition.svelte";
  import type { WCEntry } from "../lib/story";

  type Picks = Record<Role, string>;
  const empty = (): Picks => ({ TOP: "", JUNGLE: "", MIDDLE: "", BOTTOM: "", UTILITY: "" });
  let blue = $state<Picks>(empty());
  let red = $state<Picks>(empty());
  let result = $state<DraftResult | null>(null);
  let busy = $state(false);
  let error = $state("");

  const t = $derived(i18n.t.draftView);
  const taken = $derived([...Object.values(blue), ...Object.values(red)].filter(Boolean));
  const clean = (p: Picks) => Object.fromEntries(Object.entries(p).filter(([, v]) => v)) as Partial<Picks>;

  // automatic evaluation, with a short debounce so it doesn't fire on every keystroke
  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    const b = clean(blue), r = clean(red);
    clearTimeout(timer);
    if (!Object.keys(b).length && !Object.keys(r).length) { result = null; return; }
    timer = setTimeout(async () => {
      busy = true;
      try { result = await api.draft(b, r); error = ""; }
      catch (e) { error = e instanceof Error ? i18n.server(e.message) : i18n.t.common.unknownError; }
      finally { busy = false; }
    }, 180);
  });

  const find = (list: DraftEntry[] | undefined, role: Role, champ: string) =>
    list?.find((x) => x.role === role && x.champ === champ);
  const MAX = 30;

  const sides = $derived([
    { key: "blue" as const, title: t.yourTeam },
    { key: "red" as const, title: t.rival },
  ]);

  const toWC = (xs: DraftEntry[] | undefined): WCEntry[] =>
    (xs ?? []).map((x) => ({ champ: x.champ, role: x.role, tags: x.tags, value: x.pp_por_1000g, se: x.se, sure: x.identificado }));
</script>

<section class="draft">
  <header class="head">
    <h1 class="display">{t.title}</h1>
    <p class="prose">{t.intro}</p>
    <button class="reset btn ghost" type="button" onclick={() => { blue = empty(); red = empty(); }} disabled={!taken.length}>{t.clearDraft}</button>
  </header>

  <div class="teams">
    {#each sides as s}
      {@const picks = s.key === "blue" ? blue : red}
      <div class="team">
        <h2 class="sec-title">{s.title}</h2>
        <div class="slots">
          {#each ROLES as role}
            {@const e = picks[role] ? find(result?.[s.key], role, picks[role]) : undefined}
            <div class="slot" class:filled={!!picks[role]}>
              <RoleGlyph {role} label />
              {#if s.key === "blue"}
                <ChampPicker bind:value={blue[role]} label="{s.title}, {role}" {taken} />
              {:else}
                <ChampPicker bind:value={red[role]} label="{s.title}, {role}" {taken} />
              {/if}
              <div class="val">
                {#if e}
                  <ForceBar value={e.pp_por_1000g} se={e.se} max={MAX} confirmed={e.identificado} />
                  <span class="num v" class:slack={!e.identificado}>{chance(e.pp_por_1000g)}</span>
                  <span class="cls">{t.per1000} · {e.tags.join(" · ") || t.noClass}{#if !e.identificado}{" · "}{i18n.t.common.notSure}<Tip text={i18n.t.common.notSureTip} />{/if}</span>
                {:else if picks[role]}
                  <span class="cls">{busy ? t.evaluating : ""}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if error}<p class="err" role="alert">{error}</p>{/if}

  {#if result && (result.red.length || result.blue.length)}
    <WinCondition title={i18n.t.winCon.titleDraft} rival={toWC(result.red)} own={toWC(result.blue)} unit={i18n.t.winCon.perGold} />
  {/if}

  {#if result}<p class="fine">{i18n.server(result.nota)}.</p>{/if}
</section>

<style>
  .draft { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .head { display: grid; grid-template-columns: auto 1fr auto; gap: 12px 40px; align-items: end; }
  .head h1 { font-size: clamp(44px, 5.5vw, 76px); }
  .head .prose { font-size: 14.5px; padding-bottom: 6px; }
  .reset { margin-bottom: 6px; }
  .teams { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 56px); }
  .team { display: grid; gap: 14px; align-content: start; }
  .slots { display: grid; border-top: 1px solid var(--rule-strong); }
  .slot {
    display: grid;
    grid-template-columns: 96px minmax(150px, 1fr) minmax(150px, 1.1fr);
    gap: 14px;
    align-items: center;
    padding: 10px 0;
    min-height: 64px;
    border-bottom: 1px solid var(--rule);
  }
  .val { display: grid; grid-template-columns: 1fr 52px; align-items: center; column-gap: 10px; }
  .v { font-size: 16px; text-align: right; }
  .v.slack { color: var(--ink-3); }
  .cls { grid-column: 1 / -1; font-size: 11px; color: var(--ink-3); font-family: var(--font-mono); font-stretch: 87.5%; }
  .err { color: var(--red-ink); font-size: 13.5px; }
  .fine { font-size: 12px; color: var(--ink-3); }

  @media (max-width: 1100px) {
    .teams { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .head { grid-template-columns: 1fr; }
    .slot { grid-template-columns: 1fr; gap: 8px; }
  }
</style>
