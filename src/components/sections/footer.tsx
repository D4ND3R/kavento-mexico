"use client";

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
              className="mt-4 inline-block text-[0.9375rem] text-muted underline decoration-[var(--border-strong)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-teal hover:decoration-teal"
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

          <FooterColumn title={t("services.title")}>
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
              className="transition-colors duration-[var(--dur-fast)] hover:text-muted"
              title={t("footer.privacyPlaceholder")}
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

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-[0.9375rem] font-semibold text-ink">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">{children}</ul>
    </nav>
  );
}

function FooterLink({
  children,
  ...rest
}: React.ComponentPropsWithoutRef<"a">) {
  return (
    <li>
      <a
        className="text-[0.9375rem] text-muted transition-colors duration-[var(--dur-fast)] hover:text-ink"
        {...rest}
      >
        {children}
      </a>
    </li>
  );
}
