"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/config";

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

export function About() {
  const t = useTranslations();

  return (
    <section
      id="nosotros"
      data-stack
      className="stack stack-2 stack--alt py-24 sm:py-28"
      style={{ ["--lit-x" as string]: "18%", ["--lit-y" as string]: "16%", ["--lit-x2" as string]: "88%", ["--lit-y2" as string]: "78%" }}
    >
      <div className="u-shell">
        <div className="lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-16">
          <h2 className="t-h2 max-w-[12ch]">{t("about.title")}</h2>

          <div className="mt-8 lg:mt-2">
            <p className="t-lead">{t("about.p1")}</p>
            <p className="t-body mt-6">{t("about.p2")}</p>

            {/* La frase que cierra va en vidrio: es la única línea de
                la sección que se sostiene sola. */}
            <p className="lg lg--refract lg-motion mt-9 inline-block rounded-[var(--r-pill)] px-6 py-3.5 text-[1.0625rem] text-ink">
              {t("about.p3")}
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-12 lg:gap-6">
          {PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className={`lg lg--refract relative overflow-hidden rounded-[var(--r-panel)] ${photo.className}`}
              style={{ aspectRatio: photo.ratio }}
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
                <span className="absolute inset-0 flex items-end p-4 text-[0.75rem] text-faint">
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
