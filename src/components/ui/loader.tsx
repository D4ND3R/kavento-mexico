"use client";

import { useEffect, useState } from "react";

/**
 * Pantalla de carga.
 *
 * Coreografía de palmo.co.in: cuatro paneles sobredimensionados
 * (160vh de alto, 58% de ancho) que se apartan girando desde su canto
 * exterior, en dos tandas. Van más grandes que la pantalla a propósito,
 * para que al plegarse no asome ningún hueco por las esquinas.
 *
 * Donde palmo recorta un árbol con `clip-path: url(#loader-tree-clip)`,
 * aquí se recorta un sol: el disco de la marca con sus rayos. El
 * degradado solar se pinta detrás y el clip lo convierte en la figura,
 * así que el sol se llena con el mismo degradado del logotipo.
 */
export function Loader() {
  const [progress, setProgress] = useState(6);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.dataset.loading = "true";

    let value = 6;
    const tick = window.setInterval(() => {
      value = Math.min(94, value + 5 + Math.random() * 12);
      setProgress(value);
    }, 130);

    let hideTimer = 0;
    let readyTimer = 0;
    let finished = false;

    // Se espera a dos cosas: la ventana cargada y la escena 3D
    // maquetada (el HDRI, la fuente y las geometrías tardan más que el
    // HTML). Si la escena no avisa —WebGL apagado, por ejemplo— se
    // sigue igualmente a los 7 s: mejor una portada sin 3D que una
    // pantalla de carga eterna.
    let windowLoaded = document.readyState === "complete";
    let sceneReady = document.documentElement.dataset.sceneReady === "true";

    function finish() {
      if (finished) return;
      finished = true;
      window.clearInterval(tick);
      window.clearTimeout(readyTimer);
      setProgress(100);
      setDone(true);
      hideTimer = window.setTimeout(() => {
        setHidden(true);
        delete document.body.dataset.loading;
      }, 1700);
    }

    function check() {
      if (windowLoaded && sceneReady) {
        readyTimer = window.setTimeout(finish, 420);
      }
    }

    function onLoad() {
      windowLoaded = true;
      check();
    }

    function onScene() {
      sceneReady = true;
      check();
    }

    window.addEventListener("load", onLoad, { once: true });
    window.addEventListener("kavento:scene-ready", onScene, { once: true });
    const bailout = window.setTimeout(finish, 7000);
    check();

    return () => {
      window.clearInterval(tick);
      window.clearTimeout(hideTimer);
      window.clearTimeout(readyTimer);
      window.clearTimeout(bailout);
      window.removeEventListener("load", onLoad);
      window.removeEventListener("kavento:scene-ready", onScene);
      delete document.body.dataset.loading;
    };
  }, []);

  return (
    <div
      className="loader"
      data-done={done}
      data-hidden={hidden}
      role="status"
      aria-live="polite"
      aria-label="Cargando"
    >
      {/* Recorte del sol: disco central y doce rayos de largo desigual. */}
      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id="loader-sun-clip" clipPathUnits="objectBoundingBox">
            <path d="M0.5,0.12 L0.545,0.255 L0.66,0.17 L0.635,0.31 L0.775,0.28 L0.705,0.4 L0.85,0.44 L0.73,0.5 L0.85,0.56 L0.705,0.6 L0.775,0.72 L0.635,0.69 L0.66,0.83 L0.545,0.745 L0.5,0.88 L0.455,0.745 L0.34,0.83 L0.365,0.69 L0.225,0.72 L0.295,0.6 L0.15,0.56 L0.27,0.5 L0.15,0.44 L0.295,0.4 L0.225,0.28 L0.365,0.31 L0.34,0.17 L0.455,0.255 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="loader__panel loader__panel--back loader__panel--left" />
      <div className="loader__panel loader__panel--back loader__panel--right" />
      <div className="loader__panel loader__panel--front loader__panel--left" />
      <div className="loader__panel loader__panel--front loader__panel--right" />

      <div className="loader__mark">
        <span className="loader__sun" aria-hidden="true">
          <span className="loader__sun-fill" />
        </span>

        <span className="loader__bar">
          <span className="loader__fill" style={{ width: `${progress}%` }} />
        </span>
      </div>
    </div>
  );
}
