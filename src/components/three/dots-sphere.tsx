"use client";

import { useEffect, useMemo } from "react";
import { Color, PointsMaterial, SphereGeometry, type Points } from "three";

import type { SceneStore } from "./scene-store";

/**
 * Esfera de puntos que envuelve la cámara: el "cielo" del original
 * (SphereGeometry de radio 145 con 480×277 divisiones, dibujada como
 * puntos). Aquí con menos divisiones —es un fondo, no protagonista— y
 * en el ámbar de la marca en vez de gris.
 *
 * Gira con el ratón (poco) y un sexto de vuelta al llegar a la sección
 * cinco; es lo que da la sensación de que el espacio entero se mueve
 * y no solo el modelo.
 */
export function DotsSphere({ store }: { store: SceneStore }) {
  const geometry = useMemo(() => new SphereGeometry(145, 300, 170), []);
  const material = useMemo(
    () =>
      new PointsMaterial({
        size: 0.42,
        color: new Color("#f79a2a"),
        transparent: true,
        opacity: 0.16,
        sizeAttenuation: true,
        depthWrite: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return (
    <group
      ref={(node) => {
        store.refs.dotsTilt = node;
      }}
    >
      <points
        ref={(node: Points | null) => {
          store.refs.dots = node;
        }}
        geometry={geometry}
        material={material}
      />
    </group>
  );
}
