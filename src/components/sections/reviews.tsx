"use client";

import Image from "next/image";

import { Crest } from "@/components/ui/crest";
import { useTranslations } from "@/lib/i18n/provider";
import { reviews } from "@/lib/reviews";

/**
 * Reseñas.
 *
 * Sección verde, como la de testimonios del portafolio: es el único
 * acento frío grande de la página y por eso funciona como respiro entre
 * dos secciones cálidas.
 *
 * Las tarjetas se abren en abanico: `--pos` sitúa cada una respecto al
 * centro y `--spread`, que escribe el motor de scroll conforme entra la
 * sección, controla cuánto se separan. Es la mecánica de `.t-card-box`
 * del original.
 *
 * OJO: los textos son marcadores a propósito. Ver src/lib/reviews.ts.
 */
export function Reviews() {
  const t = useTranslations();

  return (
    <section
      id="resenas"
      data-stack
      className="stack stack-4 stack--green stack--pad"
      style={{
        ["--lit-x" as string]: "50%",
        ["--lit-y" as string]: "18%",
        ["--lit-a" as string]: "var(--glow-green)",
        ["--lit-x2" as string]: "84%",
        ["--lit-y2" as string]: "88%",
        ["--lit-b" as string]: "var(--glow-green)",
      }}
    >
      <Crest shape="ola" color="var(--surface-green)" />

      <div className="u-shell">
        <p className="t-eyebrow text-center" style={{ color: "var(--accent-green)" }}>
          {t("reviews.eyebrow")}
        </p>
        <h2 className="t-h2 mt-3 text-center">{t("reviews.title")}</h2>
        <p className="t-lead mx-auto mt-5 max-w-[52ch] text-center">
          {t("reviews.lead")}
        </p>

        <ul
          data-fan
          data-stagger
          className="a-stagger fan mt-[clamp(3rem,7vh,5rem)]"
        >
          {reviews.map((review, index) => (
            <li
              key={review.id}
              className="fan__card lg lg--panel lg--refract lg-motion p-8"
              style={{
                ["--pos" as string]: index - 1,
                ["--glass-bg" as string]: "rgba(255, 250, 240, 0.09)",
                ["--glass-bloom" as string]: "rgba(196, 240, 214, 0.18)",
              }}
            >
              <div>
                <QuoteGlyph />
                <blockquote className="mt-5 text-[0.9375rem] leading-relaxed text-ink">
                  {review.quote ?? t("reviews.quotePlaceholder")}
                </blockquote>
              </div>

              <div className="mt-8">
                <hr className="u-rule border-0" />
                <div className="mt-5 flex items-center gap-3.5">
                  <span
                    className="relative size-11 shrink-0 overflow-hidden rounded-full"
                    style={{
                      background: "rgba(255,250,240,0.1)",
                      border: "1px solid var(--border-strong)",
                    }}
                  >
                    {review.photo ? (
                      <Image
                        src={review.photo}
                        alt={review.name ?? ""}
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </span>
                  <span>
                    <span
                      className="block text-[0.9375rem] leading-tight text-ink"
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                      }}
                    >
                      {review.name ?? t("reviews.namePlaceholder")}
                    </span>
                    <span className="mt-0.5 block text-[0.8125rem] text-muted">
                      {review.role ?? t("reviews.rolePlaceholder")}
                    </span>
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-[0.8125rem] text-faint">
          {t("reviews.note")}
        </p>
      </div>
    </section>
  );
}

function QuoteGlyph() {
  return (
    <svg
      width="30"
      height="24"
      viewBox="0 0 30 24"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--accent-green)" }}
    >
      <path
        d="M11.6 0C5.2 0 0 5.2 0 11.6 0 18 5.2 24 11.6 24c1.2 0 2-.6 2-1.6 0-.9-.6-1.5-1.7-1.6-4-.3-7-3.6-7-7.6h5.7c1.1 0 1.8-.7 1.8-1.8V1.8c0-1.1-.7-1.8-1.8-1.8Zm16 0C21.2 0 16 5.2 16 11.6 16 18 21.2 24 27.6 24c1.2 0 2-.6 2-1.6 0-.9-.6-1.5-1.7-1.6-4-.3-7-3.6-7-7.6h5.7c1.1 0 1.8-.7 1.8-1.8V1.8c0-1.1-.7-1.8-1.8-1.8Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}
