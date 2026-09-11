"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { Euler, MathUtils, Quaternion, Vector3 } from "three";

import { DRAG, HERO_LETTERS, LERP, MOBILE, PINS, SCROLL } from "./constants";
import type { SceneStore } from "./scene-store";

gsap.registerPlugin(ScrollTrigger);

const TAU = Math.PI * 2;

/** Diferencia angular por el camino corto. */
function shortest(from: number, to: number) {
  let diff = to - from;
  if (diff > Math.PI) diff -= TAU;
  if (diff < -Math.PI) diff += TAU;
  return diff;
}

const power1InOut = gsap.parseEase("power1.inOut");
const power1Out = gsap.parseEase("power1.out");
const power2InOut = gsap.parseEase("power2.inOut");
const power2Out = gsap.parseEase("power2.out");

/**
 * Coreografía de scroll de la escena, portada de altitude101.
 *
 * Seis disparadores de ScrollTrigger, uno por tramo del recorrido:
 *
 *   1. portada          el modelo se va a la derecha y las letras suben
 *   2. manifiesto       el modelo da una vuelta completa sobre X mientras
 *                       aparecen las cuatro líneas de texto
 *   3. tramo fijado     desde el 70 % del manifiesto hasta la última
 *                       sección: el modelo vuelve al centro y retrocede,
 *                       y el anillo de palabras gira de cuarto en cuarto
 *                       con imán en cada palabra
 *   4. sección cinco    vuelco del modelo; la esfera de puntos gira
 *   5. sección seis     segundo vuelco
 *   6. cierre           la cámara cae y el modelo se apaga
 *
 * Los disparadores no escriben en la escena: dejan objetivos en el
 * almacén y el bucle de render los persigue con inercia. Por eso el
 * scroll puede ir a saltos y el modelo nunca da un tirón.
 *
 * El orden de creación importa: ScrollTrigger ordena por posición de
 * inicio, y cuando dos tramos se solapan manda el que empieza después.
 */
