"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";

import { setLenis } from "@/lib/lenis-store";

gsap.registerPlugin(ScrollTrigger);

/**
 * Scroll suave con Lenis, con la configuración de altitude101:
 * 1.2 s de viaje con curva exponencial, en vez de un lerp por cuadro.
 *
 * Lenis desplaza la ventana de verdad (no mueve un contenedor con
 * transform), así que `getBoundingClientRect` sigue devolviendo lo
 * correcto y el motor de apilado no necesita saber que existe.
 *
 * Quien sí necesita saberlo es ScrollTrigger: se le avisa en cada
 * evento de scroll de Lenis, y el reloj de Lenis lo lleva el ticker de
 * GSAP para que las dos cosas avancen en el mismo cuadro. Es el mismo
 * emparejamiento que hace altitude101 (`lenis.raf` dentro de
 * `gsap.ticker`, `lagSmoothing(0)`).
 *
 * `scroll-behavior: smooth` de CSS pelea con Lenis —se pisan los dos
 * intentando animar el mismo scroll— así que se apaga mientras Lenis
 * está activo y se vuelve a poner al desmontar.
 *
 * Con prefers-reduced-motion no se instancia: el scroll con inercia es
 * justo lo que marea a quien pide menos movimiento. ScrollTrigger sigue
 * funcionando con el scroll nativo.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.dispatchEvent(new Event("lenis-initialized"));
      return;
    }

    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";

    const lenis = new Lenis({
      autoRaf: false,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      // El arrastre del carrusel y los campos del formulario no deben
      // pelear con el scroll suave.
      prevent: (node) => node.closest("[data-lenis-prevent]") !== null,
    });

    lenis.on("scroll", ScrollTrigger.update);

    function tick(time: number) {
      lenis.raf(time * 1000);
    }
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    setLenis(lenis);

    // La coreografía 3D espera a este aviso para medir la página:
    // hasta que Lenis no está listo las alturas no son definitivas.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("lenis-initialized"));
        ScrollTrigger.refresh();
      });
    });

    // Los enlaces de ancla los maneja Lenis para que el salto también
    // sea suave y termine donde debe.
    //
    // No se le pasa el elemento a Lenis: para medirlo usaría
    // getBoundingClientRect, y las secciones apiladas van en
    // `position: sticky`. Una sección ya fijada arriba mide top = 0 (o
    // negativo) aunque en el documento esté mucho más abajo, así que el
    // salto se quedaba corto o no subía. Se mide con el sticky apagado
    // un instante: el cambio y la lectura ocurren en el mismo tick, sin
    // pintado en medio, así que no parpadea nada.
    function documentTop(element: HTMLElement): number {
      const previous = element.style.position;
      element.style.position = "static";
      const top = element.getBoundingClientRect().top + window.scrollY;
      element.style.position = previous;
      return Math.round(top);
    }

    function onClick(event: MouseEvent) {
      const link = (event.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!link) return;

      const id = link.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.querySelector<HTMLElement>(id);
      if (!target) return;

      event.preventDefault();
      // Sin margen: las secciones llevan su propio aire arriba (y la
      // cresta), así que aterrizar justo en su borde deja el título a
      // la vista con la navbar encima sin taparlo.
      lenis.scrollTo(id === "#top" ? 0 : documentTop(target), {
        duration: 1.4,
      });
    }

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.off("scroll", ScrollTrigger.update);
      setLenis(null);
      lenis.destroy();
      root.style.scrollBehavior = previousBehavior;
    };
  }, []);

  return null;
}
