"use client";

import Image from "next/image";

import { useTranslations } from "@/lib/i18n/provider";
import { team } from "@/lib/team";

/**
 * Equipo. Los retratos usan un radio pequeño (4px) a propósito: los
 * paneles de servicio llevan 12px y las píldoras son redondas, así que
 * el radio distingue jerarquías en vez de uniformarlo todo.
 */
export function Team() {
  const t = useTranslations();

  return (
    <section id="equipo" className="u-section relative bg-surface">
      <div className="u-shell">
        <h2 className="t-h2">{t("team.title")}</h2>
        <p className="t-lead mt-5">{t("team.lead")}</p>

        <ul className="mt-14 grid grid-cols-2 gap-5 sm:gap-6 lg:mt-20 lg:grid-cols-4 lg:gap-8">
          {team.map((member) => (
            <li key={member.id}>
              <article className="group">
                <div
                  className="relative overflow-hidden bg-elevated"
                  style={{
                    aspectRatio: "4 / 5",
                    borderRadius: "var(--r-portrait)",
                    border: member.photo ? undefined : "1px dashed var(--border-strong)",
                  }}
                >
                  {member.photo ? (
                    <Image
                      src={member.photo}
                      alt={member.name ?? t("team.portraitAlt")}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                  ) : (
                    <span className="absolute inset-0 grid place-items-center px-3 text-center text-[0.75rem] text-faint">
                      {t("team.portraitAlt")}
                    </span>
                  )}

                  {/* Velo cálido al pasar el cursor: el retrato se calienta
                      con el mismo naranja de la marca. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(to top, var(--glow-warm), transparent 62%)",
                    }}
                  />
                </div>

                <h3
                  className="mt-4 text-[1.0625rem] font-bold leading-tight"
                  style={{ fontFamily: "var(--font-display)" }}
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
