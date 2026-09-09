"use client";

import { ActionLink } from "@/components/ui/action";
import { RollingWord, SplitText } from "@/components/ui/letters";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import type { MessageKey } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Portada.
 *
 * Titular del portafolio: una frase fija y una palabra clave que va
 * cambiando sola en un rodillo, con la misma cadencia del original
 * (2400 ms de espera, 450 ms de viaje, curva con rebote). Cada letra es
 * su propia caja y reacciona al cursor por separado.
 *
 * Debajo, la fila de tres tarjetas hermanas de tech-ish: al apuntar a
 * una, las otras se apagan.
 */
export function Hero() {
  const t = useTranslations();

  const words = [
    t("hero.word1"),
    t("hero.word2"),
    t("hero.word3"),
    t("hero.word4"),
  ];

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

        <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
          <h1 className="t-display lg:col-span-2 lg:col-start-1 lg:row-start-1">
            <span className="a-rise-line">
              <span
                className="h-line a-rise block"
                style={{ animationDelay: "140ms" }}
              >
                <SplitText text={t("hero.titleLine1")} />
              </span>
            </span>
            <span className="a-rise-line">
              <span
                className="a-rise block lg:pl-[10%]"
                style={{ animationDelay: "260ms" }}
              >
                <RollingWord words={words} />
              </span>
            </span>
          </h1>

          {/* El párrafo se mete en el hueco que deja la primera línea. */}
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
 * Grupo de hermanos: apuntar a una tarjeta atenúa a las demás. El grupo
 * entero baja de opacidad y la que tiene el cursor la recupera, así el
 * foco se resuelve con dos reglas y sin JavaScript.
 */
function SiblingCards() {
  const t = useTranslations();

  return (
    <ul
      data-stagger
      className="a-stagger grid gap-3 sm:grid-cols-3 [&:hover>li]:opacity-45"
    >
      {CARDS.map((card) => (
        <li
          key={card.href}
          className="transition-opacity duration-[var(--dur-slow)] ease-[var(--ease-liquid)] hover:!opacity-100"
        >
          <a
            href={card.href}
            className={[
              "lg lg-motion lg-press lg-hover flex h-full flex-col justify-between gap-8 p-5 sm:p-6",
              "[--glass-radius:var(--r-card)]",
              card.tone === "ink" ? "[--glass-bg:rgba(10,8,6,0.6)]" : "",
              card.tone === "teal"
                ? "[--glass-bg:rgba(47,168,184,0.2)] [--glass-bloom:rgba(160,235,245,0.22)]"
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
                style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}
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
