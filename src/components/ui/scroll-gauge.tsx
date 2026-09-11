"use client";

import { useEffect, useRef } from "react";

import { getLenis, subscribeLenis } from "@/lib/lenis-store";
import { useTranslations } from "@/lib/i18n/provider";

const TICKS = 101;

/**
 * Medidor de scroll de altitude101: 101 rayas a la derecha de la
 * pantalla (una más larga cada diez) con la cifra "000 %" → "101 %"
 * que baja pegada al avance. Las rayas que el scroll ya pasó se
 * encienden en el naranja de la marca, y las tres o cuatro más
 * cercanas al punto actual se estiran como si un dedo las apretara.
 *
 * Todo el movimiento va por DOM directo desde el evento de Lenis; no
 * hay estado de React en el camino porque cambia en cada píxel.
 */
export function ScrollGauge() {
  const t = useTranslations();
  const root = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const value = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ticks = Array.from(
      root.current?.querySelectorAll<HTMLElement>("[data-tick]") ?? [],
    );

    let frame = 0;

    function paint(progress: number) {
      const p = Math.min(1, Math.max(0, progress));
      const passed = (1 - p) * 100;
      const n = Math.min(101, Math.max(0, Math.round(101 * p)));

      if (label.current) label.current.style.transform = `translateY(${-(100 * p)}%)`;
      if (value.current) value.current.textContent = `${String(n).padStart(3, "0")}%`;

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        const near = Math.abs(i - passed);
        const stretch = i % 10 === 0 ? 1 : near <= 3.5 ? 1 + 1.2 * Math.pow(1 - near / 3.5, 2) : 1;
        tick.style.transform = `scaleX(${stretch.toFixed(3)})`;
        tick.dataset.lit = i >= passed ? "true" : "false";
      }
    }

    function fallbackProgress() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? window.scrollY / max : 0;
    }

    function schedule(progress: number) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => paint(progress));
    }

    let detach = () => {};

    function attach() {
      detach();
      const lenis = getLenis();
      if (lenis) {
        const onScroll = () => schedule(lenis.limit === 0 ? 0 : lenis.progress);
        lenis.on("scroll", onScroll);
        onScroll();
        detach = () => lenis.off("scroll", onScroll);
      } else {
        // Sin Lenis (prefers-reduced-motion): scroll nativo.
        const onScroll = () => schedule(fallbackProgress());
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        detach = () => window.removeEventListener("scroll", onScroll);
      }
    }

    attach();
    const unsubscribe = subscribeLenis(attach);

    return () => {
      unsubscribe();
      detach();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={root}
      className="scroll-gauge"
      role="progressbar"
      aria-label={t("hero.gauge")}
      aria-valuemin={0}
      aria-valuemax={101}
    >
      <div ref={label} className="scroll-gauge__label">
        <span ref={value}>000%</span>
      </div>
      {Array.from({ length: TICKS }).map((_, i) => (
        <span
          key={i}
          data-tick
          data-lit="false"
          className={i % 10 === 0 ? "scroll-gauge__tick scroll-gauge__tick--major" : "scroll-gauge__tick"}
        />
      ))}
    </div>
  );
}
