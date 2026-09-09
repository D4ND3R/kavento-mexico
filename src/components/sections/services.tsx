"use client";

import { useEffect, useRef, useState } from "react";

import { ServiceMock } from "@/components/mocks/service-mocks";
import { useTranslations } from "@/lib/i18n/provider";
import {
  serviceAnchor,
  serviceBodyKey,
  serviceIds,
  serviceTitleKey,
} from "@/lib/services";

/**
 * Servicios.
 *
 * Un bloque alto con un visor fijo dentro: al bajar, el carril de
 * paneles se desplaza en horizontal. Es la mecánica de
 * `.column-scroll` de tech-ish, con el recorrido calculado a mano en
 * lugar de con ScrollTrigger.
 *
 * El texto viaja junto a su maqueta dentro del mismo panel, así que el
 * orden del DOM es el mismo que se lee y no hay dos columnas que
 * sincronizar. En móvil el carril se vuelve una columna normal.
 */
export function Services() {
  const t = useTranslations();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const [index, setIndex] = useState(0);
  const count = serviceIds.length;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const track = trackRef.current;
    if (!scroller || !track) return;

    const desktop = window.matchMedia("(min-width: 1024px)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    let queued = false;
    let disposed = false;
    let lastIndex = -1;

    function frame() {
      queued = false;
      if (disposed || !scroller || !track) return;

      if (!desktop.matches) {
        track.style.removeProperty("--track-x");
        return;
      }

      // LECTURA
      const rect = scroller.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;

      // ESCRITURA
      const progress =
        travel > 0 ? Math.min(Math.max(-rect.top / travel, 0), 1) : 0;

      // El carril mide count * 100%; avanzar un panel son 100/count %.
      track.style.setProperty(
        "--track-x",
        `${(-progress * (count - 1) * 100) / count}%`,
      );

      const next = Math.round(progress * (count - 1));
      if (next !== lastIndex) {
        lastIndex = next;
        setIndex(next);
      }
    }

    function schedule() {
      if (queued || disposed) return;
      queued = true;
      requestAnimationFrame(frame);
    }

    if (reduced.matches) {
      // Sin movimiento no hay desplazamiento horizontal: los paneles
      // se leen apilados, que es el estado final legible.
      track.style.removeProperty("--track-x");
      return;
    }

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    desktop.addEventListener("change", schedule);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      desktop.removeEventListener("change", schedule);
    };
  }, [count]);

  return (
    <section
      id="servicios"
      data-stack
      className="stack stack-3 pb-20 pt-24 sm:pt-28"
      style={{ ["--lit-x" as string]: "86%", ["--lit-y" as string]: "36%", ["--lit-x2" as string]: "8%", ["--lit-y2" as string]: "88%" }}
    >
      <div className="u-shell">
        <h2 className="t-h2 max-w-[16ch]">{t("services.title")}</h2>
        <p className="t-lead mt-5">{t("services.lead")}</p>
      </div>

      <div
        ref={scrollerRef}
        className="scroller mt-14 lg:mt-0"
        style={{ ["--panels" as string]: count }}
      >
        <div className="scroller__viewport">
          <div className="u-shell w-full">
            <ol ref={trackRef} className="scroller__track">
              {serviceIds.map((id) => (
                <li
                  key={id}
                  id={serviceAnchor(id)}
                  className="scroller__panel"
                >
                  <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
                    <div>
                      <h3 className="t-h3">{t(serviceTitleKey(id))}</h3>
                      <p className="t-body mt-5 max-w-[38ch]">
                        {t(serviceBodyKey(id))}
                      </p>
                    </div>

                    <div className="aspect-[4/3] w-full sm:aspect-[5/4] lg:aspect-square lg:max-h-[62svh] lg:justify-self-end">
                      <ServiceMock id={id} />
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            <div
              className="scroller__rail mt-10 hidden lg:flex"
              role="presentation"
            >
              {serviceIds.map((id, i) => (
                <span key={id} data-on={i === index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
