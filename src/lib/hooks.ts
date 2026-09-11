"use client";

import { useSyncExternalStore } from "react";

/* ------------------------------------------------------------------
   Suscripciones a APIs del navegador vía useSyncExternalStore.
   Se prefiere sobre useState + useEffect porque no provoca renders
   en cascada y funciona con SSR sin desajustes de hidratación.
   ------------------------------------------------------------------ */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * true si la persona pidió menos movimiento en su sistema.
 * Quien lo consume debe renderizar el estado final, no animar.
 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** true en cuanto la página se despega del tope. Alimenta el vidrio de la navbar. */
export function useHasScrolled(threshold = 12): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

function subscribeCoarsePointer(onChange: () => void) {
  const query = window.matchMedia("(pointer: coarse)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** true en dispositivos táctiles: se usa para bajar la carga de las escenas 3D. */
export function useCoarsePointer(): boolean {
  return useSyncExternalStore(
    subscribeCoarsePointer,
    () => window.matchMedia("(pointer: coarse)").matches,
    () => false,
  );
}

function subscribeNarrow(onChange: () => void) {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * true por debajo de 768px. La escena 3D baja de escala y desactiva el
 * arrastre en pantallas estrechas; el corte es el `md` de Tailwind.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeNarrow,
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}
