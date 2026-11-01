<script lang="ts">
  import { i18n } from "../lib/i18n.svelte";
  const t = $derived(i18n.t.legend);
</script>

<section class="legend" aria-labelledby="lg-h">
  <h3 id="lg-h" class="sec-title">{t.title}</h3>
  <dl>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><polyline points="6,15 30,9 54,5" class="line" /><circle cx="30" cy="9" r="3.4" class="ring" /></svg></dt>
      <dd><b>{t.lineTitle}</b> — {t.lineDesc}</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><path d="M6 4 L58 2 L58 18 L6 16 Z" class="b95" /><path d="M6 8 L58 7 L58 13 L6 12 Z" class="b50" /></svg></dt>
      <dd><b>{t.bandTitle}</b> — {t.bandDesc}</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><line x1="4" y1="10" x2="60" y2="10" class="axis" /></svg></dt>
      <dd><b>{t.axisTitle}</b> — {t.axisDesc}</dd>
    </div>
    <div>
      <dt><svg viewBox="0 0 64 20" aria-hidden="true"><line x1="6" y1="6" x2="40" y2="6" class="sure" /><circle cx="40" cy="6" r="2.6" class="dot" /><path d="M6 15 Q20 19 34 15" class="unsure" /><circle cx="34" cy="15" r="2.4" class="hollow" /></svg></dt>
      <dd><b>{t.sureTitle}</b> — {t.sureDesc}</dd>
    </div>
  </dl>
  <p class="fine">{t.fine}</p>
</section>

<style>
  .legend { display: grid; gap: 14px; }
  dl { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px 28px; }
  dl > div { display: grid; grid-template-columns: 64px 1fr; gap: 12px; align-items: start; }
  dt svg { width: 64px; height: 20px; overflow: visible; margin-top: 1px; }
  dd { font-size: 12.5px; line-height: 1.5; color: var(--ink-2); }
  dd b { color: var(--ink); font-weight: 600; }
  .fine { font-size: 12px; color: var(--ink-3); max-width: 90ch; }
  .line { fill: none; stroke: var(--ink); stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; }
  .ring { fill: var(--paper); stroke: var(--ink); stroke-width: 1.8; }
  .b95 { fill: var(--ash); opacity: 0.2; }
  .b50 { fill: var(--ash); opacity: 0.35; }
  .axis { stroke: var(--red); stroke-dasharray: 4 3; }
  .sure { stroke: var(--red); stroke-width: 2.2; stroke-linecap: round; }
  .dot { fill: var(--red); }
  .unsure { fill: none; stroke: var(--ash); stroke-width: 1.4; stroke-dasharray: 3 2.5; }
  .hollow { fill: var(--paper); stroke: var(--ash); stroke-width: 1.3; }
</style>
