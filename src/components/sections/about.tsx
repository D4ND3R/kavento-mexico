"use client";

import Image from "next/image";

import { Crest } from "@/components/ui/crest";
import { Watermark } from "@/components/ui/watermark";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import type { MessageKey } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Fotografías de la sección.
 *
 * MARCADOR: pon los archivos reales en /public/nosotros/ y escribe la
 * ruta en `src`. Mientras `src` sea null se dibuja un marco de vidrio
 * vacío y etiquetado, para que nadie confunda un hueco con una foto.
 * Tamaño recomendado: 1200 px de lado mayor, WebP o AVIF.
 */
const PHOTOS: {
  id: string;
  src: string | null;
  altKey: MessageKey;
  ratio: string;
  className: string;
}[] = [
  {
    id: "equipo",
    src: null,
    altKey: "about.photo1Alt",
    ratio: "4 / 5",
    className: "lg:col-span-5 lg:mt-20",
  },
  {
    id: "pizarron",
    src: null,
    altKey: "about.photo2Alt",
    ratio: "1 / 1",
    className: "lg:col-span-4",
  },
  {
    id: "codigo",
    src: null,
    altKey: "about.photo3Alt",
    ratio: "3 / 4",
    className: "lg:col-span-3 lg:mt-32",
  },
];

type CardSpec = {
  href: string;
  label: MessageKey;
  value: MessageKey;
  note: MessageKey;
  tone: "glass" | "ink" | "teal";
  glyph?: boolean;
};

/**
 * Las tres tarjetas hermanas de tech-ish. Vivían en la portada, pero
 * ahí empujaban el contenido fuera de la primera pantalla; aquí abren
 * la sección y siguen funcionando como índice.
 */
const CARDS: CardSpec[] = [
  {
    href: "#servicios",
    label: "hero.cardServicesLabel",
    value: "hero.cardServicesValue",
    note: "hero.cardServicesNote",
    tone: "glass",
  },
  {
    href: "#contacto",
    label: "hero.cardContactLabel",
    value: "hero.cardContactValue",
    note: "hero.cardContactNote",
    tone: "ink",
    glyph: true,
  },
  {
    href: "#equipo",
    label: "hero.cardTeamLabel",
    value: "hero.cardTeamValue",
    note: "hero.cardTeamNote",
    tone: "teal",
  },
];

export function About() {
  const t = useTranslations();

  return (
    <section
      id="nosotros"
      data-stack
      className="stack stack-2 stack--alt stack--pad"
      style={{
        ["--lit-x" as string]: "18%",
        ["--lit-y" as string]: "16%",
        ["--lit-x2" as string]: "88%",
        ["--lit-y2" as string]: "78%",
      }}
    >
      <Crest shape="rompiente" />
      <Watermark>{t("marks.about")}</Watermark>

      <div className="u-shell">
        {/* Índice de tres tarjetas: al apuntar a una, las otras se apagan. */}
        <ul
          data-stagger
          className="a-stagger grid gap-3 sm:grid-cols-3 [&:hover>li]:opacity-45"
        >
          {CARDS.map((card) => (
            <li
              key={card.href}
              className="transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-liquid)] hover:!opacity-100"
            >
              <a
                href={card.href}
                data-drift="9"
                data-magnet="10"
                className={[
                  "lg lg-motion lg-press lg-hover flow-host flex h-full flex-col justify-between gap-7 p-5 sm:p-6",
                  "[--glass-radius:var(--r-card)]",
                  card.tone === "ink" ? "[--glass-bg:rgba(10,8,6,0.6)]" : "",
                  card.tone === "teal"
                    ? "[--glass-bg:rgba(47,168,184,0.2)] [--glass-bloom:rgba(160,235,245,0.22)]"
                    : "",
                  card.tone === "glass" ? "lg--refract" : "",
                ].join(" ")}
              >
                <span className="flex items-center justify-between gap-3 text-[0.8125rem] text-muted">
                  {t(card.label)}
                  {card.glyph ? (
                    <span className="text-solar">
                      <WhatsappGlyph size={18} />
                    </span>
                  ) : null}
                </span>

                <span>
                  <span
                    className="block text-[1.625rem] leading-none text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {t(card.value)}
                  </span>
                  <span className="mt-2.5 block text-[0.875rem] leading-snug text-muted">
                    {t(card.note)}
                  </span>
                </span>
                <span className="sheen" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <p className="t-eyebrow mt-[clamp(4rem,9vh,7rem)]" data-drift="6">
          {t("about.eyebrow")}
        </p>

        <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <h2 className="t-h2 max-w-[12ch]" data-drift="12">
            {t("about.title")}
          </h2>

          <div className="mt-8 lg:mt-2" data-drift="7">
            <p className="t-lead">{t("about.p1")}</p>
            <p className="t-body mt-6">{t("about.p2")}</p>

            {/* La frase que cierra va en vidrio: es la única línea de la
                sección que se sostiene sola. */}
            <p
              className="lg lg--pill lg--refract lg-motion lg-hover mt-9 inline-block px-6 py-3.5 text-[1.0625rem] text-ink"
              data-magnet="12"
            >
              {t("about.p3")}
            </p>
          </div>
        </div>

        <div
          data-stagger
          className="a-stagger mt-16 grid gap-4 sm:grid-cols-2 lg:mt-10 lg:grid-cols-12 lg:gap-6"
        >
          {PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className={`lg lg--refract lg-motion lg-hover relative ${photo.className}`}
              style={{ aspectRatio: photo.ratio }}
              data-drift="14"
            >
              {photo.src ? (
                <Image
                  src={photo.src}
                  alt={t(photo.altKey)}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-end p-4 text-[0.75rem] text-muted-hi">
                  {t("about.photoPlaceholder")}
                </span>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
