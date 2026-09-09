"use client";

import type { ReactNode } from "react";

import { useScrollStack } from "@/lib/use-scroll-stack";

/**
 * Arranca el motor de apilado. Existe solo para que la página pueda
 * seguir siendo un componente de servidor: el motor necesita el DOM y
 * por tanto tiene que vivir en cliente.
 */
export function StackRoot({ children }: { children: ReactNode }) {
  useScrollStack();
  return <>{children}</>;
}
