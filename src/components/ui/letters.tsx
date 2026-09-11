"use client";

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
