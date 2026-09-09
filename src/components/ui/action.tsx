import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Variant = "solar" | "ghost";

/**
 * Botones y enlaces de acción.
 * Alto mínimo 48px para cumplir el objetivo táctil de 44px con holgura.
 * El texto dice qué pasa al usarlo; sin flechas decorativas pegadas.
 */
function classesFor(variant: Variant, extra?: string) {
  const shared = [
    "inline-flex items-center justify-center gap-2",
    "min-h-12 rounded-[var(--r-pill)] px-6 py-3",
    "text-[0.9375rem] font-semibold",
    "transition-[transform,box-shadow,color,border-color,background-color]",
    "duration-[var(--dur-base)] ease-[var(--ease-out-expo)]",
    "hover:-translate-y-px active:translate-y-0",
    "disabled:pointer-events-none disabled:opacity-55",
  ];

  const byVariant: Record<Variant, string[]> = {
    solar: [
      "text-base",
      "shadow-[0_10px_30px_-12px_var(--glow-warm)]",
      "hover:shadow-[0_16px_44px_-12px_rgba(255,122,26,0.45)]",
    ],
    ghost: [
      "border border-[var(--border-strong)] text-ink",
      "hover:border-teal hover:text-teal",
    ],
  };

  return [...shared, ...byVariant[variant], extra ?? ""].join(" ");
}

const solarBackground = { background: "var(--accent-gradient)" } as const;

export function ActionLink({
  variant = "solar",
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentPropsWithoutRef<"a">) {
  return (
    <a
      className={classesFor(variant, className)}
      style={variant === "solar" ? solarBackground : undefined}
      {...rest}
    >
      {children}
    </a>
  );
}

export function ActionButton({
  variant = "solar",
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentPropsWithoutRef<"button">) {
  return (
    <button
      className={classesFor(variant, className)}
      style={variant === "solar" ? solarBackground : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
