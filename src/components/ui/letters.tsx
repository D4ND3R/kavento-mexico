"use client";

import { useEffect, useState } from "react";

/**
 * Parte un texto en letras para que cada una pueda reaccionar sola al
 * cursor.
 *
 * Partir texto en spans hace que los lectores de pantalla lo deletreen,
 * así que el bloque partido siempre va marcado como decorativo y el
 * texto completo se entrega aparte. Por eso este componente nunca se
 * usa suelto: va dentro de <SplitText>, que se encarga del par.
 */
function Letters({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((char, index) =>
        char === " " ? (
          <span key={index} className="h-letter" data-space="true">
            {" "}
          </span>
        ) : (
          <span key={index} className="h-letter">
            {char}
          </span>
        ),
      )}
    </>
  );
}

/**
 * Texto partido en letras, con su equivalente legible para lectores de
 * pantalla.
 */
export function SplitText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <>
      <span aria-hidden="true" className={className}>
        <Letters text={text} />
      </span>
      <span className="sr-only">{text}</span>
    </>
  );
}

/**
 * Rodillo de palabras del portafolio: la palabra clave del titular va
 * cambiando sola. La ventana mide una línea de alto, así que la palabra
 * que sale se va por arriba mientras la que entra llega por abajo.
 *
 * Tiempos del original: 2400 ms de espera, 450 ms de viaje y la curva
 * con rebote cubic-bezier(0.34, 1.56, 0.64, 1).
 */
export function RollingWord({
  words,
  hold = 2400,
  className,
}: {
  words: string[];
  hold?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % words.length);
    }, hold);

    return () => window.clearInterval(id);
  }, [words.length, hold]);

  return (
    <>
      <span aria-hidden="true" className={`roll-host ${className ?? ""}`}>
        <span
          className="roll-track"
          style={{ transform: `translateY(-${index * 1.08}em)` }}
        >
          {words.map((word) => (
            <span key={word} className="roll-word">
              <Letters text={word} />
            </span>
          ))}
        </span>
      </span>
      {/* Para lectores de pantalla la frase no cambia sola: se anuncia
          una vez, con todas las variantes separadas por comas. */}
      <span className="sr-only">{words.join(", ")}</span>
    </>
  );
}
