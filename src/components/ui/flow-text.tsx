import type { ReactNode } from "react";

/**
 * Texto que "fluye" al pasar el cursor: la etiqueta sube y sale por
 * arriba mientras una copia entra por abajo, dentro de una ventana
 * recortada. Es el gesto de los botones de altitude101 (dos spans
 * apilados, uno `translate-y-1/2` absoluto). Aquí van en una rejilla
 * de una celda, que es más simple de alinear.
 *
 * Lo dispara el ancestro con `.flow-host` (hover o foco visible), no
 * el propio texto, para que el botón entero sea la zona activa. La
 * copia va marcada como decorativa: los lectores de pantalla leen la
 * etiqueta una sola vez.
 */
export function FlowText({ children }: { children: ReactNode }) {
  return (
    <span className="flow">
      <span>{children}</span>
      <span aria-hidden="true">{children}</span>
    </span>
  );
}

/**
 * Envuelve en FlowText solo los hijos de texto: los iconos y demás
 * nodos se dejan como están.
 */
export function flowChildren(children: ReactNode): ReactNode {
  if (typeof children === "string" || typeof children === "number") {
    return <FlowText>{children}</FlowText>;
  }
  if (Array.isArray(children)) {
    return children.map((child, i) =>
      typeof child === "string" || typeof child === "number" ? (
        <FlowText key={i}>{child}</FlowText>
      ) : (
        child
      ),
    );
  }
  return children;
}
