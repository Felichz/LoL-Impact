<script lang="ts">
  import type { PlayerAt, Side } from "../lib/api";
  import { ROLES } from "../lib/api";
  import { champions } from "../lib/champions.svelte";
  import { signed } from "../lib/format";
  import ChampIcon from "./ChampIcon.svelte";
  import RoleGlyph from "./RoleGlyph.svelte";
  import Tip from "./Tip.svelte";

  let { players, minute, mySide, me }: { players: PlayerAt[]; minute: number; mySide: Side; me: string } = $props();

  const at = $derived(players.filter((p) => p.landmark === minute));
  const order = (a: PlayerAt, b: PlayerAt) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role);
  const teams = $derived([
    { title: "Tu equipo", rows: at.filter((p) => p.side === mySide).sort(order) },
    { title: "Rival", rows: at.filter((p) => p.side !== mySide).sort(order) },
  ]);
  const isMe = (p: PlayerAt) => !!me && p.name.toLowerCase() === me.toLowerCase();
</script>

<section class="players" aria-labelledby="pt-h">
  <h2 id="pt-h" class="sec-title">Los diez jugadores · min {minute}</h2>

  <div class="wrap">
    <table>
      <thead>
        <tr class="label">
          <th scope="col" class="c-role">Línea</th>
          <th scope="col">Jugador</th>
          <th scope="col" class="r c-kd">K / M
            <Tip text="Asesinatos y muertes ACUMULADOS hasta este minuto, no el total de la partida." /></th>
          <th scope="col" class="r">Oro
            <Tip text="Oro del jugador menos el promedio de los 10 en este minuto. +400 = 400 de oro por encima del promedio." /></th>
          <th scope="col" class="r c-cs">CS
            <Tip text="Súbditos + monstruos, comparado igual que el oro: contra el promedio de la partida." /></th>
          <th scope="col" class="pc">Frente a su línea
            <Tip text="Qué porcentaje de jugadores de esa posición (en ~30k partidas Esmeralda+) tenía MENOS oro en este minuto. 85 = iba más rico que el 85%." /></th>
        </tr>
      </thead>
      {#each teams as t}
        <tbody>
          <tr class="team"><th colspan="6" scope="colgroup">{t.title}</th></tr>
          {#each t.rows as p}
            {@const pc = p.pct == null ? null : Math.round(p.pct)}
            <tr class:me={isMe(p)}>
              <td class="c-role"><RoleGlyph role={p.role} /></td>
              <td>
                <span class="who">
                  <ChampIcon id={p.champ} size={26} />
                  <span class="names">
                    <span class="pn">{p.name}{#if isMe(p)} <span class="tag-you">TÚ</span>{/if}</span>
                    <span class="cn">{champions.name(p.champ)}</span>
                  </span>
                </span>
              </td>
              <td class="r num c-kd">{p.kills} / {p.deaths}</td>
              <td class="r num" class:dim={p.gold_adv < 0}>{signed(p.gold_adv)}</td>
              <td class="r num c-cs" class:dim={p.cs_adv < 0}>{signed(p.cs_adv)}</td>
              <td class="pc">
                {#if pc == null}
                  <span class="dim">—</span>
                {:else}
                  <span class="pcw"><span class="pbar" aria-label="Percentil {pc}">
                    <span class="track"></span>
                    <span class="fill" style:width="{pc}%"></span>
                    <span class="knob" style:left="{pc}%"></span>
                  </span>
                  <span class="num pv">{pc}</span></span>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      {/each}
    </table>
  </div>
</section>

<style>
  .players { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .wrap { overflow-x: auto; margin: 0 -4px; padding: 0 4px; }
  table { width: 100%; border-collapse: collapse; min-width: 620px; }
  th { text-align: left; font-weight: 450; font-size: 9.5px; padding: 0 10px 8px; border-bottom: 1px solid var(--rule-strong); white-space: nowrap; }
  th.r { text-align: right; }
  thead th { vertical-align: bottom; }
  thead th :global(.tip) { vertical-align: -3px; }
  .team th {
    padding: 16px 10px 6px;
    font-family: var(--font-mono); font-stretch: 87.5%; font-size: 10.5px; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--ink); border-bottom: 1px solid var(--rule);
  }
  td { padding: 8px 10px; border-bottom: 1px solid var(--rule); font-size: 13px; vertical-align: middle; }
  td.r { text-align: right; font-size: 12.5px; }
  tr.me td { background: var(--paper); }
  tr.me td:first-child { box-shadow: inset 1px 0 0 var(--red); }
  .who { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .names { display: grid; line-height: 1.25; min-width: 0; }
  .pn { font-weight: 550; white-space: nowrap; }
  .cn { font-size: 11.5px; color: var(--ink-3); }
  .dim { color: var(--ink-3); }
  .pc { width: 190px; }
  .pcw { display: flex; align-items: center; gap: 10px; }
  .pbar { position: relative; flex: 1; height: 12px; }
  .track { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--ash-soft); }
  .fill { position: absolute; left: 0; top: 50%; height: 3px; margin-top: -1px; background: var(--ink); border-radius: 2px; }
  .knob { position: absolute; top: 50%; width: 9px; height: 9px; margin: -4.5px 0 0 -4.5px; border-radius: 50%; background: var(--paper); box-shadow: inset 0 0 0 2px var(--ink); }
  .pv { width: 22px; text-align: right; font-size: 12px; }

  @media (max-width: 620px) {
    table { min-width: 0; }
    .c-role, .c-cs, .c-kd { display: none; }
    th, td { padding-left: 6px; padding-right: 6px; }
    .pc { width: 118px; }
  }
</style>
