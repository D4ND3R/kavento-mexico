"use client";

import { WhatsappGlyph } from "@/components/ui/whatsapp-glyph";
import { useTranslations } from "@/lib/i18n/provider";
import { buildWhatsappUrl } from "@/lib/site";

/**
 * Acceso permanente a WhatsApp, visible en toda la página.
 * Si todavía no se configuró el número no se dibuja nada: mejor no
 * mostrar el botón que ofrecer un enlace roto.
 */
export function WhatsappFab() {
  const t = useTranslations();
  const url = buildWhatsappUrl(t("contact.waGreeting"));

  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t("contact.fabLabel")}
      className={[
        "wa-fab fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center",
        "rounded-[var(--r-pill)] text-base shadow-[0_12px_32px_-10px_rgba(255,122,26,0.55)]",
        "transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
        "hover:scale-105 sm:bottom-8 sm:right-8 flow-host overflow-hidden",
      ].join(" ")}
      data-magnet="18"
      style={{ background: "var(--accent-gradient)" }}
    >
      <WhatsappGlyph size={26} />
      <span className="sheen" aria-hidden="true" />
    </a>
  );
}
