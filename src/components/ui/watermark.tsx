import type { ReactNode } from "react";

/**
 * Palabra enorme en trazo detrás de cada carta: el eco tipográfico del
 * KAVENTO 3D de la portada. Va marcada como decorativa (la sección ya
 * tiene su título) y deriva con el cursor más que el resto para que se
 * sienta lejos, en otro plano.
 */
export function Watermark({ children }: { children: ReactNode }) {
  return (
    <p className="watermark" aria-hidden="true" data-drift="28">
      {children}
    </p>
  );
}
