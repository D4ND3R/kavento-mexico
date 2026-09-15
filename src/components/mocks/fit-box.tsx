"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Caja que encoge su contenido para que quepa.
 *
 * Las maquetas de servicio se maquetan a un tamaño de diseño fijo
 * (ancho × alto en px) y aquí se escalan con `transform: scale()` al
 * mayor factor con el que caben en el hueco disponible (como mucho
 * 1.15). Así en escritorio se ven a su tamaño y en un teléfono
 * se ven más pequeñas pero **enteras**: antes, con el hueco más bajo,
 * la tubería y la conversación se salían de la tarjeta o quedaban
 * cortadas por el `overflow: hidden`.
 *
 * Se mide con ResizeObserver y se escribe el factor directo al DOM:
 * no hay estado de React en el camino, y un cambio de tamaño no
 * vuelve a renderizar la maqueta.
 */
export function FitBox({
  width,
  height,
  children,
}: {
  /** Tamaño de diseño del contenido, en px. */
  width: number;
  height: number;
  children: ReactNode;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = outer.current;
    const content = inner.current;
    if (!box || !content) return;

    function fit() {
      if (!box || !content) return;
      // Hasta 1.15: en escritorio el hueco es algo mayor que el diseño y
      // la maqueta lo llena como antes; el texto se re-rasteriza, no se
      // ve borroso.
      const scale = Math.min(1.15, box.clientWidth / width, box.clientHeight / height);
      content.style.transform = `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
    }

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => observer.disconnect();
  }, [width, height]);

  return (
    <div ref={outer} className="relative h-full w-full overflow-hidden">
      <div
        ref={inner}
        className="absolute left-1/2 top-1/2"
        style={{
          width,
          height,
          transform: "translate(-50%, -50%)",
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
