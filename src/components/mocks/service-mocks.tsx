"use client";

import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useTranslations } from "@/lib/i18n/provider";
import type { ServiceId } from "@/lib/services";

/* ==================================================================
   MAQUETAS DE SERVICIO

   Reemplazan a los modelos 3D abstractos. En vez de geometría bonita
   que no significa nada, cada servicio se ilustra con un fragmento de
   la interfaz que Kavento realmente construye, montado en vidrio.

   Todo es DOM y CSS: sin canvas, sin WebGL, sin un solo kilobyte de
   librería. Son decorativas —lo que dicen ya está en el texto de al
   lado— así que el contenedor las marca como tales.
   ================================================================== */

/** Barra de puntos del cromo de ventana. */
function Dots() {
  return (
    <span className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-2 rounded-full bg-[rgba(255,244,232,0.28)]"
        />
      ))}
    </span>
  );
}

/** Línea de texto simulada. */
function Line({ w, dim = false }: { w: string; dim?: boolean }) {
  return (
    <span
      className="block h-2 rounded-full"
      style={{
        width: w,
        background: dim
          ? "rgba(255,244,232,0.12)"
          : "rgba(255,244,232,0.22)",
      }}
    />
  );
}

/** Punto "en vivo". */
function Live({ color = "var(--accent-to)" }: { color?: string }) {
  return (
    <span className="relative flex size-2">
      <span
        className="absolute inset-0 rounded-full animate-[kv-breathe_1.8s_ease-in-out_infinite_alternate]"
        style={{ background: color }}
      />
    </span>
  );
}

/* ------------------------------------------------------------------
   Desarrollo web — una ventana de navegador
   ------------------------------------------------------------------ */
