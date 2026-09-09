"use client";

import { useEffect, useRef, type RefObject } from "react";

import { useReducedMotion } from "./hooks";

/**
 * Convierte el recorrido de un elemento por la pantalla en un avance de 0 a 1.
 *
 * El valor vive en una ref, no en estado: la escena 3D lo lee dentro de
 * useFrame y React nunca vuelve a renderizar por mover el scroll.
 *
 * `scrub: 1` amortigua un segundo el seguimiento, que es lo que hace que
 * el modelo se sienta atado a la barra de scroll en vez de dar saltos.
 *
 * GSAP se importa dentro del efecto, no arriba del archivo: así no entra
 * en el bundle inicial y solo se descarga cuando de verdad hay un panel
 * de servicio en la página. `gsap.context` se encarga de matar el tween
 * y su ScrollTrigger al desmontar.
 *
 * Con prefers-reduced-motion nunca se carga ni se crea nada: el avance
 * queda en 1, que en todas las escenas es el estado ensamblado y quieto.
 */
export function useScrollProgress(
  targetRef: RefObject<HTMLElement | null>,
  onActivate?: () => void,
): RefObject<number> {
  const progress = useRef(0);
  const reducedMotion = useReducedMotion();

  // El callback vive en una ref para que cambiarlo no reconstruya el
  // ScrollTrigger en cada render.
  const activateRef = useRef(onActivate);
  useEffect(() => {
    activateRef.current = onActivate;
  }, [onActivate]);

  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    if (reducedMotion) {
      progress.current = 1;
      return;
    }

    let cancelled = false;
    let context: { revert: () => void } | undefined;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      context = gsap.context(() => {
        const proxy = { value: 0 };

        gsap.to(proxy, {
          value: 1,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            end: "bottom 18%",
            scrub: 1,
          },
          onUpdate: () => {
            progress.current = proxy.value;
          },
        });

        ScrollTrigger.create({
          trigger: element,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => activateRef.current?.(),
          onEnterBack: () => activateRef.current?.(),
        });
      }, element);
    })();

    return () => {
      cancelled = true;
      context?.revert();
    };
  }, [targetRef, reducedMotion]);

  return progress;
}
