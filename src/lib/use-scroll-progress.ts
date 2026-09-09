"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type RefObject } from "react";

import { useReducedMotion } from "./hooks";

// El registro toca el DOM: solo en el cliente.
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP, ScrollTrigger);
}

/**
 * Convierte el recorrido de un elemento por la pantalla en un avance de 0 a 1.
 *
 * El valor vive en una ref, no en estado: la escena 3D lo lee dentro de
 * useFrame y React nunca vuelve a renderizar por mover el scroll.
 *
 * `scrub: 1` amortigua un segundo el seguimiento, que es lo que hace que
 * el modelo se sienta atado a la barra de scroll en vez de dar saltos.
 *
 * Con prefers-reduced-motion no se crea el ScrollTrigger: el avance queda
 * en 1, que en todas las escenas es el estado ensamblado y quieto.
 */
export function useScrollProgress(
  targetRef: RefObject<HTMLElement | null>,
  onActivate?: (active: boolean) => void,
): RefObject<number> {
  const progress = useRef(0);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      const element = targetRef.current;
      if (!element) return;

      if (reducedMotion) {
        progress.current = 1;
        return;
      }

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

      if (onActivate) {
        ScrollTrigger.create({
          trigger: element,
          start: "top 55%",
          end: "bottom 45%",
          onEnter: () => onActivate(true),
          onEnterBack: () => onActivate(true),
        });
      }
    },
    { dependencies: [reducedMotion], scope: targetRef },
  );

  return progress;
}
