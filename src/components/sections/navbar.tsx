"use client";

import { useEffect, useState } from "react";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { useHasScrolled } from "@/lib/hooks";
import { useTranslations } from "@/lib/i18n/provider";
import { navSections } from "@/lib/site";

/**
 * Navbar flotante. Empieza sin fondo sobre el hero y gana el vidrio en
 * cuanto la página se despega del tope, así el sol no queda tapado por
 * una barra opaca al cargar.
 */
export function Navbar() {
  const t = useTranslations();
  const scrolled = useHasScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // Escape cierra el menú móvil, como cualquier capa superpuesta.
  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[var(--r-pill)] focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-base"
      >
        {t("nav.skip")}
      </a>

      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
        <div className="u-shell">
          <div
            className={[
              "flex items-center justify-between gap-3 rounded-[var(--r-pill)] px-3 py-2 sm:px-4",
              "transition-all duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
              scrolled || menuOpen
                ? "u-glass"
                : "border border-transparent bg-transparent",
            ].join(" ")}
          >
            <a
              href="#top"
              className="rounded-[var(--r-pill)] px-1 py-1"
              aria-label="Kavento México"
            >
              <Logo />
            </a>

            <nav className="hidden md:block" aria-label={t("nav.sectionsLabel")}>
              <ul className="flex items-center gap-1">
                {navSections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="block rounded-[var(--r-pill)] px-3.5 py-2 text-[0.9375rem] text-muted transition-colors duration-[var(--dur-fast)] hover:text-ink"
                    >
                      {t(section.key)}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="flex items-center gap-2">
              <LanguageToggle />

              <button
                type="button"
                className="flex size-11 items-center justify-center rounded-[var(--r-pill)] text-muted transition-colors duration-[var(--dur-fast)] hover:text-ink md:hidden"
                aria-expanded={menuOpen}
                aria-controls="menu-movil"
                aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <MenuGlyph open={menuOpen} />
              </button>
            </div>
          </div>

          <nav
            id="menu-movil"
            hidden={!menuOpen}
            className="u-glass mt-2 rounded-2xl p-2 md:hidden"
            aria-label={t("nav.sectionsLabel")}
          >
            <ul className="flex flex-col">
              {navSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-4 py-3.5 text-ink transition-colors duration-[var(--dur-fast)] hover:bg-[var(--bg-elevated)]"
                  >
                    {t(section.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
    </>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <line
        x1="2.5"
        y1={open ? "10" : "6.5"}
        x2="17.5"
        y2={open ? "10" : "6.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{
          transform: open ? "rotate(45deg)" : "none",
          transformOrigin: "center",
          transition: "transform var(--dur-base) var(--ease-out-expo), y var(--dur-base)",
        }}
      />
      <line
        x1="2.5"
        y1={open ? "10" : "13.5"}
        x2="17.5"
        y2={open ? "10" : "13.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{
          transform: open ? "rotate(-45deg)" : "none",
          transformOrigin: "center",
          transition: "transform var(--dur-base) var(--ease-out-expo), y var(--dur-base)",
        }}
      />
    </svg>
  );
}
