"use client";

import { useEffect, useRef } from "react";

import { useTranslations } from "@/lib/i18n/provider";

const TICKS = 101;

/**
 * Medidor de scroll de altitude101: 101 rayas a la derecha de la
 * pantalla (una más larga cada diez) con la cifra "000 %" → "101 %"
 * que baja pegada al avance. Las rayas que el scroll ya pasó se
 * encienden en el naranja de la marca, y las tres o cuatro más
 * cercanas al punto actual se estiran como si un dedo las apretara.
 *
 * Se lee la posición real de la ventana en cada cuadro, no el evento
 * de Lenis: el evento llegaba a rachas y el medidor daba saltos. La
 * cifra y las rayas persiguen el valor con un lerp corto, así se ven
 * fluir mientras se desplaza y no solo al parar. El bucle se duerme en
 * cuanto el medidor alcanza su objetivo y despierta con el siguiente
 * scroll, para no gastar cuadros en una página quieta.
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
    if (!ticks.length) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let frame = 0;
    let shown = -1;
    let awake = false;

    function target() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }

    function paint(p: number) {
      const passed = (1 - p) * 100;
      const n = Math.min(101, Math.max(0, Math.round(101 * p)));

      if (label.current) label.current.style.transform = `translateY(${-(100 * p)}%)`;
      if (value.current) value.current.textContent = `${String(n).padStart(3, "0")}%`;

      for (let i = 0; i < ticks.length; i += 1) {
        const tick = ticks[i];
        const near = Math.abs(i - passed);
        const stretch =
          i % 10 === 0 ? 1 : near <= 3.5 ? 1 + 1.2 * Math.pow(1 - near / 3.5, 2) : 1;
        tick.style.transform = `scaleX(${stretch.toFixed(3)})`;
        tick.dataset.lit = i >= passed ? "true" : "false";
      }
    }

    function loop() {
      const goal = target();
      if (shown < 0 || reduced) shown = goal;
      else shown += (goal - shown) * 0.18;

      if (Math.abs(goal - shown) < 0.0004) {
        shown = goal;
        paint(shown);
        awake = false;
        return;
      }
      paint(shown);
      frame = requestAnimationFrame(loop);
    }

    function wake() {
      if (awake) return;
      awake = true;
      frame = requestAnimationFrame(loop);
    }

    wake();
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake, { passive: true });

    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
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
          className={
            i % 10 === 0 ? "scroll-gauge__tick scroll-gauge__tick--major" : "scroll-gauge__tick"
          }
        />
      ))}
    </div>
  );
}
