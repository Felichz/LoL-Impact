<script lang="ts">
  /* The win/loss gold-at-10 pattern, said in one sentence instead of a range plot. */
  import type { Range } from "../lib/api";
  import { signed } from "../lib/format";
  import { i18n } from "../lib/i18n.svelte";
  import Tip from "./Tip.svelte";

  let { wins, losses }: { wins: Range; losses: Range } = $props();

  const t = $derived(i18n.t.pattern);
  const ok = (r: Range) => r.n >= 3 && r.mean != null && r.lo != null && r.hi != null;
  const text = $derived.by(() => {
    if (!ok(wins) || !ok(losses)) return "";
    const overlap = Math.max(wins.lo!, losses.lo!) <= Math.min(wins.hi!, losses.hi!);
    if (overlap) return t.unclear(signed(wins.mean!), signed(losses.mean!));
    return wins.mean! > losses.mean!
      ? t.clear(`${Math.round(wins.mean! - losses.mean!)}`)
      : t.inverse(signed(wins.mean!), signed(losses.mean!));
  });
</script>

{#if text}
  <section class="pattern" aria-labelledby="pn-h">
    <h2 id="pn-h" class="sec-title">{t.title} <Tip text={t.tip} /></h2>
    <p>{text}</p>
  </section>
{/if}

<style>
  .pattern { display: grid; gap: 10px; padding-top: 18px; border-top: 1px solid var(--rule-strong); }
  p { font-size: 13.5px; line-height: 1.55; color: var(--ink-2); }
</style>
