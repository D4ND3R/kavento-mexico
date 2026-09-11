"use client";

import { useEffect, useMemo } from "react";
import { Color, FrontSide, ShaderMaterial } from "three";

import { LETTER_GRADIENT } from "./constants";

/**
 * Degradado en tres colores sobre las letras 3D, portado del shader de
 * altitude101 (azul → celeste → violeta). Aquí va con la paleta de la
 * marca: naranja → dorado → teal.
 *
 * Se calcula en espacio de mundo y no por letra, para que el degradado
 * cruce la palabra entera de una punta a otra en diagonal, y no se
 * repita en cada glifo. El uniforme `span` es el semiancho de la
 * palabra en unidades de mundo: fija dónde caen los extremos.
 */
const vertexShader = /* glsl */ `
  varying vec3 vWorldPosition;

  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 colorLeft;
  uniform vec3 colorMiddle;
  uniform vec3 colorRight;
  uniform float span;
  uniform vec3 origin;
  varying vec3 vWorldPosition;

  void main() {
    // Diagonal: de abajo-izquierda a arriba-derecha, relativa al
    // centro de la palabra.
    vec3 p = vWorldPosition - origin;
    float t = ((p.x + p.y * 0.55) + span) / (2.0 * span);
    t = clamp(t, 0.0, 1.0);

    vec3 color;
    if (t < 0.4) {
      color = mix(colorLeft, colorMiddle, t / 0.4);
    } else if (t < 0.6) {
      // El color central se sostiene un tramo antes de virar.
      color = colorMiddle;
    } else {
      color = mix(colorMiddle, colorRight, (t - 0.6) / 0.4);
    }

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export function createGradientMaterial(span = 12): ShaderMaterial {
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      colorLeft: { value: new Color(LETTER_GRADIENT.left) },
      colorMiddle: { value: new Color(LETTER_GRADIENT.middle) },
      colorRight: { value: new Color(LETTER_GRADIENT.right) },
      span: { value: span },
      origin: { value: [0, 0, 0] },
    },
    side: FrontSide,
  });
  material.toneMapped = false;
  return material;
}

/** Un solo material compartido por todas las letras de una palabra. */
export function useGradientMaterial(span = 12): ShaderMaterial {
  const material = useMemo(() => createGradientMaterial(span), [span]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}
