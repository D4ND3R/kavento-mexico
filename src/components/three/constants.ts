/**
 * Tablas de la coreografía 3D, ingeniería inversa de altitude101.com.
 *
 * Todo lo que mueve la escena al hacer scroll sale de aquí: dónde se
 * ancla el modelo en cada sección (PINS), con qué inercia persigue
 * esos anclajes (LERP), cómo suben las letras de la portada
 * (HERO_LETTERS) y cómo responde al arrastre (DRAG). Los valores son
 * los del sitio original salvo donde se indica.
 */

export const SCENE = {
  /** Cámara: z=19 y 35° de campo, como el original. */
  CAMERA_Z: 19,
  CAMERA_FOV: 35,
  /** Fondo del lienzo: el negro café de la paleta. */
  CLEAR_COLOR: "#120e0a",
} as const;

export const HERO_LETTERS = {
  /** Altura a la que sube cada letra al salir de la portada. */
  MAX_Y: 10.1,
  /** Retraso entre letra y letra, en fracción del progreso. */
  STAGGER: 0.016,
  /** Por debajo de este scroll, al subir, las letras vuelven solas. */
  SNAP_THRESHOLD: 120,
  BASE_LERP: 0.14,
} as const;

export const DRAG = {
  SENSITIVITY: 0.008,
  INERTIA: 0.92,
  MULTIPLIER: 4,
  /** ms tras soltar hasta que el giro automático vuelve. */
  REENABLE_DELAY: 800,
} as const;

export const LERP = {
  FAST: { position: 0.15, rotation: 0.12, scale: 0.15 },
  NORMAL: { position: 0.08, rotation: 0.06, scale: 0.08 },
  SLOW: { position: 0.06, rotation: 0.04, scale: 0.06 },
} as const;

export const SCROLL = {
  /** Retardo del scrub de ScrollTrigger (segundos). */
  SCRUB: 1.5,
} as const;

export const MOBILE = {
  SCALE_FACTOR: 0.6,
} as const;

export type Vec3 = { x: number; y: number; z: number };

/**
 * Anclajes del modelo por sección. El original guarda posiciones en
 * unidades de su FBX; aquí el Möbius es procedural y mide ~7 unidades,
 * así que la escala base es 1 en vez de 0.015.
 */
export const PINS = {
  SECTION1: {
    position: { x: 0, y: 0, z: -1.1 },
    rotation: { x: 0, y: Math.PI / 6, z: 0 },
    scale: 1,
  },
  SECTION34: {
    position: { x: 5, y: 0, z: 3.9 },
    rotationStart: { x: 0, y: Math.PI / 4, z: 0 },
    rotationEnd: { x: 2 * Math.PI, y: Math.PI / 4, z: 0 },
  },
  SECTION5: {
    position: { x: 0, y: 0, z: -1.1 },
    rotation: { x: 1.5 * Math.PI + Math.PI / 4, y: 0, z: 0 },
  },
  SECTION6: {
    rotation: { x: 1.5 * Math.PI + Math.PI / 2, y: Math.PI / 6, z: 0 },
  },
  SECTION7: {
    position: { x: 0, y: 0, z: -6.1 },
    rotation: {
      x: 1.5 * Math.PI + Math.PI / 2 + Math.PI,
      y: Math.PI / 8,
      z: 0,
    },
  },
} as const;

/** Colores del degradado de las letras 3D: la paleta solar y el teal. */
export const LETTER_GRADIENT = {
  left: "#ff7a1a",
  middle: "#ffc94a",
  right: "#5fc8d8",
} as const;
