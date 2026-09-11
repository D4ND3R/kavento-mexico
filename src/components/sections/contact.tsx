"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

import { ActionButton } from "@/components/ui/action";
import { Crest } from "@/components/ui/crest";
import { SolarMark } from "@/components/ui/logo";
import { Watermark } from "@/components/ui/watermark";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import type { MessageKey } from "@/lib/i18n/config";
import { useTranslations } from "@/lib/i18n/provider";
import { serviceIds, serviceTitleKey, type ServiceId } from "@/lib/services";
import { buildWhatsappUrl } from "@/lib/site";

type ServiceChoice = ServiceId | "otro";
type Errors = { name?: string; service?: string };

const TIMINGS: MessageKey[] = ["contact.timing1", "contact.timing2", "contact.timing3"];
const MESSAGE_MAX = 400;

/**
 * Contacto.
 *
 * Kavento construye chatbots de WhatsApp, así que el formulario muestra
 * en vivo el mensaje que se va a enviar en lugar de describirlo: se ve
 * el producto en vez de leer sobre él. No hay backend — el botón abre
 * WhatsApp con el texto ya escrito.
 *
 * Los selectores son fichas (chips) y no un `<select>`: el desplegable
 * nativo pinta sus opciones con el color de texto de la página sobre
 * un fondo blanco del sistema, y salen ilegibles. Las fichas son
 * casillas nativas ocultas con su etiqueta visible, así que teclado y
 * lectores de pantalla las tratan como lo que son.
 *
 * El mensaje se arma por piezas (saludo, servicios, tiempos, detalle)
 * y solo entran las que tienen contenido: nunca sale "Me interesa: ."
 */
