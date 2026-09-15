"use client";

import { Text3D } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import type { Group, Mesh } from "three";

import { SCENE } from "./constants";
import { useGradientMaterial } from "./gradient-material";
import { markSceneReady, type SceneStore } from "./scene-store";

export const FONT_PATH = "/fonts/space-grotesk-bold.typeface.json";

/** La palabra de la portada. */
const WORD = "KAVENTO";

/** Profundidad a la que vive la palabra, detrás del modelo. */
const DEPTH = -15;

/** Fracción del ancho visible que ocupa la palabra. */
const FILL = 0.84;

/**
 * Ajustes de par (kerning) en fracción del tamaño. Space Grotesk en
 * caja alta deja huecos grandes entre diagonales; se cierran a mano
 * como hace el original con su tabla `II/IM/MI…`.
 */
const KERN: Record<string, number> = {
  KA: -0.07,
  AV: -0.11,
  VE: -0.05,
  EN: -0.01,
  NT: -0.03,
  TO: -0.05,
};

/**
 * "KAVENTO" en letras 3D extruidas, cada una una malla propia para que
 * el scroll pueda subirlas por separado.
 *
 * El tamaño no se fija en unidades: se mide el ancho total de la
 * palabra una vez que las geometrías existen y se escala el grupo para
 * que ocupe el 84 % del ancho visible a su profundidad. Así la palabra
 * es enorme en cualquier pantalla sin salirse por los lados.
 */
export function HeroLetters({ store }: { store: SceneStore }) {
  const group = useRef<Group>(null);
  const laidOut = useRef(false);
  const size = useThree((state) => state.size);
  const material = useGradientMaterial();

  const letters = WORD.split("");
  const fontSize = 2;

  useEffect(() => {
    store.refs.heroGroup = group.current;
    // Ancho o alto de ventana nuevos: hay que volver a maquetar.
    laidOut.current = false;
  }, [store, size.width, size.height]);

  useFrame(() => {
    if (laidOut.current) return;
    const meshes = store.refs.heroLetters;
    if (meshes.length !== letters.length || meshes.some((m) => !m?.geometry)) {
      return;
    }

    const widths: number[] = [];
    for (const mesh of meshes) {
      const geometry = mesh!.geometry;
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      widths.push(box.max.x - box.min.x);
    }

    const tracking = 0.01 * fontSize;
    const gap = (i: number) =>
      tracking + (KERN[letters[i] + letters[i + 1]] ?? 0) * fontSize;

    let total = 0;
    letters.forEach((_, i) => {
      total += widths[i];
      if (i < letters.length - 1) total += gap(i);
    });

    // Se coloca cada letra pegada a la anterior, y el bloque centrado.
    let cursor = -total / 2;
    meshes.forEach((mesh, i) => {
      const box = mesh!.geometry.boundingBox!;
      mesh!.position.x = cursor - box.min.x;
      mesh!.position.z = 0;
      cursor += widths[i];
      if (i < letters.length - 1) cursor += gap(i);
    });

    // Escala del grupo para llenar el ancho visible a esta profundidad.
    const distance = SCENE.CAMERA_Z - DEPTH;
    const fov = (SCENE.CAMERA_FOV * Math.PI) / 180;
    const visibleHeight = 2 * distance * Math.tan(fov / 2);
    const visibleWidth = visibleHeight * (size.width / size.height);
    // En pantallas estrechas la palabra puede llenar casi todo el ancho:
    // no compite con nada a los lados.
    const fill = size.width < 768 ? 0.94 : FILL;
    const scale = (visibleWidth * fill) / total;

    // Ligeramente por debajo del centro, para que el modelo la cruce.
    // En pantallas estrechas el texto de la portada ocupa la mitad de
    // abajo, así que la palabra sube por encima del centro.
    const lift = size.width < 768 ? 2.2 : -0.35;
    if (group.current) {
      group.current.scale.setScalar(scale);
      group.current.position.set(0, lift * scale, DEPTH);
      material.uniforms.origin.value = [0, lift * scale + fontSize * 0.36 * scale, DEPTH];
    }
    material.uniforms.span.value = (total / 2) * scale;
    store.state.heroSpan = (total / 2) * scale;

    laidOut.current = true;
    markSceneReady(store);
  });

  return (
    <group ref={group} position={[0, -0.5, DEPTH]}>
      {letters.map((letter, i) => (
        <Text3D
          key={`${letter}-${i}`}
          ref={(mesh: Mesh | null) => {
            store.refs.heroLetters[i] = mesh;
          }}
          font={FONT_PATH}
          size={fontSize}
          height={0.22}
          curveSegments={10}
          bevelEnabled={false}
          material={material}
        >
          {letter}
        </Text3D>
      ))}
    </group>
  );
}
