"use client";

import { useRef, useState } from "react";

import { ServiceScene } from "@/components/three/lazy";
import { useTranslations } from "@/lib/i18n/provider";
import {
  serviceAnchor,
  serviceBodyKey,
  serviceIds,
  serviceTitleKey,
  type ServiceId,
} from "@/lib/services";
import { useScrollProgress } from "@/lib/use-scroll-progress";

/**
 * Distancia de cámara por servicio. Sale del volumen que ocupa cada
 * modelo cuando está completamente abierto: con FOV vertical de 42
 * grados y encuadre cuadrado, el lado visible mide 0.767 por la
 * distancia, así que un modelo más ancho necesita más cámara.
 */
const CAMERA_Z: Record<ServiceId, number> = {
  web: 5.6,
  automation: 7.2,
  software: 6.2,
  whatsapp: 6.8,
  ai: 7.0,
};

export function Services() {
  const t = useTranslations();
  const [active, setActive] = useState(0);

  return (
    <section id="servicios" className="u-section relative">
      <div className="u-shell">
        <h2 className="t-h2">{t("services.title")}</h2>
        <p className="t-lead mt-5">{t("services.lead")}</p>
      </div>

      <div className="u-shell mt-16 lg:mt-24 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <ServiceRail active={active} />

        <div>
          {serviceIds.map((id, index) => (
            <ServicePanel
              key={id}
              id={id}
              index={index}
              onActive={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Índice lateral. Marca en qué servicio va la lectura y permite saltar a
 * cualquiera: es información de posición, no decoración. Sin numerar
 * 01/02/03 porque los servicios no son una secuencia.
 */
function ServiceRail({ active }: { active: number }) {
  const t = useTranslations();

  return (
    <nav
      aria-label={t("services.railLabel")}
      className="hidden lg:sticky lg:top-[42vh] lg:block lg:self-start"
    >
      <ul className="flex flex-col gap-1">
        {serviceIds.map((id, index) => {
          const current = index === active;
          return (
            <li key={id}>
              <a
                href={`#${serviceAnchor(id)}`}
                aria-current={current ? "true" : undefined}
                className={[
                  "flex items-center gap-3 py-2 text-[0.8125rem] leading-tight",
                  "transition-colors duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
                  current ? "text-ink" : "text-faint hover:text-muted",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="h-px shrink-0 transition-all duration-[var(--dur-base)] ease-[var(--ease-out-expo)]"
                  style={{
                    width: current ? "2rem" : "1rem",
                    background: current
                      ? "var(--accent-from)"
                      : "var(--border-strong)",
                  }}
                />
                {t(serviceTitleKey(id))}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ServicePanel({
  id,
  index,
  onActive,
}: {
  id: ServiceId;
  index: number;
  onActive: () => void;
}) {
  const t = useTranslations();
  const panelRef = useRef<HTMLElement>(null);
  const progress = useScrollProgress(panelRef, onActive);

  // Se alterna el lado del modelo para que los cinco paneles no caigan
  // exactamente en el mismo ritmo visual.
  const sceneFirst = index % 2 === 1;

  return (
    <article
      ref={panelRef}
      id={serviceAnchor(id)}
      className="border-t border-[var(--border-subtle)] first:border-t-0 lg:min-h-[135vh] lg:border-t-0"
    >
      <div className="grid items-center gap-8 py-16 lg:sticky lg:top-[14vh] lg:h-[72vh] lg:grid-cols-2 lg:gap-14 lg:py-0">
        <div className={sceneFirst ? "lg:order-2" : undefined}>
          <h3 className="t-h3">{t(serviceTitleKey(id))}</h3>
          <p className="t-body mt-5 max-w-[40ch]">{t(serviceBodyKey(id))}</p>
        </div>

        <div
          className={[
            "aspect-[5/4] w-full lg:aspect-square lg:h-auto lg:self-center",
            sceneFirst ? "lg:order-1" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <ServiceScene id={id} cameraZ={CAMERA_Z[id]} progress={progress} />
        </div>
      </div>
    </article>
  );
}
