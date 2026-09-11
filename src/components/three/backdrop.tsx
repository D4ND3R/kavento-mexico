"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Color, ShaderMaterial } from "three";

/**
 * Campo de luz detrás de todo: las mismas tres masas cálidas que
 * pintaba el fondo CSS de antes (naranja arriba a la derecha, teal
 * abajo a la izquierda, dorado por abajo), ahora dentro de la escena
 * para que el vidrio del Möbius tenga algo que refractar y las letras
 * no floten sobre negro plano. Deriva despacio con el tiempo.
 */
const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBase;
  uniform vec3 uWarm;
  uniform vec3 uTeal;
  uniform vec3 uSolar;
  varying vec2 vUv;

  float glow(vec2 uv, vec2 center, vec2 radius) {
    vec2 d = (uv - center) / radius;
    float r = dot(d, d);
    return smoothstep(1.0, 0.0, r);
  }

  void main() {
    vec2 drift = vec2(sin(uTime * 0.05), cos(uTime * 0.04)) * 0.025;
    vec3 color = uBase;
    color += uWarm * 0.34 * glow(vUv, vec2(0.74, 0.70) + drift, vec2(0.40, 0.44));
    color += uTeal * 0.26 * glow(vUv, vec2(0.24, 0.28) - drift, vec2(0.32, 0.36));
    color += uSolar * 0.22 * glow(vUv, vec2(0.46, -0.08) + drift.yx, vec2(0.46, 0.40));
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export function Backdrop() {
  const material = useMemo(() => {
    const m = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBase: { value: new Color("#120e0a") },
        uWarm: { value: new Color("#ff7a1a") },
        uTeal: { value: new Color("#2fa8b8") },
        uSolar: { value: new Color("#ffc94a") },
      },
      depthWrite: false,
    });
    m.toneMapped = false;
    return m;
  }, []);

  useEffect(() => () => material.dispose(), [material]);

  return (
    <mesh
      position={[0, 0, -70]}
      material={material}
      renderOrder={-10}
      onUpdate={(mesh) => {
        mesh.frustumCulled = false;
      }}
    >
      {/* Más ancho que el campo visible a esa profundidad (≈ 60×34). */}
      <planeGeometry args={[140, 90]} />
      <BackdropClock material={material} />
    </mesh>
  );
}

function BackdropClock({ material }: { material: ShaderMaterial }) {
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime;
  });
  return null;
}
