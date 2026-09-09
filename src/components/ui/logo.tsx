/**
 * Lockup de Kavento, reconstruido en vector a partir del logotipo original.
 *
 * Orden real del lockup: "Soluciones Digitales" en itálica arriba,
 * "KAVENTO" grande debajo y "México" en itálica alineado a la derecha.
 * El wordmark original va de negro a azul acero de izquierda a derecha;
 * sobre fondo oscuro ese extremo negro se invierte al blanco cálido de
 * la marca y se conserva el teal del final.
 *
 * El texto es texto real —no trazado— para que sea seleccionable,
 * escalable y legible por lectores de pantalla. Para sustituirlo por el
 * archivo del cliente, reemplaza este componente por
 * <Image src="/logo-kavento.svg" />.
 */
export function Logo({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "full";
  className?: string;
}) {
  if (variant === "compact") {
    // En la navbar solo cabe el disco y el wordmark.
    return (
      <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
        <SolarMark size={26} />
        <span className="wordmark text-[1.0625rem] leading-none">KAVENTO</span>
      </span>
    );
  }

  return (
    <span className={`flex items-start gap-3 ${className ?? ""}`}>
      <SolarMark size={54} />
      <span className="flex flex-col leading-none">
        <span
          className="wordmark text-[0.8125rem] italic"
          style={{ fontWeight: 700 }}
        >
          Soluciones Digitales
        </span>
        <span className="wordmark mt-1 text-[1.75rem] leading-none">
          KAVENTO
        </span>
        <span className="mt-1.5 self-end text-[0.8125rem] italic text-teal">
          México
        </span>
      </span>
    </span>
  );
}

/**
 * El disco solar. El degradado sube de naranja-rojo abajo a la izquierda
 * hasta amarillo arriba a la derecha, con bandas diagonales apenas
 * perceptibles que repiten las facetas del logotipo impreso.
 */
export function SolarMark({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className="shrink-0"
    >
      <defs>
        <linearGradient
          id="kv-sun"
          x1="6"
          y1="34"
          x2="34"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EF6A24" />
          <stop offset="0.55" stopColor="#F79A2A" />
          <stop offset="1" stopColor="#FFC94A" />
        </linearGradient>
        <linearGradient
          id="kv-facets"
          x1="6"
          y1="34"
          x2="34"
          y2="6"
          gradientUnits="userSpaceOnUse"
          spreadMethod="repeat"
        >
          <stop stopColor="#ffffff" stopOpacity="0.07" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.07" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="18" fill="url(#kv-sun)" />
      <circle cx="20" cy="20" r="18" fill="url(#kv-facets)" />
    </svg>
  );
}
