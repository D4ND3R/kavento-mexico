"use client";

import { useEffect } from "react";

/**
 * Efectos de puntero: cursor propio y respuesta al clic.
 *
 * Son dos piezas que se persiguen. El punto va pegado al cursor y el
 * aro lo sigue con retraso, interpolando su posición cuadro a cuadro
 * (lerp 0.16). Esa diferencia de velocidad es la que da la sensación de
 * peso; si los dos fueran exactos, no se notaría nada.
 *
 * Sobre cualquier cosa interactiva el aro crece y se enciende. Al hacer
 * clic se suelta una onda que se expande y se apaga.
 *
 * Todo se escribe directo al DOM desde un solo rAF: mover el ratón
 * nunca provoca un render de React. En dispositivos táctiles y con
 * prefers-reduced-motion no se monta nada.
 */

const INTERACTIVE =
  'a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), .deck, .team-frame';

export function PointerFx() {
  useEffect(() => {
    // Sin cursor que decorar en pantallas táctiles.
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = document.createElement("div");
    dot.className = "cursor-dot";
    dot.setAttribute("aria-hidden", "true");

    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");

    document.body.append(dot, ring);
    document.body.dataset.cursor = "custom";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let ringX = targetX;
    let ringY = targetY;
    let frame = 0;
    let visible = false;

    function onMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;

      if (!visible) {
        visible = true;
        ringX = targetX;
        ringY = targetY;
        dot.dataset.on = "true";
        ring.dataset.on = "true";
      }

      // El punto no interpola: va exactamente donde está el cursor.
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;

      const overInteractive = (event.target as Element | null)?.closest?.(
        INTERACTIVE,
      );
      ring.dataset.active = String(Boolean(overInteractive));
    }

    function onLeave() {
      visible = false;
      dot.dataset.on = "false";
      ring.dataset.on = "false";
    }

    function onDown(event: PointerEvent) {
      ring.dataset.press = "true";

      // Onda de clic: se crea, se expande y se retira sola.
      const ripple = document.createElement("span");
      ripple.className = "cursor-ripple";
      ripple.setAttribute("aria-hidden", "true");
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), {
        once: true,
      });
    }

    function onUp() {
      ring.dataset.press = "false";
    }

    // El aro persigue al punto con retraso constante.
    function follow() {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      frame = requestAnimationFrame(follow);
    }
    frame = requestAnimationFrame(follow);

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      dot.remove();
      ring.remove();
      delete document.body.dataset.cursor;
    };
  }, []);

  return null;
}
