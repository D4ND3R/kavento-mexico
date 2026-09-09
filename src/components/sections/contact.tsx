"use client";

import { useId, useMemo, useState, type FormEvent } from "react";

import { ActionButton } from "@/components/ui/action";
import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useTranslations } from "@/lib/i18n/provider";
import { serviceIds, serviceTitleKey } from "@/lib/services";
import { buildWhatsappUrl } from "@/lib/site";

type Errors = { name?: string; message?: string };

/**
 * Contacto.
 *
 * Kavento construye chatbots de WhatsApp, así que el formulario muestra
 * en vivo el mensaje que se va a enviar en lugar de describirlo: se ve
 * el producto en vez de leer sobre él. No hay backend — el botón abre
 * WhatsApp con el texto ya escrito.
 */
export function Contact() {
  const t = useTranslations();
  const fieldId = useId();

  const [name, setName] = useState("");
  const [service, setService] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  const serviceLabel = useMemo(() => {
    const match = serviceIds.find((id) => id === service);
    return match ? t(serviceTitleKey(match)) : t("contact.serviceOther");
  }, [service, t]);

  const composed = useMemo(
    () =>
      t("contact.waTemplate", {
        name: name.trim(),
        service: serviceLabel,
        message: message.trim(),
      }),
    [name, serviceLabel, message, t],
  );

  const hasDraft = name.trim().length > 0 || message.trim().length > 0;
  const whatsappUrl = buildWhatsappUrl(composed);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    if (!name.trim()) nextErrors.name = t("contact.errorName");
    if (!message.trim()) nextErrors.message = t("contact.errorMessage");

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      document.getElementById(nextErrors.name ? `${fieldId}-name` : `${fieldId}-message`)?.focus();
      return;
    }

    if (!whatsappUrl) return;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <section id="contacto" className="u-section relative">
      <div className="u-shell">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
          <div>
            <h2 className="t-h2">{t("contact.title")}</h2>
            <p className="t-lead mt-5">{t("contact.lead")}</p>

            <form onSubmit={handleSubmit} noValidate className="mt-10 flex flex-col gap-6">
              <Field
                id={`${fieldId}-name`}
                label={t("contact.nameLabel")}
                error={errors.name}
              >
                <input
                  id={`${fieldId}-name`}
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={t("contact.namePlaceholder")}
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? `${fieldId}-name-error` : undefined}
                  className={inputClasses}
                />
              </Field>

              <Field id={`${fieldId}-service`} label={t("contact.serviceLabel")}>
                <select
                  id={`${fieldId}-service`}
                  name="servicio"
                  value={service}
                  onChange={(event) => setService(event.target.value)}
                  className={inputClasses}
                >
                  <option value="">{t("contact.servicePlaceholder")}</option>
                  {serviceIds.map((id) => (
                    <option key={id} value={id}>
                      {t(serviceTitleKey(id))}
                    </option>
                  ))}
                  <option value="otro">{t("contact.serviceOther")}</option>
                </select>
              </Field>

              <Field
                id={`${fieldId}-message`}
                label={t("contact.messageLabel")}
                hint={t("contact.messageHint")}
                error={errors.message}
              >
                <textarea
                  id={`${fieldId}-message`}
                  name="mensaje"
                  rows={4}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={t("contact.messagePlaceholder")}
                  aria-invalid={errors.message ? true : undefined}
                  aria-describedby={[
                    `${fieldId}-message-hint`,
                    errors.message ? `${fieldId}-message-error` : null,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  className={`${inputClasses} resize-y`}
                />
              </Field>

              {whatsappUrl ? (
                <ActionButton type="submit" className="self-start">
                  <WhatsappGlyph />
                  {t("contact.submit")}
                </ActionButton>
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
            body={hasDraft ? composed : null}
            empty={t("contact.previewEmpty")}
          />
        </div>
      </div>
    </section>
  );
}

const inputClasses = [
  "w-full rounded-[var(--r-panel)] border border-[var(--border-subtle)]",
  "bg-surface px-4 py-3 text-ink",
  "min-h-12 placeholder:text-faint",
  "transition-colors duration-[var(--dur-fast)]",
  "hover:border-[var(--border-strong)] focus:border-teal",
].join(" ");

function Field({
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
    <div>
      {/* Etiqueta siempre visible: el placeholder desaparece al escribir
          y deja al usuario sin saber qué pedía el campo. */}
      <label htmlFor={id} className="mb-2 block text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="mt-2 text-[0.8125rem] text-faint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-[0.8125rem] text-[var(--accent-to)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** El mensaje tal como llegará, montado mientras se escribe. */
function ChatPreview({
  title,
  hint,
  body,
  empty,
}: {
  title: string;
  hint: string;
  body: string | null;
  empty: string;
}) {
  return (
    <aside className="mt-14 lg:mt-0 lg:sticky lg:top-[18vh] lg:self-start">
      <h3 className="t-h3 text-[1.25rem]">{title}</h3>
      <p className="mt-2 text-[0.8125rem] text-faint">{hint}</p>

      <div className="u-glass mt-6 rounded-[var(--r-panel)] p-5">
        <div className="flex justify-end">
          <p
            className="max-w-[92%] rounded-2xl rounded-br-md px-4 py-3 text-[0.9375rem] leading-relaxed"
            style={{
              background: body ? "var(--accent-teal)" : "var(--bg-elevated)",
              color: body ? "#08222a" : "var(--text-faint)",
            }}
          >
            {body ?? empty}
          </p>
        </div>
      </div>
    </aside>
  );
}