export function useJourney(
  store: SceneStore,
  { isMobile, reducedMotion }: { isMobile: boolean; reducedMotion: boolean },
) {
  useEffect(() => {
    let disposed = false;
    let ctx: gsap.Context | null = null;
    const cleanups: (() => void)[] = [];

    function setup() {
      if (disposed) return;
      const { refs, state, smooth } = store;
      const modelGroup = refs.modelGroup;
      if (!modelGroup) return;

      const scaleFactor = isMobile ? MOBILE.SCALE_FACTOR : 1;
      const baseScale = PINS.SECTION1.scale * scaleFactor;

      /* --- estado inicial ---------------------------------------- */
      const p1 = PINS.SECTION1.position;
      const r1 = PINS.SECTION1.rotation;
      smooth.setCurrentPosition(p1.x, p1.y, p1.z);
      smooth.setCurrentRotation(r1.x, r1.y, r1.z);
      smooth.setCurrentScale(baseScale);
      smooth.captureNaturalRotation(0);
      smooth.setNaturalRotation(!reducedMotion, 0.25);
      smooth.setLerpFactors(LERP.NORMAL);
      modelGroup.position.set(p1.x, p1.y, p1.z);
      modelGroup.rotation.set(r1.x, r1.y, r1.z);
      modelGroup.scale.setScalar(baseScale);
      state.rotationSpeed = 1;
      state.previousScrollY = window.scrollY;

      /* --- imán de las letras al volver arriba --------------------- */
      function trackScroll() {
        const y = window.scrollY;
        const up = y < state.previousScrollY;
        if (up && y <= HERO_LETTERS.SNAP_THRESHOLD) state.heroSmoothSnapActive = true;
        if (y <= 0) state.heroSmoothSnapActive = true;
        if (!up && y > HERO_LETTERS.SNAP_THRESHOLD + 40) {
          state.heroSmoothSnapActive = false;
        }
        state.previousScrollY = y;
      }
      window.addEventListener("scroll", trackScroll, { passive: true });
      cleanups.push(() => window.removeEventListener("scroll", trackScroll));
      ScrollTrigger.addEventListener("refresh", trackScroll);
      cleanups.push(() => ScrollTrigger.removeEventListener("refresh", trackScroll));

      /* --- arrastre del modelo en la portada ---------------------- */
      if (!isMobile) {
        const drag = state.drag;
        const section1 = document.getElementById("section-1");

        const startDrag = (event: PointerEvent) => {
          if (drag.reenableTimeout) {
            window.clearTimeout(drag.reenableTimeout);
            drag.reenableTimeout = null;
          }
          state.isUserRotating = true;
          state.isDragging = true;
          state.userHasDraggedOnce = true;
          drag.startX = drag.lastX = event.clientX;
          drag.startY = drag.lastY = event.clientY;
          drag.velocityX = drag.velocityY = 0;
          drag.offsetX = drag.offsetY = 0;
          const inner = refs.modelInner;
          drag.baseY = smooth.normalize(
            inner ? inner.rotation.y : smooth.getCurrentNaturalRotation(),
          );
          drag.baseX = smooth.normalize(smooth.getCurrentRotation().x);
          smooth.captureNaturalRotation(drag.baseY);
          smooth.setNaturalRotation(false);
        };

        const moveDrag = (event: PointerEvent) => {
          if (!state.isDragging) return;
          const dx = event.clientX - drag.lastX;
          const dy = event.clientY - drag.lastY;
          drag.lastX = event.clientX;
          drag.lastY = event.clientY;
          const sy = -dx * DRAG.SENSITIVITY;
          const sx = -dy * DRAG.SENSITIVITY;
          drag.offsetY += sy;
          drag.offsetX += sx;
          drag.velocityY = 0.7 * drag.velocityY + 0.3 * sy;
          drag.velocityX = 0.7 * drag.velocityX + 0.3 * sx;
          smooth.setTargetNaturalRotation(drag.baseY + drag.offsetY);
          smooth.setTargetRotation(drag.baseX + drag.offsetX, r1.y, 0);
        };

        const endDrag = () => {
          if (!state.isDragging) return;
          state.isDragging = false;
          const ry = drag.baseY + drag.offsetY + drag.velocityY * DRAG.MULTIPLIER;
          const rx = drag.baseX + drag.offsetX + drag.velocityX * DRAG.MULTIPLIER;
          smooth.setTargetNaturalRotation(ry);
          smooth.setTargetRotation(rx, r1.y, 0);

          if (drag.reenableTimeout) window.clearTimeout(drag.reenableTimeout);
          drag.reenableTimeout = window.setTimeout(() => {
            const inner = refs.modelInner;
            if (inner) smooth.captureNaturalRotation(inner.rotation.y);
            smooth.setNaturalRotation(!reducedMotion, 0.25 * state.rotationSpeed);
            // La inclinación vuelve a la de la portada.
            smooth.setTargetRotation(r1.x, r1.y, r1.z);
            state.isUserRotating = false;
            drag.reenableTimeout = null;
          }, DRAG.REENABLE_DELAY);
        };

        section1?.addEventListener("pointerdown", startDrag);
        window.addEventListener("pointermove", moveDrag, { passive: true });
        window.addEventListener("pointerup", endDrag);
        cleanups.push(() => {
          section1?.removeEventListener("pointerdown", startDrag);
          window.removeEventListener("pointermove", moveDrag);
          window.removeEventListener("pointerup", endDrag);
          if (drag.reenableTimeout) window.clearTimeout(drag.reenableTimeout);
        });
      }

      /* --- disparadores ------------------------------------------ */
      const p34 = PINS.SECTION34.position;
      const r34s = PINS.SECTION34.rotationStart;
      const r34e = PINS.SECTION34.rotationEnd;
      const p5 = PINS.SECTION5.position;
      const r5 = PINS.SECTION5.rotation;
      const r6 = PINS.SECTION6.rotation;
      const p7 = PINS.SECTION7.position;
      const r7 = PINS.SECTION7.rotation;
      const mobileY = (y: number) => (isMobile ? 1 : y);

      const heroActive = () =>
        Boolean(ScrollTrigger.getById("st-hero-mobius")?.isActive);

      ctx = gsap.context(() => {
        /* 1 · portada ------------------------------------------- */
        gsap.timeline({
          scrollTrigger: {
            id: "st-hero-mobius",
            trigger: "#section-1",
            start: "top top",
            end: "bottom top",
            scrub: SCROLL.SCRUB,
            onEnter: () => {
              state.rotationSpeed = 1;
              state.heroLettersProgress = 0;
              smooth.setNaturalRotation(!reducedMotion, 0.25);
            },
            onEnterBack: () => {
              state.heroLettersProgress = 1;
              state.rotationSpeed = 1;
              smooth.setNaturalRotation(!reducedMotion, 0.25);
            },
            onLeave: () => {
              state.heroLettersProgress = 1;
              if (refs.modelInner) {
                smooth.captureNaturalRotation(refs.modelInner.rotation.y);
              }
              state.rotationSpeed = 0;
              smooth.setNaturalRotation(false);
            },
            onLeaveBack: () => {
              state.heroLettersProgress = 0;
            },
            onUpdate: (self) => {
              const a = self.progress;
              state.heroLettersProgress = a;
              store.dom.hero?.(a);

              if (a > 0.01) {
                state.isUserRotating = false;
                state.isDragging = false;
                state.userHasDraggedOnce = false;
                if (state.drag.reenableTimeout) {
                  window.clearTimeout(state.drag.reenableTimeout);
                  state.drag.reenableTimeout = null;
                }
              } else if (a === 0) {
                state.userHasDraggedOnce = false;
              }

              const u = power2InOut(a);
              if (a < 0.2) smooth.setLerpFactors(LERP.FAST);
              else if (a > 0.7) smooth.setLerpFactors(LERP.SLOW);
              else smooth.setLerpFactors(LERP.NORMAL);

              smooth.setTargetPosition(
                MathUtils.lerp(p1.x, p34.x, u),
                MathUtils.lerp(p1.y, p34.y, u),
                MathUtils.lerp(p1.z, p34.z, u),
              );
              smooth.setTargetRotation(
                MathUtils.lerp(r1.x, r34s.x, u),
                MathUtils.lerp(r1.y, r34s.y, u),
                MathUtils.lerp(r1.z, r34s.z, u),
              );

              // El giro automático se frena en el último tramo.
              if (a > 0.7) {
                const r = (a - 0.7) / 0.3;
                state.rotationSpeed = 1 - power2Out(r);
                smooth.setNaturalRotation(!reducedMotion, 0.25 * state.rotationSpeed);
              } else {
                state.rotationSpeed = 1;
                smooth.setNaturalRotation(!reducedMotion, 0.25);
              }
            },
          },
        });

        /* 2 · manifiesto ---------------------------------------- */
        gsap.timeline({
          scrollTrigger: {
            trigger: "#section-4",
            start: "top top",
            endTrigger: "#section-5",
            end: "bottom top",
            scrub: SCROLL.SCRUB,
            invalidateOnRefresh: true,
            onEnter: () => {
              state.section34.prevPos.copy(smooth.getCurrentPosition());
              state.section34.prevRot.copy(smooth.getCurrentRotation());
              state.section34.captured = true;
              smooth.setNaturalRotation(false);
            },
            onUpdate: (self) => {
              const i = self.progress;
              store.dom.manifesto?.(i);
              if (!state.section34.captured || heroActive()) return;

              const k = i < 0.15 || i > 0.85 ? 0.08 : 0.06;
              const l = power1InOut(i);
              // Una vuelta completa sobre X a lo largo del tramo.
              const targetRot = new Euler(
                MathUtils.lerp(r34s.x, r34e.x, l),
                r34s.y,
                r34s.z,
              );
              const p = MathUtils.clamp(i / 0.18, 0, 1);
              const pos = state.section34.prevPos
                .clone()
                .lerp(new Vector3(p34.x, p34.y, p34.z), p);
              const fromQ = new Quaternion().setFromEuler(state.section34.prevRot);
              const toQ = new Quaternion().setFromEuler(targetRot);
              const rot = new Euler().setFromQuaternion(
                new Quaternion().slerpQuaternions(fromQ, toQ, p),
              );

              smooth.setTargetPosition(pos.x, pos.y, pos.z);
              smooth.setTargetRotation(rot.x, rot.y, rot.z);
              smooth.setLerpFactors({ position: k, rotation: k });

              // El giro natural se desenrolla hasta cero.
              const t = power1InOut(Math.min(1.2 * i, 1));
              const current = smooth.normalize(smooth.getCurrentNaturalRotation());
              smooth.setTargetNaturalRotation(current + shortest(current, 0) * t);
            },
            onLeaveBack: () => {
              state.section34.captured = false;
              smooth.captureNaturalRotation(
                smooth.normalize(smooth.getCurrentNaturalRotation()),
              );
              smooth.setNaturalRotation(!reducedMotion, 0.25);
              smooth.setLerpFactors(LERP.NORMAL);
            },
          },
        });

        /* 3 · tramo fijado: anillo de palabras ----------------- */
        const ring = refs.wordRing;
        const stageBounds = [1 / 3, 2 / 3];
        const snapPoints = [0.2, 0.5, 0.8];

        const updateRing = (e: number) => {
          if (ring) {
            ring.position.set(0, 0, 8);
            ring.scale.setScalar(e < 0.001 ? 0 : 1);
            const step = Math.floor(3 * e);
            const local = (3 * e) % 1;
            const t = local < 0.3 ? power1Out(local / 0.3) : 1;
            ring.rotation.y = MathUtils.lerp(
              -Math.PI / 2 + step * (Math.PI / 2),
              -Math.PI / 2 + (step + 1) * (Math.PI / 2),
              t,
            );
          }

          let stage = 0;
          let local = 0;
          let visible = 0;
          if (e < stageBounds[0]) {
            stage = 0;
            visible = e > 0.05 ? 1 : 0;
            local = MathUtils.clamp((e - 0.05) / (stageBounds[0] - 0.05), 0, 1);
          } else if (e < stageBounds[1]) {
            stage = 1;
            visible = 1;
            local = MathUtils.clamp((e - stageBounds[0]) / (1 / 3), 0, 1);
          } else {
            stage = 2;
            visible = 1;
            local = MathUtils.clamp((e - stageBounds[1]) / (1 / 3), 0, 1);
          }
          state.wordRingProgress = e;
          store.dom.finalOverlay?.(stage, local, visible, state.section8Progress);
        };

        gsap.timeline({
          scrollTrigger: {
            trigger: "#section-4",
            endTrigger: "#section-8",
            start: "70% top",
            end: "bottom top",
            snap: {
              snapTo: (value) =>
                value > 0.8 ? value : gsap.utils.snap(snapPoints, value),
              delay: 0,
              duration: { min: 0.2, max: 0.6 },
              ease: "power1.inOut",
            },
            scrub: 1.5,
            pin: true,
            pinSpacing: false,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const r = self.progress;
              const l = power1InOut(r);
              if (!heroActive()) {
                smooth.setTargetPosition(
                  MathUtils.lerp(p5.x, p7.x, l),
                  mobileY(MathUtils.lerp(p5.y, p7.y, l)),
                  MathUtils.lerp(p5.z, p7.z, l),
                );
                smooth.setTargetRotation(
                  MathUtils.lerp(r6.x, r7.x, l),
                  MathUtils.lerp(r6.y, r7.y, l),
                  MathUtils.lerp(r6.z, r7.z, l),
                );
                smooth.setTargetNaturalRotation(0);
              }
              updateRing(r);
            },
          },
        });

        /* 4 · sección cinco: vuelco ----------------------------- */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#section-5",
              start: "top top",
              end: "bottom top",
              scrub: SCROLL.SCRUB,
              invalidateOnRefresh: true,
              onEnter: () => smooth.setLerpFactors({ position: 0.07, rotation: 0.05 }),
              onUpdate: (self) => {
                if (heroActive()) return;
                const r = self.progress;
                const k = r < 0.2 || r > 0.8 ? 0.07 : 0.05;
                const l = power1InOut(r);
                const fx = smooth.normalize(r34e.x);
                const fy = smooth.normalize(r34e.y);
                const fz = smooth.normalize(r34e.z);
                smooth.setTargetRotation(
                  smooth.normalize(fx + shortest(fx, smooth.normalize(r5.x)) * l),
                  smooth.normalize(fy + shortest(fy, smooth.normalize(r5.y)) * l),
                  smooth.normalize(fz + shortest(fz, smooth.normalize(r5.z)) * l),
                );
                smooth.setLerpFactors({ position: k, rotation: k });
                smooth.setTargetNaturalRotation(0);
              },
              onLeaveBack: () => smooth.setLerpFactors(LERP.NORMAL),
            },
          })
          .to(state, { dotsRotationY: -Math.PI / 6, ease: "power2.inOut" }, 0);

        /* 5 · sección seis: segundo vuelco ---------------------- */
        gsap.timeline({
          scrollTrigger: {
            trigger: "#section-6",
            start: "top top",
            end: "bottom top",
            scrub: SCROLL.SCRUB,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (heroActive()) return;
              const l = power1InOut(self.progress);
              smooth.setTargetPosition(p5.x, mobileY(p5.y), p5.z);
              smooth.setTargetRotation(
                MathUtils.lerp(r5.x, r6.x, l),
                MathUtils.lerp(r5.y, r6.y, l),
                MathUtils.lerp(r5.z, r6.z, l),
              );
              smooth.setTargetNaturalRotation(0);
            },
          },
        });

        /* 6 · cierre: la cámara cae ----------------------------- */
        gsap
          .timeline({
            scrollTrigger: {
              trigger: "#section-8",
              start: "top top",
              end: "bottom top",
              scrub: SCROLL.SCRUB,
              onUpdate: (self) => {
                state.section8Progress = self.progress;
                store.dom.finalOverlay?.(
                  Math.min(2, Math.floor(3 * state.wordRingProgress)),
                  1,
                  1,
                  self.progress,
                );
              },
            },
          })
          .to(state, { cameraY: -15, ease: "power1.inOut", duration: 0.3 }, 0)
          .to(state, { modelOpacity: 0, ease: "power2.in", duration: 0.5 }, 0);
      });

      // Lenis cambia la altura efectiva de la página al arrancar; se
      // vuelve a medir cuando avisa, y en todo caso al cabo de 1.5 s.
      let refreshed = false;
      const refresh = () => {
        if (refreshed) return;
        refreshed = true;
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event("resize"));
            window.setTimeout(() => ScrollTrigger.refresh(), 100);
          });
        });
      };
      window.addEventListener("lenis-initialized", refresh, { once: true });
      const refreshTimer = window.setTimeout(refresh, 1500);
      cleanups.push(() => {
        window.removeEventListener("lenis-initialized", refresh);
        window.clearTimeout(refreshTimer);
      });
    }

    if (store.ready) {
      setup();
    } else {
      store.onReady.add(setup);
      cleanups.push(() => store.onReady.delete(setup));
    }

    return () => {
      disposed = true;
      for (const fn of cleanups) fn();
      ctx?.revert();
    };
  }, [store, isMobile, reducedMotion]);
}
