"use client";

import { Text3D } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

import { useGradientMaterial } from "./gradient-material";
import { FONT_PATH } from "./hero-letters";
import type { SceneStore } from "./scene-store";

/** Radio del anillo: las palabras cuelgan a esta distancia del centro. */
const RADIUS = 11;

/**
 * Tres palabras colocadas en tres lados de un cuadrado alrededor de la
 * cámara (la del frente queda detrás del ojo y no se ve). El scroll
 * gira el anillo de cuarto en cuarto y cada giro trae una palabra
 * nueva al fondo. Es el "WHERE / HOW / WHAT" del original, aquí
 * "DISEÑO / CÓDIGO / ESCALA".
 *
 * La palabra del fondo está rotada π, lo que la espejaría; el
 * `scale.x = -1` la vuelve legible. Las tres arrancan con escala 0
 * y el recorrido las enciende.
 */
export function WordRing({
  store,
  words,
  isMobile,
}: {
  store: SceneStore;
  words: [string, string, string];
  isMobile: boolean;
}) {
  const material = useGradientMaterial(6);
  const centered = useRef(new WeakSet<Mesh>());

  const size = isMobile ? 1.5 : 3;
  const y = isMobile ? 1 : 0;

  const center = (mesh: Mesh | null) => {
    if (!mesh || centered.current.has(mesh)) return;
    mesh.geometry.center();
    mesh.renderOrder = 10;
    centered.current.add(mesh);
  };

  return (
    <group
      ref={(node) => {
        store.refs.wordRing = node;
      }}
      position={[0, 0, 8]}
      rotation={[0, -Math.PI / 2, 0]}
      scale={[0, 0, 0]}
    >
      {/* Tercera palabra: al frente (z+), llega al fondo con el último giro. */}
      <Text3D
        key={words[2]}
        ref={center}
        font={FONT_PATH}
        size={size}
        height={0.2}
        curveSegments={10}
        position={[0, y, RADIUS]}
        scale={[-1, 1, 1]}
        material={material}
      >
        {words[2]}
      </Text3D>

      {/* Segunda palabra: a la derecha (x+). */}
      <Text3D
        key={words[1]}
        ref={center}
        font={FONT_PATH}
        size={size}
        height={0.2}
        curveSegments={10}
        position={[RADIUS, y, 0]}
        rotation={[0, Math.PI / 2, 0]}
        scale={[-1, 1, 1]}
        material={material}
      >
        {words[1]}
      </Text3D>

      {/* Primera palabra: al fondo (z-), la que se ve al empezar. */}
      <Text3D
        key={words[0]}
        ref={center}
        font={FONT_PATH}
        size={size}
        height={0.2}
        curveSegments={10}
        position={[0, y, -RADIUS]}
        rotation={[0, Math.PI, 0]}
        scale={[-1, 1, 1]}
        material={material}
      >
        {words[0]}
      </Text3D>
    </group>
  );
}