function BrowserMock() {
  const t = useTranslations();
  return (
    <div className="lg lg--panel lg--refract flex h-full w-full flex-col overflow-hidden p-3">
      <div className="flex shrink-0 items-center gap-3 px-1 pb-3">
        <Dots />
        <span className="lg lg--flush flex-1 rounded-[var(--r-pill)] px-3 py-1.5 text-center text-[0.6875rem] text-muted">
          {t("mocks.browserUrl")}
        </span>
      </div>

      <div className="lg lg--flush flex flex-1 flex-col overflow-hidden rounded-[var(--r-card)] p-4">
        <div
          className="min-h-16 w-full flex-[1] rounded-[10px]"
          style={{
            background:
              "linear-gradient(118deg, rgba(255,122,26,.55), rgba(255,201,74,.28) 55%, rgba(47,168,184,.22))",
          }}
        />
        <div className="mt-4 flex flex-col gap-2">
          <Line w="72%" />
          <Line w="54%" dim />
        </div>
        {/* `self-start` o el flex-column lo estira a todo el ancho. */}
        <span
          className="mt-4 inline-flex self-start rounded-[var(--r-pill)] px-3.5 py-1.5 text-[0.6875rem] font-semibold text-base"
          style={{ background: "var(--accent-gradient)" }}
        >
          {t("mocks.browserCta")}
        </span>
        <div className="mt-4 grid flex-[0.72] grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="min-h-10 rounded-lg"
              style={{ background: "rgba(255,244,232,0.07)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Automatización — una tubería con un pulso viajando
   ------------------------------------------------------------------ */
function PipelineMock() {
  const t = useTranslations();
  const steps = [
    t("mocks.pipelineStep1"),
    t("mocks.pipelineStep2"),
    t("mocks.pipelineStep3"),
    t("mocks.pipelineStep4"),
  ];

  return (
    <div className="lg lg--panel lg--refract flex h-full w-full flex-col justify-center gap-5 p-5 sm:p-7">
      <span className="flex items-center gap-2 text-[0.75rem] text-muted">
        <Live />
        {t("mocks.pipelineStatus")}
      </span>

      <ol className="flex flex-col gap-0">
        {steps.map((step, i) => (
          <li key={step}>
            <div className="lg lg--flush flex items-center gap-3 rounded-[var(--r-card)] px-3.5 py-3">
              <span
                className="size-1.5 shrink-0 rounded-full"
                style={{
                  background:
                    i === steps.length - 1
                      ? "var(--accent-teal)"
                      : "var(--accent-to)",
                }}
              />
              <span className="text-[0.8125rem] text-ink">{step}</span>
            </div>

            {i < steps.length - 1 ? (
              // Riel entre nodos, con el pulso que lo recorre.
              <div className="relative ml-[1.35rem] h-5 w-px overflow-hidden bg-[var(--border-strong)]">
                <span
                  className="absolute inset-x-[-1px] top-0 h-2 rounded-full bg-[var(--accent-to)] animate-[kv-drift_2.4s_linear_infinite]"
                  style={{ animationDelay: `${i * 0.45}s` }}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------
   Apps a la medida — una tarjeta de métrica dentro de un dispositivo
   ------------------------------------------------------------------ */
function DeviceMock() {
  const t = useTranslations();
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="lg lg--panel lg--refract w-[15rem] max-w-full overflow-hidden p-3">
        {/* Isla superior del dispositivo */}
        <span className="mx-auto mb-3 block h-1.5 w-14 rounded-full bg-[rgba(255,244,232,0.2)]" />

        <div className="lg lg--flush rounded-[var(--r-card)] p-4">
          <span className="block text-[0.6875rem] text-muted">
            {t("mocks.deviceLabel")}
          </span>
          <span
            className="mt-1 block text-[3rem] leading-none text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 500 }}
          >
            {t("mocks.deviceValue")}
          </span>
          <span className="mt-1 block text-[0.6875rem] text-teal-hi">
            {t("mocks.deviceDelta")}
          </span>

          {/* Regla de medición: la tira de marcas de la referencia. */}
          <div className="mt-5 flex h-8 items-end justify-between">
            {Array.from({ length: 22 }).map((_, i) => {
              const active = i === 13;
              return (
                <span
                  key={i}
                  className="w-px rounded-full"
                  style={{
                    height: active ? "100%" : `${28 + ((i * 37) % 46)}%`,
                    background: active
                      ? "var(--accent-to)"
                      : "rgba(255,244,232,0.2)",
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-8 rounded-[10px]"
              style={{
                background:
                  i === 0
                    ? "rgba(255,122,26,0.34)"
                    : "rgba(255,244,232,0.07)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   Chatbots — una conversación
   ------------------------------------------------------------------ */
function ChatMock() {
  const t = useTranslations();
  return (
    <div className="lg lg--panel lg--refract flex h-full w-full flex-col justify-center gap-3 p-5 sm:p-7">
      <span className="mb-1 flex items-center gap-2 text-[0.75rem] text-muted">
        <span className="text-teal">
          <WhatsappGlyph size={15} />
        </span>
        <Live color="var(--accent-teal)" />
      </span>

      <Bubble side="in">{t("mocks.chatIn1")}</Bubble>
      <Bubble side="out">{t("mocks.chatOut1")}</Bubble>
      <Bubble side="in">{t("mocks.chatIn2")}</Bubble>

      <span className="mt-1 flex items-center gap-1.5 pl-1 text-[0.6875rem] text-faint">
        {t("mocks.chatTyping")}
        <span className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-1 rounded-full bg-current animate-[kv-breathe_1s_ease-in-out_infinite_alternate]"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </span>
    </div>
  );
}

function Bubble({
  side,
  children,
}: {
  side: "in" | "out";
  children: React.ReactNode;
}) {
  const out = side === "out";
  return (
    <span
      className={[
        "lg lg--flush max-w-[86%] px-3.5 py-2.5 text-[0.8125rem] leading-snug",
        out
          ? "self-end rounded-2xl rounded-br-md text-[#04191e] [--glass-tint:rgba(47,168,184,0.82)]"
          : "self-start rounded-2xl rounded-bl-md text-ink",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------
   IA privada — un panel con respuesta en curso
   ------------------------------------------------------------------ */
function AiMock() {
  const t = useTranslations();
  return (
    <div className="lg lg--panel lg--refract flex h-full w-full flex-col justify-center gap-4 p-5 sm:p-7">
      <span className="lg lg--flush block rounded-[var(--r-card)] px-3.5 py-3 text-[0.8125rem] text-muted">
        {t("mocks.aiPrompt")}
      </span>

      <div className="px-1">
        <span className="text-[0.9375rem] leading-relaxed text-ink">
          {t("mocks.aiAnswer")}
          <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] bg-[var(--accent-to)] animate-[kv-caret_1.1s_steps(1)_infinite]" />
        </span>
        <span className="mt-3 flex flex-col gap-2">
          <Line w="88%" dim />
          <Line w="61%" dim />
        </span>
      </div>

      <span className="mt-1 flex items-center gap-2 text-[0.6875rem] text-teal-hi">
        <LockGlyph />
        {t("mocks.aiPrivacy")}
      </span>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect
        x="3"
        y="7"
        width="10"
        height="7"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */

const MOCKS: Record<ServiceId, () => React.ReactElement> = {
  web: BrowserMock,
  automation: PipelineMock,
  software: DeviceMock,
  whatsapp: ChatMock,
  ai: AiMock,
};

export function ServiceMock({ id }: { id: ServiceId }) {
  const Mock = MOCKS[id];
  return (
    <div aria-hidden="true" className="h-full w-full">
      <Mock />
    </div>
  );
}
