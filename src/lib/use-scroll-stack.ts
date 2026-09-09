"use client";

import { useEffect } from "react";

/* ==================================================================
   MOTOR DE APILADO ("baraja de cartas") Y CORTINAS

   Puerto del sistema del portafolio de Leonardo Díaz Delgado, con la
   misma arquitectura:

   - Las secciones se fijan con `position: sticky` y una escalera de
     z-index creciente, así cada una se desliza encima de la anterior.
   - `updatePins()` calcula el `top` de fijado: si la sección es más
     alta que el viewport se ancla en `vh - alto` (negativo), de modo
     que el visitante alcance a leerla completa antes de que quede
     clavada y la siguiente empiece a taparla.
   - A cada sección se le inyecta una cortina negra cuya opacidad sube
     conforme la sección siguiente la cubre. Sin esto, la carta de
     abajo se ve igual de brillante que la de encima y el apilado no
     se lee.
   - Todo el trabajo por cuadro pasa por un solo rAF que separa la fase
     de lectura (getBoundingClientRect) de la de escritura (style),
     para no provocar layout thrashing.

   Se evita `filter: blur()` sobre contenedores del tamaño de la
   pantalla: colapsa la GPU. Las cortinas son divs con opacidad plana.
   ================================================================== */

/** Suavizado tipo smoothstep, igual que el original. */
function ease(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

const SHADE_MAX = 0.5;

export function useScrollStack() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stack]"),
    );
    if (sections.length < 2) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    /* --- cortinas ------------------------------------------------ */
    // La última sección no necesita cortina: nada la cubre.
    const shades = sections.slice(0, -1).map((section) => {
      const shade = document.createElement("div");
      shade.setAttribute("aria-hidden", "true");
      shade.style.cssText =
        "position:absolute;inset:0;background:#000;opacity:0;pointer-events:none;z-index:60;";
      section.appendChild(shade);
      return shade;
    });

    /* --- fijado -------------------------------------------------- */
    function updatePins() {
      const vh = window.innerHeight;
      for (const section of sections) {
        // La primera cae siempre a top:0; las demás pueden ser más
        // altas que la pantalla y se anclan por su base.
        section.style.top = `${Math.min(0, vh - section.offsetHeight)}px`;
      }
    }

    /* --- bucle único --------------------------------------------- */
    let queued = false;
    let disposed = false;

    // Fase de lectura: se recogen todas las medidas antes de escribir.
    const tops = new Array<number>(sections.length);

    function frame() {
      queued = false;
      if (disposed) return;

      const vh = window.innerHeight;

      // LECTURA
      for (let i = 0; i < sections.length; i += 1) {
        tops[i] = sections[i].getBoundingClientRect().top;
      }

      // ESCRITURA
      for (let i = 0; i < shades.length; i += 1) {
        // Cuánto ha subido la sección de encima por la pantalla.
        const progress = ease((vh - tops[i + 1]) / vh);
        shades[i].style.opacity = (SHADE_MAX * progress).toFixed(3);
      }

      // El hero retrocede mientras lo tapan: no se queda plano detrás.
      const recede = sections[0].querySelector<HTMLElement>("[data-recede]");
      if (recede) {
        const height = sections[0].offsetHeight || vh;
        const p = Math.min(Math.max(-tops[0] / (height * 0.8), 0), 1);
        const eased = 1 - Math.pow(1 - p, 3);
        recede.style.transform = `scale(${(1 - eased * 0.1).toFixed(4)})`;
        recede.style.opacity = (1 - eased * 0.35).toFixed(3);
      }

      // Avance de la cortina del campo de fondo, expuesto a CSS.
      const curtain = Math.min(Math.max(-tops[0] / (window.innerHeight || 1), 0), 1);
      document.documentElement.style.setProperty(
        "--curtain",
        curtain.toFixed(4),
      );
    }

    function schedule() {
      if (queued || disposed) return;
      queued = true;
      requestAnimationFrame(frame);
    }

    function onResize() {
      updatePins();
      schedule();
    }

    updatePins();

    if (prefersReduced) {
      // Sin movimiento: se deja el apilado (es estructura, no adorno)
      // pero las cortinas y el retroceso se quedan en su estado final.
      document.documentElement.style.setProperty("--curtain", "1");
      window.addEventListener("resize", updatePins, { passive: true });
      return () => {
        window.removeEventListener("resize", updatePins);
        shades.forEach((s) => s.remove());
      };
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    // Las tipografías y las imágenes cambian alturas al terminar de
    // cargar: hay que recalcular el fijado.
    window.addEventListener("load", onResize);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      shades.forEach((shade) => shade.remove());
      for (const section of sections) section.style.top = "";
    };
  }, []);
}