export function Contact() {
  const t = useTranslations();
  const fieldId = useId();

  const [name, setName] = useState("");
  const [services, setServices] = useState<ServiceChoice[]>([]);
  const [timing, setTiming] = useState<MessageKey | null>(null);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [copied, setCopied] = useState(false);

  const choices: { id: ServiceChoice; label: string }[] = useMemo(
    () => [
      ...serviceIds.map((id) => ({ id, label: t(serviceTitleKey(id)) })),
      { id: "otro", label: t("contact.serviceOther") },
    ],
    [t],
  );

  const composed = useMemo(() => {
    const parts: string[] = [];
    if (name.trim()) parts.push(t("contact.waIntro", { name: name.trim() }));
    if (services.length) {
      const labels = choices
        .filter((choice) => services.includes(choice.id))
        .map((choice) => choice.label)
        .join(", ");
      parts.push(t("contact.waServices", { services: labels }));
    }
    if (timing) parts.push(t("contact.waTiming", { timing: t(timing) }));
    if (message.trim()) parts.push(message.trim());
    return parts.join("\n");
  }, [name, services, timing, message, choices, t]);

  const hasDraft = composed.length > 0;
  const whatsappUrl = buildWhatsappUrl(composed);

  function toggleService(id: ServiceChoice) {
    setServices((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    if (errors.service) setErrors((current) => ({ ...current, service: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = t("contact.errorName");
    if (services.length === 0) nextErrors.service = t("contact.errorService");

    setErrors(nextErrors);
    if (nextErrors.name) {
      document.getElementById(`${fieldId}-name`)?.focus();
      return;
    }
    if (nextErrors.service) {
      document
        .querySelector<HTMLInputElement>(`#${CSS.escape(fieldId)}-service input`)
        ?.focus();
      return;
    }

    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(composed);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Sin permiso de portapapeles: el texto sigue visible en la vista
      // previa y se puede seleccionar a mano.
    }
  }

  return (
    <section
      id="contacto"
      data-stack
      className="stack stack-6 stack--alt stack--pad"
      style={{
        ["--lit-x" as string]: "72%",
        ["--lit-y" as string]: "82%",
        ["--lit-x2" as string]: "20%",
        ["--lit-y2" as string]: "10%",
      }}
    >
      <Crest shape="loma" />
      <Watermark>{t("marks.contact")}</Watermark>

      <div className="u-shell">
        <p className="t-eyebrow mb-5" data-drift="6">
          {t("contact.eyebrow")}
        </p>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <h2 className="t-h2" data-drift="12">
              {t("contact.title")}
            </h2>
            <p className="t-lead mt-5" data-drift="8">
              {t("contact.lead")}
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-7">
              <Field id={`${fieldId}-name`} label={t("contact.nameLabel")} error={errors.name}>
                <input
                  id={`${fieldId}-name`}
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    if (errors.name) setErrors((current) => ({ ...current, name: undefined }));
                  }}
                  placeholder={t("contact.namePlaceholder")}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
                  className={inputClasses}
                />
              </Field>

              <Group
                id={`${fieldId}-service`}
                label={t("contact.serviceLabel")}
                hint={t("contact.serviceHint")}
                error={errors.service}
              >
                {choices.map((choice) => {
                  const checked = services.includes(choice.id);
                  return (
                    <label key={choice.id} className="chip" data-checked={checked}>
                      <input
                        type="checkbox"
                        name="servicio"
                        value={choice.id}
                        checked={checked}
                        onChange={() => toggleService(choice.id)}
                        className="chip__input"
                      />
                      <span className="chip__mark" aria-hidden="true" />
                      <span className="chip__label">{choice.label}</span>
                    </label>
                  );
                })}
              </Group>

              <Group id={`${fieldId}-timing`} label={t("contact.timingLabel")}>
                {TIMINGS.map((key) => {
                  const checked = timing === key;
                  return (
                    <label key={key} className="chip" data-checked={checked}>
                      <input
                        type="radio"
                        name="tiempos"
                        value={key}
                        checked={checked}
                        onChange={() => setTiming(key)}
                        className="chip__input"
                      />
                      <span className="chip__mark chip__mark--dot" aria-hidden="true" />
                      <span className="chip__label">{t(key)}</span>
                    </label>
                  );
                })}
              </Group>

              <Field
                id={`${fieldId}-message`}
                label={t("contact.messageLabel")}
                hint={t("contact.messageHint")}
                counter={t("contact.counter", { count: message.length, max: MESSAGE_MAX })}
              >
                <textarea
                  id={`${fieldId}-message`}
                  name="mensaje"
                  rows={4}
                  maxLength={MESSAGE_MAX}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  aria-describedby={`${fieldId}-message-hint`}
                  className={`${inputClasses} resize-y`}
                />
              </Field>

              {whatsappUrl ? (
                <div className="flex flex-wrap items-center gap-3">
                  <ActionButton type="submit">
                    <WhatsappGlyph />
                    {t("contact.submit")}
                  </ActionButton>
                  <ActionButton
                    type="button"
                    variant="ghost"
                    onClick={copyMessage}
                    disabled={!hasDraft}
                    aria-live="polite"
                  >
                    {copied ? t("contact.copied") : t("contact.copy")}
                  </ActionButton>
                </div>
              ) : (
                <p
                  className="rounded-[var(--r-panel)] border border-[var(--border-strong)] px-4 py-3 text-[0.875rem] text-muted"
                  role="status"
                >
                  {t("contact.numberMissing")}
                </p>
              )}
            </form>
          </div>

          <ChatPreview
            title={t("contact.previewTitle")}
            hint={t("contact.previewHint")}
            online={t("contact.previewOnline")}
            reply={t("contact.previewReply")}
            body={hasDraft ? composed : null}
            empty={t("contact.previewEmpty")}
          />
        </div>
      </div>
    </section>
  );
}

// Los campos también son vidrio: el formulario no puede ser la única
// parte de la página hecha de otro material.
const inputClasses = [
  "lg lg--flush lg-motion w-full rounded-[var(--r-card)]",
  "px-4 py-3 text-ink",
  "min-h-12 placeholder:text-faint",
  "hover:[--glass-tint:var(--glass-tint-strong)]",
  "focus:[--glass-tint:var(--glass-tint-strong)]",
].join(" ");

function Field({
  id,
  label,
  hint,
  counter,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  counter?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {/* Etiqueta siempre visible: el placeholder desaparece al escribir
          y deja al usuario sin saber qué pedía el campo. */}
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      {children}
      <div className="mt-2 flex items-baseline justify-between gap-4">
        {hint ? (
          <p id={`${id}-hint`} className="text-[0.8125rem] text-faint">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {counter ? (
          <span className="shrink-0 font-mono text-[0.75rem] tabular-nums text-faint">
            {counter}
          </span>
        ) : null}
      </div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-[var(--accent-to)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Grupo de fichas: un fieldset con la etiqueta como leyenda. */
function Group({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset id={id} className="min-w-0 border-0 p-0" aria-describedby={error ? `${id}-error` : undefined}>
      <legend className="mb-3 flex items-baseline gap-3 text-[0.9375rem] font-medium text-ink">
        {label}
        {hint ? <span className="text-[0.8125rem] font-normal text-faint">{hint}</span> : null}
      </legend>
      <div className="chips">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-[var(--accent-to)]">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}

/** El mensaje tal como llegará, montado mientras se escribe. */
function ChatPreview({
  title,
  hint,
  online,
  reply,
  body,
  empty,
}: {
  title: string;
  hint: string;
  online: string;
  reply: string;
  body: string | null;
  empty: string;
}) {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  return (
    <aside className="mt-14 lg:mt-0 lg:sticky lg:top-28" data-drift="10">
      <h3 className="t-h3 text-[1.25rem]">{title}</h3>
      <p className="mt-2 text-[0.8125rem] text-faint">{hint}</p>

      <div className="chat lg lg--panel lg--refract mt-6">
        <div className="chat__head">
          <span className="chat__avatar">
            <SolarMark size={22} />
          </span>
          <span>
            <span className="block text-[0.9375rem] font-semibold leading-tight text-ink">
              Kavento
            </span>
            <span className="block text-[0.75rem] text-leaf">{online}</span>
          </span>
        </div>

        <div className="chat__body">
          {body ? (
            <>
              <div className="chat__row chat__row--out">
                <p className="chat__bubble chat__bubble--out">
                  {body.split("\n").map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                  <span className="chat__meta">
                    {time}
                    <TicksGlyph />
                  </span>
                </p>
              </div>
              <div className="chat__row">
                <p className="chat__bubble chat__bubble--in">
                  {reply}
                  <span className="chat__meta">{time}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="chat__row">
              <p className="chat__bubble chat__bubble--in chat__bubble--empty">{empty}</p>
            </div>
          )}
          {!body ? (
            <div className="chat__row chat__row--out" aria-hidden="true">
              <span className="chat__typing">
                <span />
                <span />
                <span />
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function TicksGlyph() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden="true">
      <path
        d="M1 5.5l3 3L10 2.5M6 8.5l3 0.01L15 2.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
