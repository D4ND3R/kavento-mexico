import { Euler, Vector3 } from "three";
import type { Camera, Group, Mesh, Points } from "three";

import { SmoothTransform } from "./smooth-transform";

/**
 * Estado compartido entre la escena (dentro del Canvas) y la
 * coreografía de scroll (fuera, en el DOM).
 *
 * Nada de esto pasa por React: GSAP escribe objetivos aquí en cada
 * evento de scroll y el bucle de render los lee en cada cuadro. Si
 * fuera estado de React, cada pixel de scroll provocaría un render.
 */
export type SceneRefs = {
  camera: Camera | null;
  /** Grupo exterior del modelo: recibe posición/rotación del scroll. */
  modelGroup: Group | null;
  /** Grupo interior: gira sobre sí mismo (rotación natural). */
  modelInner: Group | null;
  /** Grupo que inclina el modelo con el ratón. */
  modelTilt: Group | null;
  modelMesh: Mesh | null;
  heroGroup: Group | null;
  heroLetters: (Mesh | null)[];
  textTilt: Group | null;
  dotsTilt: Group | null;
  dots: Points | null;
  wordRing: Group | null;
};

export type DragState = {
  startX: number;
  startY: number;
  baseX: number;
  baseY: number;
  offsetX: number;
  offsetY: number;
  velocityX: number;
  velocityY: number;
  lastX: number;
  lastY: number;
  reenableTimeout: number | null;
};

export type SceneState = {
  /** 0 → 1 mientras la portada se desplaza; mueve las letras. */
  heroLettersProgress: number;
  /** Al volver arriba las letras bajan solas aunque el scroll se pare. */
  heroSmoothSnapActive: boolean;
  previousScrollY: number;
  isDragging: boolean;
  isUserRotating: boolean;
  userHasDraggedOnce: boolean;
  drag: DragState;
  section34: { prevPos: Vector3; prevRot: Euler; captured: boolean };
  /** Multiplicador del giro automático (baja a 0 al salir de portada). */
  rotationSpeed: number;
  /** Ángulo objetivo Y de la esfera de puntos. */
  dotsRotationY: number;
  /** Altura de la cámara: cae a -15 al final del recorrido. */
  cameraY: number;
  /** Opacidad del modelo (se apaga al final del recorrido). */
  modelOpacity: number;
  /** Anillo de palabras: progreso 0→1 dentro del tramo final. */
  wordRingProgress: number;
  /** Progreso de la última sección, 0→1. */
  section8Progress: number;
  /** Radio del degradado de las letras, medido tras maquetarlas. */
  heroSpan: number;
};

/** Callbacks que el DOM registra para que GSAP los mueva. */
export type SceneDom = {
  /** Portada: eyebrow, CTA y pista de scroll. */
  hero?: (progress: number) => void;
  /** Manifiesto de cuatro líneas. */
  manifesto?: (progress: number) => void;
  /** Tres etapas de texto bajo el anillo de palabras. */
  finalOverlay?: (
    stage: number,
    local: number,
    visible: number,
    section8: number,
  ) => void;
};

export type SceneStore = {
  refs: SceneRefs;
  state: SceneState;
  smooth: SmoothTransform;
  dom: SceneDom;
  /** true cuando el modelo y las letras están montados y maquetados. */
  ready: boolean;
  onReady: Set<() => void>;
};

export function createSceneStore(): SceneStore {
  return {
    refs: {
      camera: null,
      modelGroup: null,
      modelInner: null,
      modelTilt: null,
      modelMesh: null,
      heroGroup: null,
      heroLetters: [],
      textTilt: null,
      dotsTilt: null,
      dots: null,
      wordRing: null,
    },
    state: {
      heroLettersProgress: 0,
      heroSmoothSnapActive: false,
      previousScrollY: 0,
      isDragging: false,
      isUserRotating: false,
      userHasDraggedOnce: false,
      drag: {
        startX: 0,
        startY: 0,
        baseX: 0,
        baseY: 0,
        offsetX: 0,
        offsetY: 0,
        velocityX: 0,
        velocityY: 0,
        lastX: 0,
        lastY: 0,
        reenableTimeout: null,
      },
      section34: { prevPos: new Vector3(), prevRot: new Euler(), captured: false },
      rotationSpeed: 1,
      dotsRotationY: 0,
      cameraY: 0,
      modelOpacity: 1,
      wordRingProgress: 0,
      section8Progress: 0,
      heroSpan: 12,
    },
    smooth: new SmoothTransform(),
    dom: {},
    ready: false,
    onReady: new Set(),
  };
}

export function markSceneReady(store: SceneStore) {
  if (store.ready) return;
  store.ready = true;
  for (const listener of store.onReady) listener();
  // Atributo además del evento: quien se monte tarde puede leerlo.
  document.documentElement.dataset.sceneReady = "true";
  window.dispatchEvent(new Event("kavento:scene-ready"));
}
