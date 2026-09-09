"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Scroll suave con Lenis, como en palmo.co.in.
 *
 * Lenis desplaza la ventana de verdad (no mueve un contenedor con
 * transform), así que `getBoundingClientRect` sigue devolviendo lo
 * correcto y el motor de apilado no necesita saber que existe: los
 * eventos `scroll` nativos se siguen disparando igual.
 *
 * `scroll-behavior: smooth` de CSS pelea con Lenis —se pisan los dos
 * intentando animar el mismo scroll— así que se apaga mientras Lenis
 * está activo y se vuelve a poner al desmontar.
 *
 * Con prefers-reduced-motion no se instancia: el scroll con inercia es
 * justo lo que marea a quien pide menos movimiento.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      // Un poco más de inercia que el valor por defecto, sin llegar a
      // sentirse resbaloso.
      lerp: 0.085,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.6,
      // El arrastre del carrusel y los campos del formulario no deben
      // pelear con el scroll suave.
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // Los enlaces de ancla los maneja Lenis para que el salto también
    // sea suave y termine donde debe.
    function onClick(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -96, duration: 1.4 });
    }

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
