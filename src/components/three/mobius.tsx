"use client";

import { useEnvironment } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import { DoubleSide, type Mesh, type MeshPhysicalMaterial } from "three";

import { createMobiusGeometry } from "./mobius-geometry";
import type { SceneStore } from "./scene-store";

export const HDRI_PATH = "/hdri/citrus-orchard-road-puresky-1k.hdr";

/**
 * La cinta de Möbius de vidrio.
 *
 * El material es el de altitude101 casi valor por valor: dispersión 5
 * para que cada longitud de onda refracte distinto y aparezcan los
 * arcoíris, ior bajo, casi sin rugosidad y sin metal. El mapa de
 * entorno es un cielo despejado (CC0, Poly Haven): es lo que se ve
 * reflejado en la superficie y lo que se descompone en colores al
 * atravesarla.
 *
 * Dos desviaciones deliberadas:
 *
 *   · transmisión 1 en vez de 1.5. El original extrapola por encima de
 *     1 y el vidrio se quema a blanco; sobre su fondo blanco no se
 *     nota, sobre el nuestro oscuro sale un aro blanco opaco.
 *   · algo de iridiscencia (película fina). Sobre fondo claro el vidrio
 *     ya coge color del entorno; sobre fondo oscuro necesita generarlo
 *     él, y la iridiscencia es lo que le pone el arcoíris en la
 *     superficie aunque no tenga nada brillante detrás.
 *
 * `color: transparent` en el original es un nombre inválido que three
 * ignora; equivale a blanco, que es lo que va aquí.
 */
const MATERIAL = {
  clearcoat: 0,
  clearcoatRoughness: 0.8,
  dispersion: 5,
  envMapIntensity: 1.18,
  ior: 1.2,
  metalness: 0,
  roughness: 0.1,
  thickness: 1,
  transmission: 1,
  iridescence: 0.55,
  iridescenceIOR: 1.3,
  iridescenceThicknessRange: [120, 460] as [number, number],
} as const;

export function Mobius({ store }: { store: SceneStore }) {
  const geometry = useMemo(() => createMobiusGeometry(), []);
  const envMap = useEnvironment({ files: HDRI_PATH });

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <group
      ref={(node) => {
        store.refs.modelTilt = node;
      }}
    >
      <group
        ref={(node) => {
          store.refs.modelGroup = node;
        }}
        position={[0, 0, -1.1]}
        rotation={[0, Math.PI / 6, 0]}
      >
        <group
          ref={(node) => {
            store.refs.modelInner = node;
          }}
        >
          <mesh
            ref={(node: Mesh | null) => {
              store.refs.modelMesh = node;
            }}
            geometry={geometry}
          >
            <meshPhysicalMaterial
              ref={(material: MeshPhysicalMaterial | null) => {
                if (material) material.needsUpdate = true;
              }}
              color="#ffffff"
              clearcoat={MATERIAL.clearcoat}
              clearcoatRoughness={MATERIAL.clearcoatRoughness}
              dispersion={MATERIAL.dispersion}
              envMap={envMap}
              envMapIntensity={MATERIAL.envMapIntensity}
              ior={MATERIAL.ior}
              metalness={MATERIAL.metalness}
              reflectivity={0}
              roughness={MATERIAL.roughness}
              side={DoubleSide}
              thickness={MATERIAL.thickness}
              transmission={MATERIAL.transmission}
              iridescence={MATERIAL.iridescence}
              iridescenceIOR={MATERIAL.iridescenceIOR}
              iridescenceThicknessRange={MATERIAL.iridescenceThicknessRange}
              transparent
              depthWrite
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
