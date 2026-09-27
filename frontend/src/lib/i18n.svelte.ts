/* i18n: English default, Spanish opt-in, persisted per visitor. */
import { en } from "./locales/en";
import { es } from "./locales/es";

export type Lang = "en" | "es";

/* Widens literal string types (from `as const`) back to `string`, recursively,
   so `en` and `es` — which have different literal values — share one type. */
type Widen<T> = T extends string ? string
  : T extends (...a: infer A) => infer R ? (...a: A) => Widen<R>
  : T extends readonly (infer U)[] ? readonly Widen<U>[]
  : T extends object ? { [K in keyof T]: Widen<T[K]> }
  : T;

export type Dict = Widen<typeof en>;

const DICTS: Record<Lang, Dict> = { en, es };

function load(): Lang {
  try {
    const v = localStorage.getItem("lolimpact.lang");
    if (v === "en" || v === "es") return v;
  } catch { /* storage blocked: fall through to default */ }
  return "en";
}
function save(lang: Lang) {
  try { localStorage.setItem("lolimpact.lang", lang); } catch { /* storage blocked: ignore */ }
}

class I18n {
  lang = $state<Lang>(load());
  t = $derived(DICTS[this.lang]);

  set(lang: Lang) {
    this.lang = lang;
    save(lang);
    document.documentElement.lang = lang;
  }

  /** Translates a fixed set of known server strings (backend always answers in Spanish). */
  server(text: string): string {
    if (this.lang === "es") return text;
    return SERVER_EN[text] ?? text;
  }
}

export const i18n = new I18n();
document.documentElement.lang = i18n.lang;

/* Exact-match dictionary for the fixed set of user-facing strings the Python
   backend produces (notes + HTTPException details). The backend always
   answers in Spanish; this maps the known ones to English on the client. */
const SERVER_EN: Record<string, string> = {
  "No hay conexión con el servidor local (¿está corriendo uvicorn en el puerto 8000?).":
    "Can't reach the local server (is uvicorn running on port 8000?).",
  "sin datos: ni API viva ni partidas en cache": "no data: no live API and no cached games",
  "partida no encontrada ni cacheada": "game not found and not cached",
  "timeline no disponible (claves muertas y sin cache)": "timeline unavailable (keys expired and not cached)",
  "sin claves API vivas": "no live API keys",
  "cuenta no encontrada": "account not found",
  "No hay partida en curso para esa cuenta.": "No game in progress for that account.",
  "1 kill temprana ≈ intercambio de 600g en la línea (+300 asesino, −300 víctima), sin placas ni EXP. Impacto por CLASE, min 8.":
    "1 early kill ≈ a 600g swing in lane (+300 for the killer, −300 for the victim), not counting plates or XP. Impact by CLASS, min 8.",
  "conversión por CLASE (rol + tags); la instancia concreta no es distinguible de su clase con los datos actuales":
    "conversion by CLASS (role + tags); the specific champion isn't distinguishable from its class with the current data",
};
