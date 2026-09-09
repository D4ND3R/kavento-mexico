"use client";

import dynamic from "next/dynamic";

/**
 * Fronteras de carga del 3D.
 *
 * three.js, react-three-fiber y drei pesan más de un megabyte sin
 * comprimir. Importándolos aquí con next/dynamic quedan en su propio
 * chunk, que se descarga después de hidratar en vez de bloquear la
 * primera pintura. Mientras llega se muestra un marcador con el mismo
 * degradado de la marca, así que el hueco nunca se ve vacío.
 *
 * ssr: false porque un canvas WebGL no existe en el servidor.
 */

export const HeroSun = dynamic(
  () => import("./hero-sun").then((mod) => mod.HeroSun),
  { ssr: false, loading: () => <SolarPlaceholder /> },
);

export const ServiceScene = dynamic(
  () => import("./service-scene").then((mod) => mod.ServiceScene),
  { ssr: false, loading: () => <ScenePlaceholder /> },
);

/** El sol, en CSS. Sirve de carga y de respaldo si no hay WebGL. */
export function SolarPlaceholder() {
  return (
    <div className="grid h-full w-full place-items-center">
      <div
        className="aspect-square w-[62%] rounded-full"
        style={{
          background: "var(--accent-gradient)",
          boxShadow: "0 0 90px 20px var(--glow-warm)",
        }}
      />
    </div>
  );
}

/** Hueco tranquilo mientras carga el modelo de un servicio. */
export function ScenePlaceholder() {
  return (
    <div
      className="h-full w-full rounded-[var(--r-panel)]"
      style={{
        background:
          "radial-gradient(60% 60% at 50% 50%, var(--glow-warm) 0%, transparent 70%)",
      }}
    />
  );
}
