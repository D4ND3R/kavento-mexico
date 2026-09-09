/**
 * Lockup de Kavento reconstruido en vector desde el logo original:
 * disco solar con degradado ámbar→naranja, wordmark en la display,
 * descriptor en itálica y "México" en teal.
 *
 * El wordmark es texto real (no trazado) para que sea seleccionable,
 * escalable y accesible. Para sustituirlo por el archivo del cliente,
 * reemplaza este componente por un <Image src="/logo-kavento.svg" />.
 */
export function Logo({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "full";
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <SolarMark />
      <span className="flex flex-col leading-none">
        <span
          className="font-display text-[0.95rem] font-extrabold tracking-[0.14em] text-ink"
          style={{ fontFamily: "var(--font-display)" }}
        >
          KAVENTO
        </span>
        {variant === "full" ? (
          <span className="mt-1 flex items-baseline gap-1.5 text-[0.7rem] leading-none">
            <span className="italic text-muted">Soluciones Digitales</span>
            <span className="text-teal">México</span>
          </span>
        ) : null}
      </span>
    </span>
  );
}

/** El disco solar solo — se reutiliza como favicon y como acento gráfico. */
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
        <linearGradient id="kv-sun" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFC94A" />
          <stop offset="1" stopColor="#FF7A1A" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="14" fill="url(#kv-sun)" />
      <circle cx="20" cy="20" r="18.25" stroke="url(#kv-sun)" strokeOpacity="0.34" strokeWidth="1.5" />
    </svg>
  );
}
