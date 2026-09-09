"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/provider";
import { team } from "@/lib/team";

/**
 * Equipo.
 *
 * Los retratos van en marcos de vidrio con radio pequeño (4px): los
 * paneles llevan 20px y las píldoras son redondas, así que el radio
 * distingue jerarquías en lugar de uniformarlo todo.
 */
export function Team() {
  const t = useTranslations();

  return (
    <section
      id="equipo"
      data-stack
      className="stack stack-4 py-24 sm:py-28"
      style={{ ["--lit-x" as string]: "12%", ["--lit-y" as string]: "70%", ["--lit-x2" as string]: "82%", ["--lit-y2" as string]: "12%" }}
    >
      <div className="u-shell">
        <div className="lg:flex lg:items-end lg:justify-between lg:gap-16">
          <h2 className="t-h2 max-w-[10ch]">{t("team.title")}</h2>
          <p className="t-lead mt-5 lg:mt-0 lg:max-w-[36ch] lg:text-right">
            {t("team.lead")}
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-4 sm:gap-5 lg:mt-20 lg:grid-cols-4 lg:gap-6 [&:hover>li]:opacity-50">
          {team.map((member) => (
            <li
              key={member.id}
              className="group transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-liquid)] hover:!opacity-100"
            >
              <article>
                <div
                  className="lg lg--refract lg-motion relative overflow-hidden group-hover:-translate-y-1.5"
                  style={{
                    aspectRatio: "4 / 5",
                    borderRadius: "var(--r-portrait)",
                  }}
                >
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name ?? t("team.portraitAlt")}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center px-3 text-center text-[0.75rem] text-faint">
                      {t("team.portraitAlt")}
                    </span>
                  )}
                </div>

                <h3
                  className="mt-4 text-[1.0625rem] leading-tight text-ink"
                  style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
                >
                  {member.name ?? t("team.namePlaceholder")}
                </h3>
                <p className="mt-1 text-[0.9375rem] text-muted">
                  {member.role ?? t("team.rolePlaceholder")}
                </p>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[0.8125rem] text-faint">{t("team.note")}</p>
      </div>
    </section>
  );
}
