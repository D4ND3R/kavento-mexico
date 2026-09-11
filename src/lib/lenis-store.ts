import type Lenis from "lenis";

/**
 * Punto de encuentro entre Lenis y quien lo necesite (el medidor de
 * scroll, la coreografía 3D). Lenis se crea en el layout y los
 * consumidores viven en la página, así que hace falta un sitio neutro
 * donde dejarlo. Es un almacén mínimo con suscripción, para poder
 * consumirlo con useSyncExternalStore sin desajustes de hidratación.
 */
let current: Lenis | null = null;
const listeners = new Set<() => void>();

export function setLenis(instance: Lenis | null) {
  current = instance;
  for (const listener of listeners) listener();
}

export function getLenis(): Lenis | null {
  return current;
}

export function subscribeLenis(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
