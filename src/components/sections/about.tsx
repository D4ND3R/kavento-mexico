"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/config";

/**
 * Fotografías de la sección.
 *
 * MARCADOR: pon los archivos reales en /public/nosotros/ y escribe la
 * ruta en `src`. Mientras `src` sea null se dibuja un marco vacío
 * etiquetado, para que nadie confunda una foto de archivo con una real.
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
    className: "lg:col-span-5 lg:mt-16",
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
    className: "lg:col-span-3 lg:mt-28",
  },
];

export function About() {
  const t = useTranslations();

  return (
    <section id="nosotros" className="u-section relative bg-surface">
      <div className="u-shell">
        <div className="lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
          <h2 className="t-h2 lg:sticky lg:top-[22vh] lg:self-start">
            {t("about.title")}
          </h2>

          <div className="mt-8 lg:mt-0">
            <p className="t-lead">{t("about.p1")}</p>
            <p className="t-body mt-6">{t("about.p2")}</p>
            <p className="mt-8 text-[1.25rem] font-medium leading-snug text-ink">
              {t("about.p3")}
            </p>
          </div>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:mt-24 lg:grid-cols-12 lg:gap-8">
          {PHOTOS.map((photo) => (
            <figure
              key={photo.id}
              className={`relative overflow-hidden rounded-[var(--r-panel)] ${photo.className}`}
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
                <PhotoPlaceholder label={t("about.photoPlaceholder")} />
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhotoPlaceholder({ label }: { label: string }) {
  return (
    <div
      className="flex h-full w-full items-end bg-elevated p-4"
      style={{ border: "1px dashed var(--border-strong)" }}
    >
      <span className="text-[0.75rem] text-faint">{label}</span>
    </div>
  );
}
