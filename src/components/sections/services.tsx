"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ServiceMock } from "@/components/mocks/service-mocks";
import { SplitText } from "@/components/ui/letters";
import { Crest } from "@/components/ui/crest";
import { Watermark } from "@/components/ui/watermark";
import { useTranslations } from "@/lib/i18n/provider";
import {
  serviceAnchor,
  serviceBodyKey,
  serviceIds,
  serviceTitleKey,
} from "@/lib/services";

/**
 * Trabajos.
 *
 * Carrusel en coverflow con la mecánica del Lab 3D del portafolio: un
 * escenario con perspectiva de 1200px, las tarjetas apiladas en
 * posición absoluta y una transformada por tarjeta según su distancia a
 * la activa —desplazamiento lateral, profundidad, giro en Y y opacidad.
 *
 * Se puede avanzar arrastrando, con las flechas del teclado o con los
 * botones. La sección respira con `--section-y-wide`, que es el doble
 * del ritmo del resto de la página.
 */

const ROT_DESKTOP = 38;
const ROT_MOBILE = 32;
const DRAG_THRESHOLD = 60;

export function Services() {
  const t = useTranslations();
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const count = serviceIds.length;

  const go = useCallback(
    (delta: number) => {
      setActive((current) => (current + delta + count) % count);
    },
    [count],
  );

  // Coloca cada tarjeta según su distancia a la activa. Se escribe
  // directo al DOM: es una transformada por tarjeta y no hay razón para
  // que React vuelva a renderizar por ello.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    function layout() {
      if (!track) return;
      const cards = Array.from(
        track.querySelectorAll<HTMLElement>("[data-card]"),
      );
      const mobile = window.innerWidth <= 768;
      const rot = mobile ? ROT_MOBILE : ROT_DESKTOP;
      const visible = mobile ? 1 : 2;
      const shift = mobile ? 160 : 230;

      cards.forEach((card, i) => {
        let off = i - active;
        if (off > count / 2) off -= count;
        if (off < -count / 2) off += count;

        const abs = Math.abs(off);
        const dir = Math.sign(off);

        if (abs > visible) {
          card.style.transform = `translateX(${dir * 380}px) translateZ(-400px) rotateY(${-dir * rot}deg)`;
          card.style.opacity = "0";
          card.style.pointerEvents = "none";
        } else if (abs === 0) {
          card.style.transform = "translateX(0px) translateZ(60px) rotateY(0deg)";
          card.style.opacity = "1";
          card.style.pointerEvents = "auto";
        } else {
          card.style.transform = `translateX(${dir * shift}px) translateZ(-${abs * 120}px) rotateY(${-dir * rot}deg)`;
          card.style.opacity = (1 - abs * 0.35).toFixed(2);
          card.style.pointerEvents = "auto";
        }

        card.style.zIndex = String(count - abs);
        card.dataset.active = String(abs === 0);
      });
    }

    layout();
    window.addEventListener("resize", layout, { passive: true });
    return () => window.removeEventListener("resize", layout);
  }, [active, count]);

  // Arrastre horizontal.
  const dragStart = useRef<number | null>(null);

  const onPointerDown = useCallback((event: React.PointerEvent) => {
    dragStart.current = event.clientX;
  }, []);

  const onPointerUp = useCallback(
    (event: React.PointerEvent) => {
      const start = dragStart.current;
      dragStart.current = null;
      if (start === null) return;
      const delta = event.clientX - start;
      if (Math.abs(delta) < DRAG_THRESHOLD) return;
      go(delta < 0 ? 1 : -1);
    },
    [go],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
    },
    [go],
  );

  return (
    <section
      id="servicios"
      data-stack
      className="stack stack-3 stack--pad-wide"
      style={{
        ["--lit-x" as string]: "86%",
        ["--lit-y" as string]: "26%",
        ["--lit-x2" as string]: "8%",
        ["--lit-y2" as string]: "84%",
      }}
    >
      <Crest shape="sierra" />
      <Watermark>{t("marks.services")}</Watermark>

      <div className="u-shell">
        <p className="t-eyebrow" data-drift="6">
          {t("services.eyebrow")}
        </p>
        <div className="mt-5 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="t-h2 max-w-[14ch]" data-stagger data-reveal data-drift="12">
            <SplitText text={t("services.title")} reveal />
          </h2>
          <p className="t-lead mt-5 lg:mt-0 lg:max-w-[34ch] lg:text-right" data-drift="8">
            {t("services.lead")}
          </p>
        </div>
      </div>

      <div className="u-shell mt-[clamp(3rem,8vh,6rem)]">
        <div
          className="deck"
          role="group"
          aria-label={t("services.title")}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
        >
          <div ref={trackRef} className="deck__track">
            {/*
              Las tarjetas van sólidas y sin refracción. Una tarjeta de
              vidrio con más vidrio dentro difumina lo ya difuminado y el
              producto acaba viéndose borroso.
            */}
            {serviceIds.map((id, index) => (
              <article
                key={id}
                data-card
                id={serviceAnchor(id)}
                onClick={() => setActive(index)}
                className="deck__card lg lg--solid flex flex-col"
              >
                <div className="min-h-0 flex-1 p-3">
                  <ServiceMock id={id} />
                </div>
                <div className="border-t border-[var(--border-subtle)] p-5">
                  <h3
                    className="text-[1.0625rem] leading-tight text-ink"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 700,
                    }}
                  >
                    {t(serviceTitleKey(id))}
                  </h3>
                  <p className="mt-2 text-[0.8125rem] leading-snug text-muted">
                    {t(serviceBodyKey(id))}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="deck__nav mt-[clamp(2rem,5vh,3.5rem)]">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label={t("nav.prev")}
            className="deck__btn lg lg--pill lg-press"
          >
            <Arrow direction="left" />
          </button>

          <span className="px-3 text-[0.75rem] text-faint">
            {t("services.hint")}
          </span>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label={t("nav.next")}
            className="deck__btn lg lg--pill lg-press"
          >
            <Arrow direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ transform: direction === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M5 12h14" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
