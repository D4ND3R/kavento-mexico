"use client";

import { SceneFrame } from "./scene-frame";
import { SolarMark } from "./solar-mark";
import { SolarPlaceholder } from "./lazy";
import { useCoarsePointer } from "@/lib/hooks";

/**
 * La marca solar del hero, con su canvas.
 *
 * Vive en su propio módulo para que next/dynamic pueda separarla del
 * bundle inicial. Se monta sin esperar al observador porque está sobre
 * el pliegue: diferirla no ahorraría nada y solo retrasaría la marca.
 */
export function HeroSun({ label }: { label: string }) {
  const coarsePointer = useCoarsePointer();

  return (
    <SceneFrame
      eager
      label={label}
      className="h-full w-full"
      cameraZ={4.4}
      fov={44}
      fallback={<SolarPlaceholder />}
    >
      <SolarMark shardCount={coarsePointer ? 110 : 200} />
    </SceneFrame>
  );
}
