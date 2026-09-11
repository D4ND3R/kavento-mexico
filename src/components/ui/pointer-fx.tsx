"use client";

import { useEffect } from "react";

/**
 * Efectos de puntero: cursor propio, respuesta al clic y deriva.
 *
 * Son dos piezas que se persiguen. El punto va pegado al cursor y el
 * aro lo sigue con retraso, interpolando su posición cuadro a cuadro
 * (lerp 0.16). Esa diferencia de velocidad es la que da la sensación de
 * peso; si los dos fueran exactos, no se notaría nada.
 *
 * Sobre cualquier cosa interactiva el aro crece y se enciende. Al hacer
 * clic se suelta una onda que se expande y se apaga.
 *
 * Además, todo lo que lleve `data-drift` se desplaza unos píxeles
 * hacia donde está el cursor (paralaje: los textos y las fotos "miran"
 * al puntero), y lo que lleve `data-magnet` se deja atraer cuando el
 * cursor se le acerca. Se escribe en la propiedad `translate`, que se
 * compone con el `transform` que el elemento ya tenga (inclinaciones,
 * entradas escalonadas), y solo para lo que está en pantalla.
 *
 * Todo se escribe directo al DOM desde un solo rAF: mover el ratón
 * nunca provoca un render de React. En dispositivos táctiles y con
 * prefers-reduced-motion no se monta nada.
 */

const INTERACTIVE =
  'a[href], button, input, select, textarea, [role="button"], [tabindex]:not([tabindex="-1"]), .deck, .team-frame';

type DriftNode = {
  node: HTMLElement;
  drift: number;
  magnet: number;
  visible: boolean;
};

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
    let moved = false;

    /* --- deriva ---------------------------------------------------- */
    const drifters: DriftNode[] = [];
    const byNode = new Map<Element, DriftNode>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const item = byNode.get(entry.target);
          if (item) item.visible = entry.isIntersecting;
        }
      },
      { rootMargin: "10% 0px" },
    );

    function collect() {
      const nodes = document.querySelectorAll<HTMLElement>("[data-drift], [data-magnet]");
      for (const node of nodes) {
        if (byNode.has(node)) continue;
        const item: DriftNode = {
          node,
          drift: Number(node.dataset.drift ?? 0) || 0,
          magnet: Number(node.dataset.magnet ?? 0) || 0,
          visible: false,
        };
        drifters.push(item);
        byNode.set(node, item);
        observer.observe(node);
      }
    }

    collect();
    // Lo que se monta tarde (el lienzo, capas dinámicas) se recoge
    // después.
    const recollect = window.setTimeout(collect, 1500);
    window.addEventListener("kavento:scene-ready", collect);

    function updateDrift() {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;

      for (let i = 0; i < drifters.length; i += 1) {
        const item = drifters[i];
        if (!item.visible) continue;

        const rect = item.node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let tx = 0;
        let ty = 0;

        if (item.drift) {
          const nx = Math.max(-1, Math.min(1, (targetX - cx) / halfW));
          const ny = Math.max(-1, Math.min(1, (targetY - cy) / halfH));
          tx += nx * item.drift;
          ty += ny * item.drift;
        }

        if (item.magnet) {
          const dx = targetX - cx;
          const dy = targetY - cy;
          const dist = Math.hypot(dx, dy);
          const radius = Math.max(rect.width, rect.height) * 0.9 + 70;
          if (dist < radius && dist > 0.5) {
            const pull = (1 - dist / radius) * item.magnet;
            tx += (dx / dist) * pull;
            ty += (dy / dist) * pull;
          }
        }

        item.node.style.translate = `${tx.toFixed(1)}px ${ty.toFixed(1)}px`;
      }
    }

    /* --- cursor ---------------------------------------------------- */
    function onMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
      moved = true;

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

    // El aro persigue al punto con retraso constante; la deriva solo
    // se recalcula cuando el cursor se movió (o la página se desplazó).
    function follow() {
      ringX += (targetX - ringX) * 0.16;
      ringY += (targetY - ringY) * 0.16;
      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      if (moved) {
        moved = false;
        updateDrift();
      }
      frame = requestAnimationFrame(follow);
    }
    frame = requestAnimationFrame(follow);

    function onScroll() {
      moved = true;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(recollect);
      window.removeEventListener("kavento:scene-ready", collect);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerleave", onLeave);
      observer.disconnect();
      for (const item of drifters) item.node.style.translate = "";
      dot.remove();
      ring.remove();
      delete document.body.dataset.cursor;
    };
  }, []);

  return null;
}
