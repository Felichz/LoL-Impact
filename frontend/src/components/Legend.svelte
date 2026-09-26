<script lang="ts"></script>

<!-- Cómo leer la columna: el sistema de símbolos, en una tira -->
<section class="legend" aria-labelledby="lg-h">
  <h2 id="lg-h" class="sec-title">Cómo leer esto</h2>
  <dl>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><line x1="6" y1="16" x2="52" y2="4" class="rod" /><circle cx="52" cy="4" r="3.6" class="ring" /></svg></dt>
      <dd><b>Barra</b> — cómo cambió la probabilidad de tu equipo entre dos minutos evaluados.</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><line x1="32" y1="0" x2="32" y2="20" class="axis" /><line x1="32" y1="10" x2="56" y2="10" class="cord" /><circle cx="56" cy="10" r="3" class="dot" /></svg></dt>
      <dd><b>Eje rojo</b> = 50%, moneda al aire. El cable mide cuánto se alejó la partida de ahí.</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><line x1="8" y1="10" x2="56" y2="10" class="ci95" /><line x1="8" y1="6" x2="8" y2="14" class="ci95" /><line x1="56" y1="6" x2="56" y2="14" class="ci95" /><line x1="22" y1="10" x2="42" y2="10" class="ci50" /></svg></dt>
      <dd><b>Miembros grises</b> — la duda del modelo: trazo grueso = rango del 50%, fino = rango del 95%.</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><path d="M8 10 Q30 19 54 10" class="slack" /><circle cx="54" cy="10" r="3" class="hollow" /></svg></dt>
      <dd><b>Cable flojo</b> — el intervalo incluye el 0: el efecto es indicativo, no confirmado. Tenso y rojo = confirmado al 95%.</dd>
    </div>
  </dl>
  <p class="fine">Atribuciones correlacionales, no causales. Todo lo relativo a campeones se mide por clase (posición + tipo): con este volumen de datos no se puede separar un campeón concreto de su clase.</p>
</section>

<style>
  .legend { display: grid; gap: 16px; padding-top: 22px; border-top: 1px solid var(--rule-strong); }
  dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px 28px; }
  dl > div { display: grid; grid-template-columns: 64px 1fr; gap: 12px; align-items: start; }
  dt svg { width: 64px; height: 20px; overflow: visible; margin-top: 1px; }
  dd { font-size: 12.5px; line-height: 1.5; color: var(--ink-2); }
  dd b { color: var(--ink); font-weight: 600; }
  .fine { font-size: 12px; color: var(--ink-3); max-width: 90ch; }
  .rod { stroke: var(--ink); stroke-width: 6; stroke-linecap: round; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 2; }
  .axis { stroke: var(--red); stroke-dasharray: 3 3; }
  .cord { stroke: var(--red); stroke-width: 1.4; }
  .dot { fill: var(--red); }
  .ci95 { stroke: var(--ash); stroke-width: 1; }
  .ci50 { stroke: var(--ash); stroke-width: 3.5; stroke-linecap: round; }
  .slack { fill: none; stroke: var(--ash); stroke-width: 1.4; stroke-dasharray: 3 2.5; }
  .hollow { fill: var(--paper); stroke: var(--ash); stroke-width: 1.4; }
</style>
