"use client";

import Image from "next/image";
import { useCallback, useRef } from "react";

import { Crest } from "@/components/ui/crest";
import { SplitText } from "@/components/ui/letters";
import { useTranslations } from "@/lib/i18n/provider";
import { team } from "@/lib/team";

/**
 * Equipo.
 *
 * Cada retrato se inclina siguiendo al cursor: se lee la posición
 * relativa dentro de la tarjeta y se escriben dos variables CSS que
 * mueven la rotación y el brillo especular. Todo el cálculo se hace en
 * el manejador de puntero y se escribe directo al DOM, así que mover el
 * cursor no provoca ni un render de React.
 *
 * Las tarjetas entran escalonadas con `data-stagger`, y el nombre se
 * parte en letras para que reaccione una por una.
 */
export function Team() {
  const t = useTranslations();

  return (
    <section
      id="equipo"
      data-stack
      className="stack stack-5 stack--pad"
      style={{
        ["--lit-x" as string]: "16%",
        ["--lit-y" as string]: "24%",
        ["--lit-x2" as string]: "86%",
        ["--lit-y2" as string]: "82%",
      }}
    >
      <Crest shape="duna" color="var(--bg-primary)" />

      <div className="u-shell">
        <p className="t-eyebrow">{t("team.eyebrow")}</p>

        <div className="mt-5 lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="t-h2 max-w-[10ch]">{t("team.title")}</h2>
          <p className="t-lead mt-5 lg:mt-0 lg:max-w-[36ch] lg:text-right">
            {t("team.lead")}
          </p>
        </div>

        <ul
          data-stagger
          className="a-stagger mt-[clamp(3rem,7vh,5rem)] grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4 lg:gap-6"
        >
          {team.map((member) => (
            <TeamCard
              key={member.id}
              photo={member.photo}
              name={member.name ?? t("team.namePlaceholder")}
              role={member.role ?? t("team.rolePlaceholder")}
              portraitAlt={t("team.portraitAlt")}
            />
          ))}
        </ul>

        <p className="mt-10 text-[0.8125rem] text-faint">{t("team.note")}</p>
      </div>
    </section>
  );
}

function TeamCard({
  photo,
  name,
  role,
  portraitAlt,
}: {
  photo: string | null;
  name: string;
  role: string;
  portraitAlt: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);

  const tilt = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    // -0.5 … 0.5 desde el centro de la tarjeta.
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    frame.style.setProperty("--tilt-x", `${(-y * 9).toFixed(2)}deg`);
    frame.style.setProperty("--tilt-y", `${(x * 11).toFixed(2)}deg`);
    frame.style.setProperty("--shine-x", `${((x + 0.5) * 100).toFixed(1)}%`);
    frame.style.setProperty("--shine-y", `${((y + 0.5) * 100).toFixed(1)}%`);
  }, []);

  const rest = useCallback(() => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.style.setProperty("--tilt-x", "0deg");
    frame.style.setProperty("--tilt-y", "0deg");
  }, []);

  return (
    <li>
      <article className="group">
        <div
          ref={frameRef}
          onPointerMove={tilt}
          onPointerLeave={rest}
          className="team-frame lg lg--refract lg-motion relative"
        >
          {photo ? (
            <Image
              src={photo}
              alt={name}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-[900ms] ease-[var(--ease-liquid)] group-hover:scale-[1.06]"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center px-3 text-center text-[0.75rem] text-faint">
              {portraitAlt}
            </span>
          )}

          {/* Brillo especular que sigue al cursor. */}
          <span className="team-shine" aria-hidden="true" />
        </div>

        <h3
          className="mt-4 text-[1.0625rem] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
        >
          <SplitText text={name} />
        </h3>
        <p className="mt-1 text-[0.9375rem] text-muted">{role}</p>
      </article>
    </li>
  );
}
