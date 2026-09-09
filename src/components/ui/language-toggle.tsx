"use client";

import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

const labelKey = { es: "nav.langEs", en: "nav.langEn" } as const;

/**
 * Conmutador ES | EN. Cambia estado de React, no navega: la posición
 * de scroll y los canvas 3D montados se conservan intactos.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("nav.langGroup")}
      className={`u-glass inline-flex items-center rounded-[var(--r-pill)] p-0.5 ${className ?? ""}`}
    >
      {locales.map((code: Locale) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-pressed={active}
            className={[
              "rounded-[var(--r-pill)] px-3 py-1.5 text-[0.8125rem] font-medium uppercase",
              "transition-colors duration-[var(--dur-fast)]",
              active
                ? "bg-ink/95 text-base"
                : "text-muted hover:text-ink",
            ].join(" ")}
          >
            <span aria-hidden="true">{code}</span>
            <span className="sr-only">{t(labelKey[code])}</span>
          </button>
        );
      })}
    </div>
  );
}
