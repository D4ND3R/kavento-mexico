"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { LanguageToggle } from "@/components/ui/language-toggle";
import { Logo } from "@/components/ui/logo";
import { useTranslations } from "@/lib/i18n/provider";
import { navSections } from "@/lib/site";

type Blob = { left: number; width: number; visible: boolean };

const HIDDEN: Blob = { left: 0, width: 0, visible: false };

/**
 * Navbar de vidrio.
 *
 * El indicador que sigue al cursor son DOS gotas: una rápida que va
 * pegada al cursor y otra lenta que se queda atrás. Bajo el filtro
 * `#lg-goo` las dos se unen por un cuello mientras se separan, así que
 * el indicador se estira como líquido en lugar de deslizarse como un
 * rectángulo. Cuando llegan al mismo sitio, el cuello desaparece y
 * vuelve a ser una sola pastilla.
 */
export function Navbar() {
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);
  const [blob, setBlob] = useState<Blob>(HIDDEN);
  const listRef = useRef<HTMLUListElement>(null);

  const follow = useCallback((event: React.PointerEvent<HTMLAnchorElement>) => {
    const link = event.currentTarget;
    const list = listRef.current;
    if (!list) return;
    setBlob({
      left: link.offsetLeft,
      width: link.offsetWidth,
      visible: true,
    });
  }, []);

  const release = useCallback(() => setBlob(HIDDEN), []);

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

      <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-5">
        <div className="u-shell flex items-center justify-between gap-3">
          <a
            href="#top"
            aria-label="Kavento México"
            className="lg lg--refract lg-motion lg-press flex items-center gap-2.5 px-3.5 py-2.5"
          >
            <Logo />
          </a>

          <nav
            className="lg lg--refract lg-motion hidden p-1.5 md:block"
            aria-label={t("nav.sectionsLabel")}
          >
            <ul
              ref={listRef}
              onPointerLeave={release}
              className="relative flex items-center"
            >
              {/*
                Capa de gotas. El filtro va SOLO aquí: `filter` afecta a
                todo el subárbol, así que si envolviera también a los
                enlaces les borraría el texto.
              */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{ filter: "url(#lg-goo)" }}
              >
                {/* Gota lenta: se queda atrás y forma el cuello. */}
                <span
                  className="absolute inset-y-0 rounded-[var(--r-pill)] bg-[rgba(255,244,232,0.18)]"
                  style={{
                    left: blob.left,
                    width: blob.width,
                    opacity: blob.visible ? 1 : 0,
                    transition:
                      "left 900ms var(--ease-liquid), width 900ms var(--ease-liquid), opacity 340ms linear",
                  }}
                />
                {/* Gota rápida: llega primero. */}
                <span
                  className="absolute inset-y-0 rounded-[var(--r-pill)] bg-[rgba(255,244,232,0.18)]"
                  style={{
                    left: blob.left,
                    width: blob.width,
                    opacity: blob.visible ? 1 : 0,
                    transition:
                      "left 420ms var(--ease-liquid), width 420ms var(--ease-liquid), opacity 200ms linear",
                  }}
                />
              </span>

              {navSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onPointerEnter={follow}
                    onFocus={(event) => {
                      const link = event.currentTarget;
                      setBlob({
                        left: link.offsetLeft,
                        width: link.offsetWidth,
                        visible: true,
                      });
                    }}
                    onBlur={release}
                    className="relative block rounded-[var(--r-pill)] px-4 py-2 text-[0.9375rem] text-muted transition-colors duration-[var(--dur-base)] hover:text-ink"
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
              className="lg lg-motion lg-press flex size-12 items-center justify-center text-muted transition-colors duration-[var(--dur-fast)] hover:text-ink md:hidden"
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <MenuGlyph open={menuOpen} />
            </button>
          </div>
        </div>

        <div className="u-shell">
          <nav
            id="menu-movil"
            hidden={!menuOpen}
            className="lg lg--panel lg--refract mt-2 p-2 md:hidden"
            aria-label={t("nav.sectionsLabel")}
          >
            <ul className="flex flex-col">
              {navSections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-[var(--r-card)] px-4 py-3.5 text-ink transition-colors duration-[var(--dur-fast)] hover:bg-[rgba(255,244,232,0.07)]"
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
  const line = {
    transformOrigin: "center",
    transition: "transform var(--dur-base) var(--ease-liquid), y var(--dur-base)",
  } as const;

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
        style={{ ...line, transform: open ? "rotate(45deg)" : "none" }}
      />
      <line
        x1="2.5"
        y1={open ? "10" : "13.5"}
        x2="17.5"
        y2={open ? "10" : "13.5"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ ...line, transform: open ? "rotate(-45deg)" : "none" }}
      />
    </svg>
  );
}
