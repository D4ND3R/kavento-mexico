"use client";

import { useFrame } from "@react-three/fiber";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import { useReducedMotion } from "@/lib/hooks";
import { readPalette } from "@/lib/palette";

/* El núcleo: degradado del logo proyectado sobre la esfera + borde caliente. */
const CORE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

const CORE_FRAGMENT = /* glsl */ `
  uniform vec3 uEmber;
  uniform vec3 uSolar;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 v = normalize(vView);

    // Mismo eje que el disco del logotipo: naranja-rojo abajo a la
    // izquierda, amarillo arriba a la derecha.
    float axis = clamp(0.5 + 0.62 * (n.x + n.y), 0.0, 1.0);
    vec3 color = mix(uEmber * 0.86, uSolar, axis);

    // Bandas diagonales apenas perceptibles: las facetas del logo impreso.
    color *= 0.955 + 0.045 * sin((n.x + n.y) * 13.0);

    // Borde caliente: el limbo del sol se enciende al alejarse de la cámara.
    float rim = pow(1.0 - max(dot(n, v), 0.0), 2.4);
    color += uSolar * rim * 0.45;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* La atmósfera: solo el halo, dibujado por dentro de una esfera mayor. */
const HALO_FRAGMENT = /* glsl */ `
  uniform vec3 uEmber;
  uniform vec3 uSolar;
  varying vec3 vNormal;
  varying vec3 vView;

  void main() {
    vec3 n = normalize(-vNormal);
    vec3 v = normalize(vView);
    float fresnel = pow(1.0 - max(dot(n, v), 0.0), 3.2);
    gl_FragColor = vec4(mix(uEmber, uSolar, 0.45), fresnel * 0.5);
  }
`;

/** Pseudoaleatorio determinista: la misma corona en cada carga. */
function hashed(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

type SolarMarkProps = {
  /** Menos astillas en móvil: mismo dibujo, menos trabajo. */
  shardCount?: number;
};

/**
 * La marca solar del logo, en volumen: un núcleo con el degradado de la
 * marca, un halo de fresnel y una corona de astillas que orbita despacio.
 *
 * La corona es un único InstancedMesh — 180 astillas en una sola llamada
 * de dibujo — y la animación mueve el grupo entero, no cada instancia.
 */
export function SolarMark({ shardCount = 180 }: SolarMarkProps) {
  const reducedMotion = useReducedMotion();
  const palette = useMemo(() => readPalette(), []);

  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const corona = useRef<THREE.InstancedMesh>(null);
  const coronaMaterial = useRef<THREE.MeshBasicMaterial>(null);

  /** Avance del encendido, de 0 a 1. Arranca completo si se pidió menos movimiento. */
  const ignition = useRef(reducedMotion ? 1 : 0);

  const uniforms = useMemo(
    () => ({
      uEmber: { value: new THREE.Color(palette.ember) },
      uSolar: { value: new THREE.Color(palette.solar) },
    }),
    [palette],
  );

  // Distribución de la corona: espiral de Fibonacci para repartir las
  // astillas de forma pareja sobre la esfera, sin racimos.
  useLayoutEffect(() => {
    const mesh = corona.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    const ember = new THREE.Color(palette.ember);
    const solar = new THREE.Color(palette.solar);
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < shardCount; i += 1) {
      const y = 1 - (i / Math.max(shardCount - 1, 1)) * 2;
      const ring = Math.sqrt(Math.max(1 - y * y, 0));
      const theta = goldenAngle * i;

      const direction = new THREE.Vector3(
        Math.cos(theta) * ring,
        y,
        Math.sin(theta) * ring,
      );

      const distance = 1.24 + hashed(i, 1) * 0.34;
      dummy.position.copy(direction).multiplyScalar(distance);

      // lookAt al origen deja +Z apuntando al centro: la astilla queda radial.
      dummy.lookAt(0, 0, 0);

      const length = 0.04 + hashed(i, 2) * 0.11;
      const thickness = 0.006 + hashed(i, 3) * 0.006;
      dummy.scale.set(thickness, thickness, length);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      color.copy(ember).lerp(solar, hashed(i, 4));
      mesh.setColorAt(i, color);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [palette, shardCount]);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (!reducedMotion) {
      // Encendido: ~1.6 s con salida exponencial, una sola vez.
      ignition.current = Math.min(1, ignition.current + delta / 1.6);
    }

    const eased = 1 - Math.pow(1 - ignition.current, 4);
    const elapsed = state.clock.elapsedTime;

    group.current.scale.setScalar(0.74 + 0.26 * eased);

    if (!reducedMotion) {
      group.current.rotation.y += delta * 0.055;
      group.current.rotation.x = Math.sin(elapsed * 0.22) * 0.1;

      if (core.current) {
        // Respiración apenas perceptible: el sol no se queda muerto.
        core.current.scale.setScalar(1 + Math.sin(elapsed * 0.9) * 0.012);
      }
    }

    if (coronaMaterial.current) {
      coronaMaterial.current.opacity = 0.4 * eased;
    }
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={CORE_VERTEX}
          fragmentShader={CORE_FRAGMENT}
        />
      </mesh>

      <mesh scale={1.28}>
        <sphereGeometry args={[1, 48, 48]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={CORE_VERTEX}
          fragmentShader={HALO_FRAGMENT}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <instancedMesh
        ref={corona}
        args={[undefined, undefined, shardCount]}
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          ref={coronaMaterial}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </instancedMesh>
    </group>
  );
}
