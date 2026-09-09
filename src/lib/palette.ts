/**
 * Puente entre los design tokens de globals.css y three.js.
 *
 * Las escenas 3D no llevan colores propios: los leen de las variables
 * CSS en tiempo de ejecución, así que cambiar la paleta en :root también
 * cambia el 3D. Los valores de respaldo solo actúan durante el SSR, donde
 * no hay documento que consultar.
 */

export type Palette = {
  ember: string;
  solar: string;
  teal: string;
  ink: string;
  base: string;
  surface: string;
  muted: string;
  faint: string;
};

const FALLBACK: Palette = {
  ember: "#ff7a1a",
  solar: "#ffc94a",
  teal: "#2fa8b8",
  ink: "#f5efe6",
  base: "#120e0a",
  surface: "#1d1712",
  muted: "#b5a995",
  faint: "#7d7365",
};

export function readPalette(): Palette {
  if (typeof window === "undefined") return FALLBACK;

  const styles = getComputedStyle(document.documentElement);
  const pick = (token: string, fallback: string) =>
    styles.getPropertyValue(token).trim() || fallback;

  return {
    ember: pick("--accent-from", FALLBACK.ember),
    solar: pick("--accent-to", FALLBACK.solar),
    teal: pick("--accent-teal", FALLBACK.teal),
    ink: pick("--text-primary", FALLBACK.ink),
    base: pick("--bg-primary", FALLBACK.base),
    surface: pick("--bg-surface", FALLBACK.surface),
    muted: pick("--text-muted", FALLBACK.muted),
    faint: pick("--text-faint", FALLBACK.faint),
  };
}
