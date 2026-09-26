/* Campeones desde Data Dragon (nombres en español + iconos). */

export interface Champ { id: string; name: string }

class Champions {
  version = $state("");
  list = $state<Champ[]>([]);
  byId = $state<Record<string, string>>({});
  failed = $state(false);
  #started = false;

  async ensure() {
    if (this.#started) return;
    this.#started = true;
    try {
      const v: string = (await (await fetch("https://ddragon.leagueoflegends.com/api/versions.json")).json())[0];
      const data = await (await fetch(`https://ddragon.leagueoflegends.com/cdn/${v}/data/es_ES/champion.json`)).json();
      const list = Object.values(data.data as Record<string, { id: string; name: string }>)
        .map((c) => ({ id: c.id, name: c.name }))
        .sort((a, b) => a.name.localeCompare(b.name, "es"));
      this.byId = Object.fromEntries(list.map((c) => [c.id, c.name]));
      this.list = list;
      this.version = v;
    } catch {
      this.failed = true;
    }
  }

  name(id: string) { return this.byId[id] ?? id; }
  icon(id: string) {
    return this.version ? `https://ddragon.leagueoflegends.com/cdn/${this.version}/img/champion/${id}.png` : "";
  }
}

export const champions = new Champions();
