"use client";

import { useEffect, useState } from "react";

import { SolarMark } from "@/components/ui/logo";

/**
 * Pantalla de carga.
 *
 * Estructura tomada de palmo.co.in: paneles sobredimensionados
 * (160vh de alto, 58% de ancho) que se apartan girando desde su canto
 * exterior. Van más grandes que la pantalla a propósito, para que al
 * plegarse no asome ningún hueco por las esquinas.
 *
 * Salen en cascada —primero los de atrás, luego los de enfrente— así
 * que la página no aparece de golpe sino por capas.
 *
 * La barra avanza sola mientras el documento carga y salta a 100 al
 * dispararse `load`. No finge un progreso real de descarga; solo
 * ocupa la espera, que es para lo que sirve.
 */
export function Loader() {
  const [progress, setProgress] = useState(8);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.dataset.loading = "true";

    let value = 8;
    const tick = window.setInterval(() => {
      value = Math.min(92, value + 6 + Math.random() * 11);
      setProgress(value);
    }, 140);

    let hideTimer = 0;

    function finish() {
      window.clearInterval(tick);
      setProgress(100);
      setDone(true);
      hideTimer = window.setTimeout(() => {
        setHidden(true);
        delete document.body.dataset.loading;
      }, 1500);
    }

    let readyTimer = 0;
    if (document.readyState === "complete") {
      readyTimer = window.setTimeout(finish, 500);
    } else {
      window.addEventListener("load", finish, { once: true });
    }

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hideTimer);
      window.clearTimeout(readyTimer);
      window.removeEventListener("load", finish);
      delete document.body.dataset.loading;
    };
  }, []);

  return (
    <div
      className="loader"
      data-done={done}
      data-hidden={hidden}
      // Es una espera, no contenido: se anuncia como estado, no se lee.
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      <div className="loader__panel loader__panel--back loader__panel--left" />
      <div className="loader__panel loader__panel--back loader__panel--right" />
      <div className="loader__panel loader__panel--front loader__panel--left" />
      <div className="loader__panel loader__panel--front loader__panel--right" />

      <div className="loader__mark">
        <SolarMark size={54} />
        <span className="loader__bar">
          <span className="loader__fill" style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  );
}
