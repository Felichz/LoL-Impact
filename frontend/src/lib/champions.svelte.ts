/* Champions from Data Dragon (localized names + icons). */
import type { Lang } from "./i18n.svelte";

export interface Champ { id: string; name: string }

const DDRAGON_LOCALE: Record<Lang, string> = { en: "en_US", es: "es_ES" };

class Champions {
  version = $state("");
  list = $state<Champ[]>([]);
  byId = $state<Record<string, string>>({});
  failed = $state(false);
  #loadedLang: Lang | null = null;
  #loading = false;

  async ensure(lang: Lang) {
    if (this.#loadedLang === lang || this.#loading) return;
    this.#loading = true;
    try {
      const v: string = (await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json())[0];
      const data = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/${DDRAGON_LOCALE[lang]}/champion.json`)).json();
      const list = Object.values(data.data as Record<string, { id: string; name: string }>)
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name, lang));
      this.byId = Object.fromEntries(list.map((c) => [c.id, c.name]));
      this.list = list;
      this.version = v;
      this.failed = false;
      this.#loadedLang = lang;
    } catch {
      this.failed = true;
    } finally {
      this.#loading = false;
    }
  }

  name(id: string) { return this.byId[id] ?? id; }
  icon(id: string) {
    return this.version ? `https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${id}.png` : "";
  }
}

export const champions = new Champions();
