"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import { ACESFilmicToneMapping, MathUtils, type MeshPhysicalMaterial } from "three";

import { Backdrop } from "./backdrop";
import { DRAG, HERO_LETTERS, SCENE } from "./constants";
import { DotsSphere } from "./dots-sphere";
import { HeroLetters } from "./hero-letters";
import { Mobius } from "./mobius";
import type { SceneStore } from "./scene-store";
import { WordRing } from "./word-ring";

type SceneProps = {
  store: SceneStore;
  words: [string, string, string];
  isMobile: boolean;
  reducedMotion: boolean;
};

/**
 * El lienzo WebGL fijo detrás de toda la página.
 *
 * Misma configuración que altitude101: cámara a z=19 con 35° de campo,
 * tone mapping ACES, sin alfa (el fondo lo pinta la propia escena).
 * dpr acotado a 1.5 porque el vidrio con transmisión renderiza la
 * escena dos veces por cuadro.
 */
export function Scene({ store, words, isMobile, reducedMotion }: SceneProps) {
  return (
    <div className="scene-canvas" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, SCENE.CAMERA_Z], fov: SCENE.CAMERA_FOV }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]}
        frameloop="always"
        performance={{ min: 0.5 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1,
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(SCENE.CLEAR_COLOR, 1);
        }}
      >
        <Suspense fallback={null}>
          <Backdrop />
          <group
            ref={(node) => {
              store.refs.textTilt = node;
            }}
          >
            <HeroLetters store={store} />
          </group>
          <Mobius store={store} lowPower={isMobile} />
          <DotsSphere store={store} lowPower={isMobile} />
          <WordRing store={store} words={words} isMobile={isMobile} />
        </Suspense>
        <Driver store={store} isMobile={isMobile} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  );
}

/**
 * Bucle por cuadro. Aquí no se decide nada: se aplican los objetivos
 * que la coreografía de scroll dejó en el almacén.
 *
 *   · inclinación con el ratón (modelo 0.042, letras 0.07, puntos 0.016)
 *   · inercia del arrastre del modelo
 *   · subida escalonada de las letras de la portada
 *   · persecución suave de posición/rotación del modelo
 *   · esfera de puntos pegada a la cámara
 *   · altura de cámara y opacidad del modelo en el tramo final
 */
function Driver({
  store,
  isMobile,
  reducedMotion,
}: {
  store: SceneStore;
  isMobile: boolean;
  reducedMotion: boolean;
}) {
  const camera = useThree((state) => state.camera);
  const pointer = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    store.refs.camera = camera;
    camera.position.set(0, 0, SCENE.CAMERA_Z);
    camera.rotation.set(0, 0, 0);
  }, [camera, store]);

  useEffect(() => {
    function onMove(event: PointerEvent) {
      pointer.current.x = event.clientX / window.innerWidth;
      pointer.current.y = event.clientY / window.innerHeight;
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useFrame((_, delta) => {
    const { refs, state, smooth } = store;
    const dt = Math.min(delta, 0.1);
    const frames = Math.min(60 * dt, 3);

    /* --- inclinación con el ratón ------------------------------- */
    if (!isMobile && !state.isUserRotating && !reducedMotion) {
      const nx = pointer.current.x * 2 - 1;
      const ny = -(pointer.current.y * 2) + 1;

      const tilt = refs.modelTilt;
      if (tilt) {
        tilt.rotation.x += (0.042 * ny - tilt.rotation.x) * 0.08;
        tilt.rotation.y += (0.042 * nx - tilt.rotation.y) * 0.08;
      }
      const text = refs.textTilt;
      if (text) {
        text.rotation.x += (0.07 * ny - text.rotation.x) * 0.1;
        text.rotation.y += (-0.07 * nx - text.rotation.y) * 0.1;
      }
      const dots = refs.dotsTilt;
      if (dots) {
        dots.rotation.x += (0.016 * ny - dots.rotation.x) * 0.08;
        dots.rotation.y += (-0.016 * nx - dots.rotation.y) * 0.08;
      }
    }

    /* --- inercia tras soltar el arrastre ------------------------ */
    const drag = state.drag;
    if (!state.isDragging && Math.abs(drag.velocityY) > 1e-4) {
      drag.offsetY += drag.velocityY;
      drag.velocityY *= DRAG.INERTIA;
      const ry = drag.baseY + drag.offsetY;
      const rx = drag.baseX + drag.offsetX;
      smooth.setTargetNaturalRotation(ry);
      smooth.setTargetRotation(rx, ry, 0);
    }

    /* --- letras: vuelven solas cerca del tope --------------------- */
    if (state.heroSmoothSnapActive) {
      const p = Math.abs(state.heroLettersProgress);
      let rate = 0.16;
      if (p > 0.5) rate = 0.25;
      else if (p > 0.2) rate = 0.2;
      const k = 1 - Math.pow(1 - rate, frames);
      state.heroLettersProgress = MathUtils.lerp(state.heroLettersProgress, 0, k);
      if (Math.abs(state.heroLettersProgress) < 0.005) {
        state.heroLettersProgress = 0;
        state.heroSmoothSnapActive = false;
      }
    }

    /* --- letras: subida escalonada ------------------------------ */
    const letters = refs.heroLetters;
    if (letters.length) {
      const progress = state.heroLettersProgress;
      const spread = HERO_LETTERS.STAGGER * letters.length;
      const k = 1 - Math.pow(1 - HERO_LETTERS.BASE_LERP, frames);
      for (let i = 0; i < letters.length; i += 1) {
        const mesh = letters[i];
        if (!mesh) continue;
        const local = MathUtils.clamp(
          progress * (1 + spread) - i * HERO_LETTERS.STAGGER,
          0,
          1,
        );
        // sine.inOut
        const eased = -(Math.cos(Math.PI * local) - 1) / 2;
        const targetY = HERO_LETTERS.MAX_Y * eased;
        mesh.position.y = MathUtils.lerp(mesh.position.y, targetY, k);
        if (Math.abs(mesh.position.y - targetY) < 0.001) mesh.position.y = targetY;
      }
    }

    /* --- esfera de puntos: sigue a la cámara y gira ------------- */
    const dots = refs.dots;
    if (dots && !state.isUserRotating) {
      dots.position.x += (camera.position.x - dots.position.x) * 0.1;
      dots.position.y += (camera.position.y - dots.position.y) * 0.1;
      dots.position.z += (camera.position.z - dots.position.z) * 0.1;
      dots.rotation.y += (state.dotsRotationY - dots.rotation.y) * 0.06;
    }

    /* --- modelo ------------------------------------------------- */
    if (refs.modelGroup) {
      smooth.update(refs.modelGroup, refs.modelInner, dt);
    }
    const mesh = refs.modelMesh;
    if (mesh) {
      const material = mesh.material as MeshPhysicalMaterial;
      material.opacity = state.modelOpacity;
      mesh.visible = state.modelOpacity > 0.01;
    }

    /* --- cámara ------------------------------------------------- */
    camera.position.y = state.cameraY;
  });

  return null;
}
