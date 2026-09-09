import en from "./messages/en.json";
import es from "./messages/es.json";

export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

/** El español es el idioma por defecto del sitio. */
export const defaultLocale: Locale = "es";

/** Cookie leída en el servidor para que el SSR ya salga en el idioma correcto. */
export const LOCALE_COOKIE = "kavento_locale";

/** El diccionario español es la fuente de verdad de las claves. */
export type Messages = typeof es;

export const dictionaries: Record<Locale, Messages> = {
  es,
  en: en as Messages,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

/**
 * Rutas con punto de todas las claves de texto: "hero.titleLine1",
 * "services.items.web.body", etc. Escribir una clave inexistente
 * es un error de compilación, no un texto vacío en producción.
 */
type LeafPaths<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string ? K : `${K}.${LeafPaths<T[K]>}`;
    }[keyof T & string];

export type MessageKey = LeafPaths<Messages>;

/** Interpola marcadores tipo {name} en el texto ya resuelto. */
export function translate(
  messages: Messages,
  key: MessageKey,
  values?: Record<string, string | number>,
): string {
  const resolved = key
    .split(".")
    .reduce<unknown>((node, segment) => {
      if (node && typeof node === "object" && segment in node) {
        return (node as Record<string, unknown>)[segment];
      }
      return undefined;
    }, messages);

  if (typeof resolved !== "string") {
    // Nunca romper la página por una clave faltante: se muestra la clave.
    return key;
  }

  if (!values) return resolved;

  return resolved.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}
