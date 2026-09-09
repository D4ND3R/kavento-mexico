"use client";

import { useId } from "react";

import { Logo } from "@/components/ui/logo";
import { useI18n } from "@/lib/i18n/provider";
import { serviceAnchor, serviceIds, serviceTitleKey } from "@/lib/services";
import { contactEmail, navSections, socialLinks } from "@/lib/site";

export function Footer() {
  const { t, locale } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border-subtle)] bg-surface">
      <div className="u-shell py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))] lg:gap-10">
          <div>
            <Logo variant="full" />
            <p className="t-body mt-6 max-w-[34ch] text-[0.9375rem]">
              {t("footer.tagline")}
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="mt-3 inline-block py-1 text-[0.9375rem] text-muted underline decoration-[var(--border-strong)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-teal hover:decoration-teal"
            >
              {contactEmail}
            </a>
          </div>

          <FooterColumn title={t("footer.navTitle")}>
            {navSections.map((section) => (
              <FooterLink key={section.id} href={`#${section.id}`}>
                {t(section.key)}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.servicesTitle")}>
            {serviceIds.map((id) => (
              <FooterLink key={id} href={`#${serviceAnchor(id)}`}>
                {t(serviceTitleKey(id))}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title={t("footer.socialTitle")}>
            {socialLinks.map((social) => (
              <FooterLink
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.label}
              </FooterLink>
            ))}
            <p className="pt-1 text-[0.75rem] text-faint">
              {t("footer.socialPlaceholder")}
            </p>
          </FooterColumn>
        </div>

        <hr className="u-rule mt-14 border-0" />

        <div className="mt-6 flex flex-col gap-3 text-[0.8125rem] text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Soluciones Digitales Kavento México. {t("footer.rights")}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/* MARCADOR: enlaza el aviso de privacidad cuando exista. */}
            <a
              href="#contacto"
              className="inline-block py-1 transition-colors duration-[var(--dur-fast)] hover:text-muted"
            >
              {t("footer.privacy")}
            </a>
            <span>{t("footer.madeIn")}</span>
            <span aria-hidden="true" className="uppercase tracking-wide">
              {locale}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/**
 * Columna del pie. El título es un párrafo, no un encabezado: tres h2
 * más en el pie ensucian la navegación por encabezados y uno de ellos
 * repetía el de la sección de servicios. La navegación real la da el
 * landmark <nav>, etiquetado por ese mismo título.
 */
function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <nav aria-labelledby={titleId}>
      <p id={titleId} className="text-[0.9375rem] font-semibold text-ink">
        {title}
      </p>
      <ul className="mt-3 flex flex-col">{children}</ul>
    </nav>
  );
}

/**
 * Enlace del pie. El py-1.5 lleva el objetivo a 31px de alto: WCAG 2.2
 * pide 24 como mínimo, y estos no son enlaces dentro de texto corrido
 * —donde aplica la excepción— sino una lista de navegación.
 */
function FooterLink({
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"a">) {
  return (
    <li>
      <a
        className="inline-block py-1.5 text-[0.9375rem] text-muted transition-colors duration-[var(--dur-fast)] hover:text-ink"
        {...rest}
      >
        {children}
      </a>
    </li>
  );
}
