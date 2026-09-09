"use client";

import { useRef, useState, type ComponentType } from "react";

import { SceneFrame } from "@/components/three/scene-frame";
import {
  AiScene,
  AutomationScene,
  ChatScene,
  SceneLights,
  SoftwareScene,
  WebScene,
  type SceneProps,
} from "@/components/three/service-scenes";
import { useTranslations } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/config";
import { useScrollProgress } from "@/lib/use-scroll-progress";

type ServiceId = "web" | "automation" | "software" | "whatsapp" | "ai";

type ServiceConfig = {
  id: ServiceId;
  Scene: ComponentType<SceneProps>;
  /** Distancia de cámara: cada modelo ocupa un volumen distinto. */
  cameraZ: number;
};

/**
 * Los cinco frentes de trabajo. No son una secuencia —un proyecto puede
 * empezar por cualquiera— así que el riel los numera por posición, no
 * con marcadores de paso.
 */
const SERVICES: ServiceConfig[] = [
  // La distancia sale del volumen que ocupa cada modelo cuando está
  // completamente abierto: con FOV vertical de 42 grados y encuadre
  // cuadrado, el lado visible mide 0.767 por la distancia.
  { id: "web", Scene: WebScene, cameraZ: 5.6 },
  { id: "automation", Scene: AutomationScene, cameraZ: 7.2 },
  { id: "software", Scene: SoftwareScene, cameraZ: 6.2 },
  { id: "whatsapp", Scene: ChatScene, cameraZ: 6.8 },
  { id: "ai", Scene: AiScene, cameraZ: 7.0 },
];

const titleKey = (id: ServiceId) => `services.items.${id}.title` as MessageKey;
const bodyKey = (id: ServiceId) => `services.items.${id}.body` as MessageKey;
const anchorOf = (id: ServiceId) => `servicio-${id}`;

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
          {SERVICES.map((service, index) => (
            <ServicePanel
              key={service.id}
              service={service}
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
 * cualquiera: es información de posición, no decoración.
 */
function ServiceRail({ active }: { active: number }) {
  const t = useTranslations();

  return (
    <nav
      aria-label={t("services.railLabel")}
      className="hidden lg:sticky lg:top-[42vh] lg:block lg:self-start"
    >
      <ul className="flex flex-col gap-1">
        {SERVICES.map((service, index) => {
          const current = index === active;
          return (
            <li key={service.id}>
              <a
                href={`#${anchorOf(service.id)}`}
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
                {t(titleKey(service.id))}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function ServicePanel({
  service,
  index,
  onActive,
}: {
  service: ServiceConfig;
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
      id={anchorOf(service.id)}
      className="border-t border-[var(--border-subtle)] first:border-t-0 lg:min-h-[135vh] lg:border-t-0"
    >
      <div className="grid items-center gap-8 py-16 lg:sticky lg:top-[14vh] lg:h-[72vh] lg:grid-cols-2 lg:gap-14 lg:py-0">
        <div className={sceneFirst ? "lg:order-2" : undefined}>
          <h3 className="t-h3">{t(titleKey(service.id))}</h3>
          <p className="t-body mt-5 max-w-[40ch]">{t(bodyKey(service.id))}</p>
        </div>

        <div
          className={[
            "aspect-[5/4] w-full lg:aspect-square lg:h-auto lg:self-center",
            sceneFirst ? "lg:order-1" : undefined,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Decorativo: todo lo que dice el modelo ya está en el texto
              de al lado, así que no se anuncia a lectores de pantalla. */}
          <SceneFrame className="h-full w-full" cameraZ={service.cameraZ}>
            <SceneLights />
            <service.Scene progress={progress} />
          </SceneFrame>
        </div>
      </div>
    </article>
  );
}
