<script lang="ts">
  import { api, ROLES, type DraftEntry, type DraftResult, type Role } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { signed } from "../lib/format";
  import ChampPicker from "../components/ChampPicker.svelte";
  import ForceBar from "../components/ForceBar.svelte";
  import RoleGlyph from "../components/RoleGlyph.svelte";
  import Tip from "../components/Tip.svelte";

  type Picks = Record<Role, string>;
  const empty = (): Picks => ({ TOP: "", JUNGLE: "", MIDDLE: "", BOTTOM: "", UTILITY: "" });
  let blue = $state<Picks>(empty());
  let red = $state<Picks>(empty());
  let result = $state<DraftResult | null>(null);
  let busy = $state(false);
  let error = $state("");

  const taken = $derived([...Object.values(blue), ...Object.values(red)].filter(Boolean));
  const clean = (p: Picks) => Object.fromEntries(Object.entries(p).filter(([, v]) => v)) as Partial<Picks>;

  // evaluación automática, con un pequeño respiro para no disparar en cada tecla
  let timer: ReturnType<typeof setTimeout>;
  $effect(() => {
    const b = clean(blue), r = clean(red);
    clearTimeout(timer);
    if (!Object.keys(b).length && !Object.keys(r).length) { result = null; return; }
    timer = setTimeout(async () => {
      busy = true;
      try { result = await api.draft(b, r); error = ""; }
      catch (e) { error = e instanceof Error ? e.message : "Error al evaluar."; }
      finally { busy = false; }
    }, 180);
  });

  const find = (list: DraftEntry[] | undefined, role: Role, champ: string) =>
    list?.find((x) => x.role === role && x.champ === champ);
  const MAX = 30;
  const danger = $derived(result ? [...result.red].sort((a, b) => b.pp_por_1000g - a.pp_por_1000g) : []);

  const sides = [
    { key: "blue" as const, title: "Tu equipo", hint: "donde tu oro rinde más" },
    { key: "red" as const, title: "Rival", hint: "a quién no dejarle oro" },
  ];
</script>

<section class="draft">
  <header class="head">
    <h1 class="display">Draft</h1>
    <p class="prose">
      Elige los diez campeones y verás cuánto rinde el oro de cada uno:
      <Tip text="Puntos porcentuales de probabilidad de victoria que gana su equipo por cada 1000 de oro de ventaja de un jugador de esa clase. +15 pp: con 1000 de oro arriba, su equipo pasa de ~50% a ~65%.">
        <b>pp por cada 1000 de oro</b></Tip> de ventaja. Se mide por <b>clase</b> (posición + tipo), no por campeón concreto.
    </p>
    <button class="reset btn ghost" type="button" onclick={() => { blue = empty(); red = empty(); }} disabled={!taken.length}>Vaciar draft</button>
  </header>

  <div class="teams">
    {#each sides as s}
      {@const picks = s.key === "blue" ? blue : red}
      <div class="team">
        <h2 class="sec-title">{s.title} <span class="hint">— {s.hint}</span></h2>
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
                  <span class="num v" class:slack={!e.identificado}>{signed(e.pp_por_1000g, 1)}</span>
                  <span class="cls">{e.tags.join(" · ") || "sin clase"} · {e.identificado ? "confirmado" : "indicativo"}</span>
                {:else if picks[role]}
                  <span class="cls">{busy ? "evaluando…" : ""}</span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>

  {#if error}<p class="err" role="alert">{error}</p>{/if}

  {#if danger.length}
    <section class="rank" aria-labelledby="rk-h">
      <h2 id="rk-h" class="sec-title">Orden de peligro del rival</h2>
      <ol>
        {#each danger as d, i}
          <li>
            <span class="pos num">{i + 1}</span>
            <span class="nm">{champions.name(d.champ)}</span>
            <span class="num">{signed(d.pp_por_1000g, 1)} pp</span>
            <span class="num se">± {(1.96 * d.se).toFixed(1)}</span>
          </li>
        {/each}
      </ol>
    </section>
  {/if}

  {#if result}<p class="fine">{result.nota}.</p>{/if}
</section>

<style>
  .draft { display: grid; grid-template-columns: minmax(0, 1fr); gap: 40px; }
  .head { display: grid; grid-template-columns: auto 1fr auto; gap: 12px 40px; align-items: end; }
  .head h1 { font-size: clamp(44px, 5.5vw, 76px); }
  .head .prose { font-size: 14.5px; padding-bottom: 6px; }
  .reset { margin-bottom: 6px; }
  .teams { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(24px, 4vw, 56px); }
  .team { display: grid; gap: 14px; align-content: start; }
  .hint { color: var(--ink-3); text-transform: none; letter-spacing: 0; font-family: var(--font-sans); font-size: 13px; font-weight: 400; }
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
  .rank { display: grid; gap: 12px; max-width: 520px; }
  .rank ol { list-style: none; padding: 0; display: grid; }
  .rank li { display: grid; grid-template-columns: 28px 1fr auto 60px; gap: 10px; align-items: baseline; padding: 7px 0; border-bottom: 1px solid var(--rule); }
  .rank .pos { color: var(--red-ink); font-size: 12px; }
  .rank .nm { font-weight: 550; }
  .rank .se { color: var(--ink-3); font-size: 11px; text-align: right; }
  .fine { font-size: 12px; color: var(--ink-3); }

  @media (max-width: 1100px) {
    .teams { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .head { grid-template-columns: 1fr; }
    .slot { grid-template-columns: 1fr; gap: 8px; }
  }
</style>
