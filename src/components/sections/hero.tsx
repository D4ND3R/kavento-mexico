"use client";

import { HeroSun } from "@/components/three/lazy";
import { ActionLink } from "@/components/ui/action";
import { useTranslations } from "@/lib/i18n/provider";

export function Hero() {
  const t = useTranslations();

  const lines = [t("hero.titleLine1"), t("hero.titleLine2"), t("hero.titleLine3")];

  return (
    <section
      id="top"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-36 sm:pt-40 lg:pt-32"
    >
      {/*
        La luz del sol no se queda dentro del canvas: se derrama por la
        sección y decae hacia abajo. Es CSS, no cuesta un cuadro.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-1/3 top-0 z-0"
        style={{
          background:
            "radial-gradient(52% 44% at 78% 68%, var(--glow-warm) 0%, transparent 70%), radial-gradient(38% 32% at 12% 22%, var(--glow-teal) 0%, transparent 74%)",
        }}
      />

      {/*
        Un solo canvas para las dos disposiciones: en escritorio el sol se
        sale por la esquina inferior derecha y el titular ocupa el ancho
        completo arriba, así que nunca se cruzan; en móvil sube a la
        esquina superior derecha, donde solo hay aire.
      */}
      <div className="pointer-events-none absolute -right-[16%] -top-[6%] z-0 aspect-square w-[74vw] max-w-[340px] lg:-bottom-[9%] lg:-right-[5%] lg:top-auto lg:w-[46vw] lg:max-w-[660px]">
        <HeroSun label={t("hero.sunAlt")} />

        {/* En móvil el sol queda cerca del titular: se desvanece por abajo
            para que el texto nunca compita con el naranja. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 lg:hidden"
          style={{
            background:
              "linear-gradient(to bottom, transparent 42%, var(--bg-primary) 96%)",
          }}
        />
      </div>

      <div className="u-shell relative z-10 w-full">
        <h1 className="t-display max-w-[68rem]">
          {lines.map((line, index) => (
            <span
              key={line}
              className="a-set block"
              style={{ animationDelay: `${120 + index * 110}ms` }}
            >
              {line}
            </span>
          ))}
        </h1>

        <hr
          className="u-rule a-fade my-9 w-28 border-0"
          style={{ animationDelay: "520ms" }}
        />

        <p
          className="t-lead a-fade max-w-[46ch]"
          style={{ animationDelay: "600ms" }}
        >
          {t("hero.lead")}
        </p>

        <div
          className="a-fade mt-10 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "700ms" }}
        >
          <ActionLink href="#contacto">{t("hero.ctaPrimary")}</ActionLink>
          <ActionLink href="#servicios" variant="ghost">
            {t("hero.ctaSecondary")}
          </ActionLink>
        </div>
      </div>

      <p
        className="a-fade absolute inset-x-0 bottom-7 z-10 mx-auto flex items-center justify-center gap-3 text-[0.8125rem] text-faint lg:justify-start lg:pl-[var(--gutter)]"
        style={{ animationDelay: "1100ms" }}
      >
        <span
          className="relative hidden h-8 w-px overflow-hidden bg-[var(--border-subtle)] sm:block"
          aria-hidden="true"
        >
          <span className="a-drift absolute inset-x-0 top-0 h-1/2 bg-[var(--accent-from)]" />
        </span>
        {t("hero.scrollHint")}
      </p>
    </section>
  );
}
