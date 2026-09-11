import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { flowChildren } from "@/components/ui/flow-text";

type Variant = "solar" | "ghost";

/**
 * Botones y enlaces de acción, en vidrio.
 *
 * El primario no es un relleno naranja plano: es vidrio con un tinte
 * cálido y un halo, de modo que parece iluminado desde dentro. Es la
 * única pieza de la página que emite luz, así que destaca sin gritar
 * —y es coherente con las referencias de liquid glass, donde los
 * controles activos se tiñen en lugar de rellenarse.
 *
 * Alto mínimo 48px: cumple el objetivo táctil de 44px con holgura.
 *
 * Al pasar el cursor pasan tres cosas a la vez: la etiqueta fluye
 * (sube y entra una copia por abajo), un destello cruza el vidrio en
 * diagonal (.sheen) y el botón se deja atraer un poco hacia el cursor
 * (data-magnet, lo mueve el sistema de puntero).
 */
function classesFor(variant: Variant, extra?: string) {
  const shared = [
    "lg lg--refract lg-motion lg-press flow-host",
    "inline-flex items-center justify-center gap-2.5",
    "min-h-12 px-6 py-3",
    "text-[0.9375rem] font-semibold",
    "disabled:pointer-events-none disabled:opacity-55",
  ];

  const byVariant: Record<Variant, string[]> = {
    solar: [
      "text-solar",
      "[--glass-tint:rgba(255,122,26,0.16)]",
      "[--glass-edge-hi:rgba(255,201,74,0.68)]",
      "hover:[--glass-tint:rgba(255,122,26,0.26)]",
      "shadow-[0_10px_34px_-10px_rgba(255,122,26,0.5)]",
      "hover:shadow-[0_16px_46px_-12px_rgba(255,122,26,0.62)]",
      "hover:-translate-y-px",
    ],
    ghost: ["text-ink", "hover:[--glass-tint:var(--glass-tint-strong)]", "hover:-translate-y-px"],
  };

  return [...shared, ...byVariant[variant], extra ?? ""].join(" ");
}

export function ActionLink({
  variant = "solar",
  className,
  children,
  ...rest
}: { variant?: Variant; children: ReactNode } & ComponentPropsWithoutRef<"a">) {
  return (
    <a className={classesFor(variant, className)} data-magnet="14" {...rest}>
      {flowChildren(children)}
      <span className="sheen" aria-hidden="true" />
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
    <button className={classesFor(variant, className)} data-magnet="14" {...rest}>
      {flowChildren(children)}
      <span className="sheen" aria-hidden="true" />
    </button>
  );
}
