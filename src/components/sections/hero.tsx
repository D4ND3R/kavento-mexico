"use client";

import { ActionLink } from "@/components/ui/action";
import { RollingWord, SplitText } from "@/components/ui/letters";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Portada, con la estructura del portafolio de Leonardo Díaz Delgado:
 *
 *   · chip de ubicación arriba a la izquierda
 *   · etiqueta con punto: nombre — descriptor
 *   · titular a la izquierda, con la palabra clave en un rodillo
 *   · micro-texto vertical pegado al titular
 *   · tarjeta de vidrio a la derecha
 *
 * Todo cabe dentro de la primera pantalla: la sección mide exactamente
 * `100svh` y el contenido se reparte con `justify-center`, sin nada que
 * quede por debajo del pliegue. Las tres tarjetas resumen que antes
 * colgaban aquí se movieron a la sección siguiente, que es donde hay
 * sitio para ellas.
 */
export function Hero() {
  const t = useTranslations();

  const words = [
    t("hero.word1"),
    t("hero.word2"),
    t("hero.word3"),
    t("hero.word4"),
  ];

  return (
    <section
      id="top"
      data-stack
      className="stack stack-1 relative flex h-[100svh] items-center overflow-hidden"
    >
      <div data-recede className="u-shell w-full">
        {/* Chip de ubicación, como el del portafolio. */}
        <p
          className="a-fade absolute left-[var(--gutter)] top-[calc(var(--gutter)*0.9)] hidden items-center gap-2 text-[0.6875rem] uppercase tracking-[0.18em] text-muted lg:flex"
          style={{ fontFamily: "var(--font-mono)", animationDelay: "1400ms" }}
        >
          <PinGlyph />
          {t("hero.place")}
        </p>

        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] lg:gap-14">
          <div className="relative">
            <p
              className="t-eyebrow a-fade flex items-center gap-2.5"
              style={{ animationDelay: "1300ms" }}
            >
              <span className="inline-block size-1.5 rounded-full bg-[var(--accent-to)]" />
              {t("hero.kicker")}
            </p>

            {/* Micro-texto vertical al costado del titular. */}
            <span
              aria-hidden="true"
              className="a-vertical a-fade absolute -left-9 top-16 hidden text-[0.5625rem] uppercase text-faint xl:block"
              style={{
                fontFamily: "var(--font-mono)",
                animationDelay: "1900ms",
              }}
            >
              {t("hero.vertical")}
            </span>

            <h1 className="t-display mt-5">
              <span className="a-rise-line">
                <span
                  className="h-line a-rise block"
                  style={{ animationDelay: "1450ms" }}
                >
                  <SplitText text={t("hero.titleLine1")} />
                </span>
              </span>
              <span className="a-rise-line">
                <span
                  className="a-fade block"
                  style={{ animationDelay: "1580ms" }}
                >
                  <RollingWord words={words} />
                </span>
              </span>
            </h1>

            <p
              className="t-lead a-fade mt-7 max-w-[46ch]"
              style={{ animationDelay: "1720ms" }}
            >
              {t("hero.lead")}
            </p>

            <div
              className="a-fade mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "1840ms" }}
            >
              <ActionLink href="#contacto">{t("hero.ctaPrimary")}</ActionLink>
              <ActionLink href="#servicios" variant="ghost">
                {t("hero.ctaSecondary")}
              </ActionLink>
            </div>
          </div>

          {/* Tarjeta de vidrio a la derecha: donde el portafolio pone el
              reproductor, aquí va el acceso directo a WhatsApp. */}
          <aside
            className="a-fade a-float lg lg--refract lg-motion lg-hover hidden p-7 lg:block"
            style={{ animationDelay: "1960ms" }}
          >
            <p className="flex items-center gap-2.5 text-[0.75rem] text-muted">
              <span className="nav-dot" aria-hidden="true" />
              {t("nav.status")}
            </p>

            <p
              className="mt-5 text-[1.5rem] leading-tight text-ink"
              style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
            >
              {t("hero.cardContactNote")}
            </p>

            <a
              href="#contacto"
              className="lg lg--pill lg--plain lg-motion lg-press mt-6 flex items-center justify-center gap-2.5 px-5 py-3 text-[0.875rem] font-semibold text-solar"
              style={{
                ["--glass-bg" as string]: "rgba(255,122,26,0.16)",
              }}
            >
              <WhatsappGlyph size={17} />
              {t("hero.ctaPrimary")}
            </a>

            <p className="mt-5 text-[0.75rem] text-faint">
              {t("hero.cardServicesNote")}
            </p>
          </aside>
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-6 mx-auto flex items-center justify-center gap-3 text-[0.75rem] text-faint lg:justify-start lg:pl-[var(--gutter)]">
        <span
          aria-hidden="true"
          className="relative hidden h-6 w-px overflow-hidden bg-[var(--border-subtle)] sm:block"
        >
          <span className="absolute inset-x-0 top-0 h-1/2 animate-[kv-drift_2.6s_ease-in-out_infinite] bg-[var(--accent-from)]" />
        </span>
        {t("hero.scrollHint")}
      </p>
    </section>
  );
}

function PinGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="var(--accent-to)"
      />
    </svg>
  );
}
