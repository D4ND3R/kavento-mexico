"use client";

import { useEffect } from "react";

/* ==================================================================
   MOTOR DE SCROLL

   Un solo requestAnimationFrame para toda la página, con la fase de
   lectura (getBoundingClientRect) separada de la de escritura (style),
   para no provocar layout thrashing. Arquitectura del portafolio de
   Leonardo Díaz Delgado.

   De aquí salen cinco cosas:

   1. Apilado    secciones con position:sticky y z-index creciente;
                 updatePins() ancla en `vh - alto` las que no caben.
   2. Cortinas   velo negro por sección, cuya opacidad sube conforme la
                 siguiente la cubre.
   3. Navbar     se colapsa al bajar y se abre al subir o al detenerse.
   4. Abanico    --spread, que abre las tarjetas de reseñas.
   5. Cortina    --curtain, que abre el campo de fondo del hero.
   ================================================================== */

/** Suavizado tipo smoothstep. */
function ease(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** Opacidad máxima del velo. */
const SHADE_MAX = 0.55;

/**
 * La cortina no arranca hasta que la sección de encima ha subido un
 * 22% de la pantalla, y tarda 1.6 pantallas en cerrar del todo. Antes
 * cubría en una sola pantalla y el cruce pasaba demasiado rápido para
 * leerse.
 */
const CURTAIN_START = 0.22;
const CURTAIN_SPAN = 1.6;

/** Umbral y espera de la navbar, del portafolio. */
const NAV_DELTA = 8;
const NAV_IDLE = 700;
const NAV_TOP = 60;

export function useScrollStack() {
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stack]"),
    );
    if (sections.length < 2) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const navPill = document.querySelector<HTMLElement>("[data-nav-pill]");
    const fans = Array.from(document.querySelectorAll<HTMLElement>("[data-fan]"));

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
        section.style.top = `${Math.min(0, vh - section.offsetHeight)}px`;
      }
    }

    /* --- entradas escalonadas ------------------------------------ */
    // Van por IntersectionObserver y no por el bucle: solo cambian una
    // vez y no tiene sentido recalcularlas en cada cuadro.
    const staggerNodes = Array.from(
      document.querySelectorAll<HTMLElement>("[data-stagger]"),
    );

    let observerFired = false;

    const staggerObserver = new IntersectionObserver(
      (entries) => {
        observerFired = true;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.inview = "true";
            staggerObserver.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
    );

    for (const node of staggerNodes) staggerObserver.observe(node);

    // Red de seguridad: si el observador no entrega ni una sola vez —lo
    // que pasa en navegadores que no lo componen— el contenido quedaría
    // invisible para siempre. Pasados dos segundos sin señales, se
    // revela todo. Solo actúa cuando el observador está roto: si
    // funcionó, no toca nada.
    const rescueTimer = window.setTimeout(() => {
      if (observerFired) return;
      for (const node of staggerNodes) node.dataset.inview = "true";
    }, 2000);

    /* --- bucle único --------------------------------------------- */
    let queued = false;
    let disposed = false;
    let lastY = window.scrollY;
    let idleTimer = 0;

    const tops = new Array<number>(sections.length);

    function expandNav() {
      if (navPill) navPill.dataset.shrunk = "false";
    }

    function frame() {
      queued = false;
      if (disposed) return;

      const vh = window.innerHeight;
      const y = window.scrollY;

      // LECTURA
      for (let i = 0; i < sections.length; i += 1) {
        tops[i] = sections[i].getBoundingClientRect().top;
      }
      const fanTops = fans.map((fan) => fan.getBoundingClientRect().top);

      // ESCRITURA
      for (let i = 0; i < shades.length; i += 1) {
        const entered = (vh - tops[i + 1]) / vh;
        const progress = ease((entered - CURTAIN_START) / CURTAIN_SPAN);
        shades[i].style.opacity = (SHADE_MAX * progress).toFixed(3);
      }

      // El hero retrocede mientras lo tapan.
      const recede = sections[0].querySelector<HTMLElement>("[data-recede]");
      if (recede) {
        const height = sections[0].offsetHeight || vh;
        const p = Math.min(Math.max(-tops[0] / (height * 0.85), 0), 1);
        const eased = 1 - Math.pow(1 - p, 3);
        recede.style.transform = `scale(${(1 - eased * 0.1).toFixed(4)})`;
        recede.style.opacity = (1 - eased * 0.35).toFixed(3);
      }

      // Abanico de reseñas.
      for (let i = 0; i < fans.length; i += 1) {
        const spread = ease((vh * 0.85 - fanTops[i]) / (vh * 0.7));
        fans[i].style.setProperty("--spread", spread.toFixed(3));
      }

      // Campo de fondo del hero.
      const curtain = Math.min(Math.max(-tops[0] / vh, 0), 1);
      document.documentElement.style.setProperty(
        "--curtain",
        curtain.toFixed(4),
      );

      // Navbar: se colapsa al bajar, se abre al subir, al detenerse o
      // al volver cerca del tope.
      if (navPill) {
        const diff = y - lastY;
        if (y < NAV_TOP) {
          expandNav();
        } else if (diff > NAV_DELTA) {
          navPill.dataset.shrunk = "true";
        } else if (diff < -NAV_DELTA) {
          expandNav();
        }

        window.clearTimeout(idleTimer);
        idleTimer = window.setTimeout(expandNav, NAV_IDLE);
      }

      lastY = y;
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
      // Se conserva el apilado (es estructura, no adorno) pero las
      // cortinas y el abanico se quedan en su estado final.
      document.documentElement.style.setProperty("--curtain", "1");
      for (const fan of fans) fan.style.setProperty("--spread", "1");
      window.addEventListener("resize", updatePins, { passive: true });
      return () => {
        window.clearTimeout(rescueTimer);
        window.removeEventListener("resize", updatePins);
        staggerObserver.disconnect();
        shades.forEach((shade) => shade.remove());
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
      window.clearTimeout(idleTimer);
      window.clearTimeout(rescueTimer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      staggerObserver.disconnect();
      shades.forEach((shade) => shade.remove());
      for (const section of sections) section.style.top = "";
    };
  }, []);
}
