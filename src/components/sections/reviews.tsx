"use client";

import Image from "next/image";

import { Crest } from "@/components/ui/crest";
import { SplitText } from "@/components/ui/letters";
import { Watermark } from "@/components/ui/watermark";
import { useTranslations } from "@/lib/i18n/provider";
import { cases } from "@/lib/reviews";

/**
 * Casos: quiénes son y qué les hicimos.
 *
 * Es la parrilla de trabajos de altitude101: tres pósters a toda
 * altura, uno al lado del otro, que ocupan la pantalla completa. Cada
 * póster es una imagen grande con la etiqueta del proyecto arriba, el
 * nombre del cliente enorme en el centro y, abajo, qué se le hizo.
 *
 * Entran como en el original: el primero ya está en su sitio y los
 * otros dos llegan desde la derecha, escalonados, cuando la sección
 * alcanza el 80 % de la pantalla (lo dispara `data-inview`, que
 * escribe el motor de apilado). Al pasar el cursor la imagen se acerca
 * y la ficha sube.
 *
 * La sección sigue siendo verde: es el único acento frío grande de la
 * página y funciona como respiro entre dos secciones cálidas.
 *
 * OJO: los textos y las imágenes son marcadores a propósito. Ver
 * src/lib/reviews.ts.
 */
export function Reviews() {
  const t = useTranslations();

  return (
    <section
      id="resenas"
      data-stack
      className="stack stack-4 stack--green cases-section"
      style={{
        ["--lit-x" as string]: "50%",
        ["--lit-y" as string]: "12%",
        ["--lit-a" as string]: "var(--glow-green)",
        ["--lit-x2" as string]: "84%",
        ["--lit-y2" as string]: "92%",
        ["--lit-b" as string]: "var(--glow-green)",
      }}
    >
      <Crest shape="desgarro" />
      <Watermark>{t("marks.reviews")}</Watermark>

      <div className="u-shell cases-head">
        <div>
          <p className="t-eyebrow" style={{ color: "var(--accent-green)" }} data-drift="6">
            {t("reviews.eyebrow")}
          </p>
          <h2 className="t-h2 mt-3 max-w-[16ch]" data-stagger data-drift="12">
            <SplitText text={t("reviews.title")} reveal />
          </h2>
        </div>
        <p className="t-lead lg:max-w-[38ch] lg:text-right" data-drift="8">
          {t("reviews.lead")}
        </p>
      </div>

      <ul data-stagger className="cases">
        {cases.map((item, index) => {
          const client = item.client ?? t("reviews.clientPlaceholder");
          return (
            <li
              key={item.id}
              className="cases__item"
              style={{ ["--i" as string]: index }}
              data-drift={6 + index * 4}
            >
              <article className="case group">
                <div className="case__media">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={client}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="case__img"
                    />
                  ) : (
                    <span className="case__empty">{t("reviews.imagePlaceholder")}</span>
                  )}
                  <span className="case__veil" aria-hidden="true" />
                </div>

                <div className="case__top">
                  <span className="case__label">{t("reviews.production")}</span>
                  <span className="case__sector">
                    {item.sector ?? t("reviews.sectorPlaceholder")}
                  </span>
                </div>

                <h3 className="case__client">
                  <SplitText text={client} reveal />
                </h3>

                <div className="case__foot">
                  <p className="case__work">{item.work ?? t("reviews.workPlaceholder")}</p>
                  <p className="case__quote">{item.quote ?? t("reviews.quotePlaceholder")}</p>
                </div>
              </article>
            </li>
          );
        })}
      </ul>

      <p className="u-shell mt-8 text-[0.8125rem] text-faint">{t("reviews.note")}</p>
    </section>
  );
}
