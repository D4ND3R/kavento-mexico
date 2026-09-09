"use client";

import { ActionLink } from "@/components/ui/action";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useTranslations } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/config";

/**
 * Portada.
 *
 * La composición viene de tech-ish.org: dos líneas de titular enormes
 * a peso medio, la segunda desplazada a la derecha, el párrafo metido
 * en el hueco que deja la primera, y la llamada a la acción abajo a la
 * izquierda cruzando la altura de la segunda línea. El aire asimétrico
 * es el que hace el trabajo; no hay adorno que rellenar.
 *
 * Debajo, la fila de tres tarjetas hermanas: al apuntar a una, las
 * otras se apagan. Una es de vidrio, otra casi negra y otra teal —el
 * mismo contraste de materiales de la referencia.
 */
export function Hero() {
  const t = useTranslations();

  return (
    <section
      id="top"
      data-stack
      className="stack stack-1 flex min-h-[100svh] flex-col justify-between overflow-hidden pb-10 pt-32 sm:pt-40"
    >
      <div data-recede className="u-shell w-full">
        <p className="t-eyebrow a-fade" style={{ animationDelay: "60ms" }}>
          {t("hero.kicker")}
        </p>

        {/*
          El titular ocupa el ancho completo y el párrafo se mete en el
          hueco que deja la primera línea: los dos viven en la misma
          celda de la retícula (fila 1), y como la línea 1 es corta y el
          párrafo solo mide dos renglones, nunca se cruzan.
        */}
        <div className="mt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <h1 className="t-display lg:col-span-2 lg:col-start-1 lg:row-start-1">
            <span className="a-rise-line">
              <span className="a-rise block" style={{ animationDelay: "140ms" }}>
                {t("hero.titleLine1")}
              </span>
            </span>
            <span className="a-rise-line lg:pl-[14%]">
              <span className="a-rise block" style={{ animationDelay: "260ms" }}>
                {t("hero.titleLine2")}
              </span>
            </span>
          </h1>

          {/* El párrafo vive en el hueco que deja el titular, no debajo. */}
          <p
            className="t-lead a-fade mt-8 max-w-[38ch] lg:col-start-2 lg:row-start-1 lg:mt-3 lg:self-start"
            style={{ animationDelay: "420ms" }}
          >
            {t("hero.lead")}
          </p>
        </div>

        <div
          className="a-fade mt-12 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "540ms" }}
        >
          <ActionLink href="#contacto">{t("hero.ctaPrimary")}</ActionLink>
          <ActionLink href="#servicios" variant="ghost">
            {t("hero.ctaSecondary")}
          </ActionLink>
        </div>
      </div>

      <div className="u-shell w-full">
        <SiblingCards />

        <p className="mt-8 flex items-center gap-3 text-[0.8125rem] text-faint">
          <span
            aria-hidden="true"
            className="relative hidden h-7 w-px overflow-hidden bg-[var(--border-subtle)] sm:block"
          >
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[kv-drift_2.6s_ease-in-out_infinite] bg-[var(--accent-from)]" />
          </span>
          {t("hero.scrollHint")}
        </p>
      </div>
    </section>
  );
}

type CardSpec = {
  href: string;
  label: MessageKey;
  value: MessageKey;
  note: MessageKey;
  tone: "glass" | "ink" | "teal";
  glyph?: boolean;
};

const CARDS: CardSpec[] = [
  {
    href: "#servicios",
    label: "hero.cardServicesLabel",
    value: "hero.cardServicesValue",
    note: "hero.cardServicesNote",
    tone: "glass",
  },
  {
    href: "#contacto",
    label: "hero.cardContactLabel",
    value: "hero.cardContactValue",
    note: "hero.cardContactNote",
    tone: "ink",
    glyph: true,
  },
  {
    href: "#equipo",
    label: "hero.cardTeamLabel",
    value: "hero.cardTeamValue",
    note: "hero.cardTeamNote",
    tone: "teal",
  },
];

/**
 * Grupo de hermanos: apuntar a una tarjeta atenúa a las demás. El
 * grupo entero baja de opacidad y la que tiene el cursor la recupera,
 * así el foco se resuelve con dos reglas y sin JavaScript.
 */
function SiblingCards() {
  const t = useTranslations();

  return (
    <ul className="grid gap-3 sm:grid-cols-3 [&:hover>li]:opacity-45">
      {CARDS.map((card) => (
        <li
          key={card.href}
          className="transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-liquid)] hover:!opacity-100"
        >
          <a
            href={card.href}
            className={[
              "lg lg-motion lg-press flex h-full flex-col justify-between gap-8 p-5 sm:p-6",
              "rounded-[var(--r-card)] hover:-translate-y-1",
              card.tone === "ink" ? "[--glass-tint:rgba(10,8,6,0.72)]" : "",
              card.tone === "teal"
                ? "[--glass-tint:rgba(47,168,184,0.22)] [--glass-edge-hi:rgba(160,235,245,0.6)]"
                : "",
              card.tone === "glass" ? "lg--refract" : "",
            ].join(" ")}
          >
            <span className="flex items-center justify-between gap-3 text-[0.8125rem] text-muted">
              {t(card.label)}
              {card.glyph ? (
                <span className="text-solar">
                  <WhatsappGlyph size={18} />
                </span>
              ) : null}
            </span>

            <span>
              <span
                className="block text-[1.75rem] leading-none text-ink"
                style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
              >
                {t(card.value)}
              </span>
              <span className="mt-2.5 block text-[0.875rem] leading-snug text-muted">
                {t(card.note)}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
