"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";

import { createSceneStore } from "@/components/three/scene-store";
import { useJourney } from "@/components/three/use-journey";
import { ActionLink } from "@/components/ui/action";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useIsMobile, useReducedMotion } from "@/lib/hooks";
import type { MessageKey } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * El lienzo WebGL no puede renderizarse en el servidor y pesa: se carga
 * aparte y solo en cliente. Mientras llega, el fondo lo pinta el CSS
 * con el mismo color que el lienzo, así no hay salto.
 */
const Scene = dynamic(
  () => import("@/components/three/scene").then((m) => m.Scene),
  { ssr: false },
);

const MANIFESTO: MessageKey[] = [
  "journey.line1",
  "journey.line2",
  "journey.line3",
  "journey.line4",
];

const STAGES: MessageKey[][] = [
  ["journey.stage1.p1", "journey.stage1.p2", "journey.stage1.p3"],
  ["journey.stage2.p1", "journey.stage2.p2", "journey.stage2.p3"],
  ["journey.stage3.p1", "journey.stage3.p2"],
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (v: number, from: number, to: number) => clamp01((v - from) / (to - from));

/**
 * La portada y el recorrido 3D, ingeniería inversa de altitude101.
 *
 * Es una sección de puro scroll: seis bloques vacíos de distintas
 * alturas que solo existen para dar recorrido a la escena fija que hay
 * detrás. Encima del lienzo van tres capas de texto, también fijas,
 * que la coreografía enciende y apaga según el tramo:
 *
 *   · la portada        eyebrow, lead y botones, que se desvanecen al bajar
 *   · el manifiesto     cuatro líneas que entran una a una
 *   · las tres etapas   párrafos bajo el anillo de palabras
 *
 * Nada de esto pasa por estado de React: la coreografía registra
 * funciones en `store.dom` y les pasa el progreso; aquí se escribe el
 * estilo directamente.
 *
 * Cuando el recorrido termina, la siguiente sección (que es opaca y va
 * apilada por encima) tapa lienzo y capas de una vez.
 */
export function Journey() {
  const t = useTranslations();
  const isMobile = useIsMobile();
  const reducedMotion = useReducedMotion();
  const store = useMemo(() => createSceneStore(), []);

  const heroRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLDivElement>(null);
  const finalRef = useRef<HTMLDivElement>(null);

  useJourney(store, { isMobile, reducedMotion });

  const words = useMemo<[string, string, string]>(
    () => [t("journey.word1"), t("journey.word2"), t("journey.word3")],
    [t],
  );

  /* --- portada: se apaga en el primer tercio de la sección ------- */
  useEffect(() => {
    const node = heroRef.current;
    if (!node) return;
    store.dom.hero = (progress) => {
      const fade = 1 - ramp(progress, 0, 0.32);
      node.style.opacity = fade.toFixed(3);
      node.style.transform = `translateY(${(-40 * (1 - fade)).toFixed(1)}px)`;
      node.style.pointerEvents = fade < 0.2 ? "none" : "";
      node.dataset.hidden = fade < 0.02 ? "true" : "false";
    };
    return () => {
      delete store.dom.hero;
    };
  }, [store]);

  /* --- manifiesto: ventanas por línea, como en el original -------- */
  useEffect(() => {
    const node = manifestoRef.current;
    if (!node) return;
    const lines = Array.from(node.querySelectorAll<HTMLElement>("p"));
    const n = lines.length;
    const outStart = 0.06 * (n - 1) + 0.15 + 0.02;

    store.dom.manifesto = (progress) => {
      let anyVisible = false;
      lines.forEach((line, i) => {
        const inStart = 0.06 * i;
        const inEnd = inStart + 0.15;
        const exitStart = outStart + 0.01 * i;
        const exitEnd = exitStart + 0.1;

        const entering = ramp(progress, inStart, inEnd);
        const leaving = ramp(progress, exitStart, exitEnd);
        const opacity = entering * (1 - leaving);
        const y = 20 * (1 - entering) + 6 * leaving;
        const blur = 3 * (1 - entering) + 3 * leaving;

        line.style.opacity = opacity.toFixed(3);
        line.style.transform = `translateY(${y.toFixed(1)}px)`;
        line.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
        if (opacity > 0.01) anyVisible = true;
      });
      node.dataset.hidden = anyVisible ? "false" : "true";
    };
    return () => {
      delete store.dom.manifesto;
    };
  }, [store]);

  /* --- etapas finales ------------------------------------------- */
  useEffect(() => {
    const node = finalRef.current;
    if (!node) return;
    const stages = Array.from(node.querySelectorAll<HTMLElement>("[data-stage]"));

    store.dom.finalOverlay = (stage, local, visible, section8) => {
      const fadeOut = 1 - ramp(section8, 0, 0.3);
      node.style.opacity = (visible * fadeOut).toFixed(3);
      node.dataset.hidden = visible * fadeOut < 0.02 ? "true" : "false";

      stages.forEach((block, which) => {
        const active = which === stage;
        block.style.opacity = active ? "1" : "0";
        block.style.pointerEvents = active ? "auto" : "none";
        if (!active) return;

        const lines = Array.from(block.querySelectorAll<HTMLElement>("p"));
        const total = lines.length;
        lines.forEach((line, i) => {
          // En móvil todas las líneas entran y salen a la vez.
          const inStart = isMobile ? 0 : (i / total) * 0.4;
          const inEnd = isMobile ? 0.4 : ((i + 1) / total) * 0.4;
          const outStart = isMobile ? 0.6 : 0.6 + (i / total) * 0.4;
          const outEnd = isMobile ? 1 : 0.6 + ((i + 1) / total) * 0.4;

          const entering = ramp(local, inStart, inEnd);
          const leaving = ramp(local, outStart, outEnd);
          const opacity = entering * (1 - leaving);
          const y = 20 * (1 - entering) + 6 * leaving;
          const blur = 3 * (1 - entering) + 3 * leaving;

          line.style.opacity = opacity.toFixed(3);
          line.style.transform = `translateY(${y.toFixed(1)}px)`;
          line.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : "";
        });
      });
    };
    return () => {
      delete store.dom.finalOverlay;
    };
  }, [store, isMobile]);

  return (
    <section id="top" className="journey" aria-label="Kavento">
      <Scene store={store} words={words} isMobile={isMobile} reducedMotion={reducedMotion} />

      {/* Portada ------------------------------------------------- */}
      <div ref={heroRef} className="journey__hero" data-hidden="false">
        <div className="u-shell journey__hero-grid">
          <p className="t-eyebrow journey__kicker">
            <span className="inline-block size-1.5 rounded-full bg-[var(--accent-to)]" />
            {t("hero.kicker")}
          </p>

          <p className="journey__place">
            <PinGlyph />
            {t("hero.place")}
          </p>

          <div className="journey__foot">
            <p className="t-lead max-w-[38ch]">{t("hero.lead")}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <ActionLink href="#contacto">
                <WhatsappGlyph size={17} />
                {t("hero.ctaPrimary")}
              </ActionLink>
              <ActionLink href="#nosotros" variant="ghost">
                {t("hero.ctaSecondary")}
              </ActionLink>
            </div>
          </div>

          <p className="journey__hint">
            <span aria-hidden="true" className="journey__hint-line">
              <span />
            </span>
            {t("hero.scrollHint")}
            <span className="journey__drag hidden md:inline">· {t("hero.dragHint")}</span>
          </p>
        </div>
      </div>

      {/* Manifiesto ---------------------------------------------- */}
      <div ref={manifestoRef} className="journey__manifesto" data-hidden="true" aria-hidden="true">
        <div className="journey__manifesto-inner">
          {MANIFESTO.map((key, i) => (
            <p key={key} className={i === 0 ? "journey__line journey__line--lead" : "journey__line"}>
              {t(key)}
            </p>
          ))}
        </div>
      </div>

      {/* Etapas finales ----------------------------------------- */}
      <div ref={finalRef} className="journey__final" data-hidden="true" aria-hidden="true">
        {STAGES.map((keys, which) => (
          <div key={which} data-stage={which} className="journey__stage">
            {keys.map((key) => (
              <p key={key} className="journey__stage-line">
                {t(key)}
              </p>
            ))}
          </div>
        ))}
      </div>

      {/* Versión legible del recorrido para lectores de pantalla y
          buscadores: el mismo texto que las capas animadas. */}
      <div className="sr-only">
        <h1>Kavento</h1>
        {MANIFESTO.map((key) => (
          <p key={key}>{t(key)}</p>
        ))}
        <ul>
          {words.map((word, i) => (
            <li key={word}>
              <strong>{word}</strong>
              {STAGES[i].map((key) => (
                <p key={key}>{t(key)}</p>
              ))}
            </li>
          ))}
        </ul>
      </div>

      {/* Recorrido: bloques vacíos que dan scroll a la escena. Las
          alturas son las del original, salvo el manifiesto y el tramo
          final, algo más cortos. */}
      <div id="section-1" className="journey__spacer h-[110dvh] md:h-[150vh]" />
      <div id="section-4" className="journey__spacer h-[300dvh]" />
      <div id="section-5" className="journey__spacer h-[30vh]" />
      <div id="section-6" className="journey__spacer h-[30vh]" />
      <div id="section-7" className="journey__spacer h-[450vh]" />
      <div id="section-8" className="journey__spacer h-[70vh] md:h-screen" />
    </section>
  );
}

function PinGlyph() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"
        fill="var(--accent-to)"
      />
    </svg>
  );
}
