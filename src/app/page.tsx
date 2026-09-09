"use client";

import { Logo } from "@/components/ui/logo";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { useTranslations } from "@/lib/i18n/provider";

/**
 * Fase 1 — armazón verificable: tokens, tipografías e i18n.
 * Las secciones reales se montan en las fases siguientes.
 */
export default function Page() {
  const t = useTranslations();

  return (
    <main className="u-shell u-section flex min-h-screen flex-col justify-center gap-10">
      <Logo variant="full" />
      <h1 className="t-display">{t("hero.titleLine1")}</h1>
      <p className="t-lead">{t("hero.lead")}</p>
      <LanguageToggle className="self-start" />
    </main>
  );
}
