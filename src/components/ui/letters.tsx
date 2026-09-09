"use client";

import { useEffect, useState } from "react";

/**
 * Parte un texto para que cada letra reaccione sola al cursor.
 *
 * Se agrupa por palabra y solo dentro de cada palabra se parte en
 * letras. Partir la frase entera en spans `inline-block` destruye los
 * límites de palabra y el navegador corta la línea donde le cabe:
 * "Construimos t / ecnología que". La palabra completa va en un
 * inline-block con `nowrap` y el espacio queda fuera, así el salto
 * vuelve a caer entre palabras.
 *
 * Partir texto en spans hace que los lectores de pantalla lo deletreen,
 * así que el bloque partido siempre va marcado como decorativo y el
 * texto completo se entrega aparte. Por eso este componente no se usa
 * suelto: va dentro de <SplitText>, que se encarga del par.
 */
function Letters({ text, reveal }: { text: string; reveal?: boolean }) {
  const words = text.split(" ");
  // Índice global de la letra, para escalonar el revelado.
  let cursor = 0;

  return (
    <>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} className="h-word">
          {Array.from(word).map((char, index) => {
            const order = cursor;
            cursor += 1;
            return (
              <span
                key={index}
                className={reveal ? "h-letter h-letter--reveal" : "h-letter"}
                style={reveal ? ({ ["--i" as string]: order } as React.CSSProperties) : undefined}
              >
                {char}
              </span>
            );
          })}
          {wordIndex < words.length - 1 ? (
            <span className="h-space"> </span>
          ) : null}
        </span>
      ))}
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
  reveal,
}: {
  text: string;
  className?: string;
  /** Escalona la entrada de cada letra cuando el bloque entra en vista. */
  reveal?: boolean;
}) {
  return (
    <>
      <span aria-hidden="true" className={className}>
        <Letters text={text} reveal={reveal} />
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
