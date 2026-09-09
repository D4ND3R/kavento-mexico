"use client";

import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

const labelKey = { es: "nav.langEs", en: "nav.langEn" } as const;

/**
 * Conmutador ES | EN.
 *
 * La pastilla activa viaja bajo el filtro `#lg-goo`: son dos gotas
 * —una rápida y otra lenta— que mientras se separan quedan unidas por
 * un cuello, así que el indicador se estira como líquido en vez de
 * deslizarse como un rectángulo. Es el mismo gesto que el control
 * activo de la barra de cámara de las referencias.
 *
 * El filtro se aplica solo a la capa de gotas. Un `filter` afecta a
 * todo su subárbol, así que envolver también las etiquetas les borra
 * el texto.
 *
 * Cambiar de idioma es estado de React: no navega, así que no se
 * pierde la posición de scroll ni se rompe el apilado.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  const index = locales.indexOf(locale);

  return (
    <div
      role="group"
      aria-label={t("nav.langGroup")}
      className={`lg lg--refract lg-motion p-1 ${className ?? ""}`}
    >
      <div className="relative flex items-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ filter: "url(#lg-goo)" }}
        >
          <span
            className="absolute inset-y-0 w-1/2 rounded-[var(--r-pill)] bg-[rgba(255,244,232,0.92)]"
            style={{
              left: `${index * 50}%`,
              transition: "left 820ms var(--ease-liquid)",
            }}
          />
          <span
            className="absolute inset-y-0 w-1/2 rounded-[var(--r-pill)] bg-[rgba(255,244,232,0.92)]"
            style={{
              left: `${index * 50}%`,
              transition: "left 380ms var(--ease-liquid)",
            }}
          />
        </span>

        {locales.map((code: Locale) => {
          const active = code === locale;
          return (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              aria-pressed={active}
              // `flex-1` con ancho mínimo igual mantiene los dos botones
              // exactamente al 50%, que es lo que asume la gota.
              className={[
                "relative min-h-10 flex-1 basis-0 rounded-[var(--r-pill)] px-3.5",
                "text-[0.8125rem] font-semibold uppercase",
                "transition-colors duration-[var(--dur-base)] ease-[var(--ease-liquid)]",
                active ? "text-base" : "text-muted hover:text-ink",
              ].join(" ")}
            >
              <span aria-hidden="true">{code}</span>
              <span className="sr-only">{t(labelKey[code])}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
