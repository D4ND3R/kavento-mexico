/**
 * Cresta: el corte entre dos secciones no es una recta.
 *
 * Cada sección apilada lleva una cresta arriba, del color de la propia
 * sección, colocada justo por encima de su borde superior. Al montarse
 * sobre la sección anterior, el filo que se ve es la silueta orgánica y
 * no una línea horizontal. Es la mecánica de `.t-wavy-crest` del
 * portafolio, dibujada en SVG en lugar de con un PNG de 3 MB.
 */

const SHAPES = {
  /** Ola larga y perezosa. */
  ola: "M0,96 C168,148 322,28 496,44 C664,60 786,132 952,116 C1108,101 1266,26 1440,62 L1440,160 L0,160 Z",
  /** Duna asimétrica, con la masa cargada a la derecha. */
  duna: "M0,132 C210,120 330,44 540,34 C742,24 858,96 1044,74 C1198,56 1298,8 1440,20 L1440,160 L0,160 Z",
  /** Cordillera de picos suaves. */
  sierra:
    "M0,58 C120,14 196,86 300,80 C408,74 470,20 586,38 C700,56 742,120 866,110 C986,100 1042,34 1164,44 C1286,54 1330,104 1440,88 L1440,160 L0,160 Z",
  /** Cresta baja, casi plana: cuando la anterior ya fue muy movida. */
  loma: "M0,116 C240,142 420,84 720,90 C1010,96 1188,144 1440,112 L1440,160 L0,160 Z",
} as const;

export type CrestShape = keyof typeof SHAPES;

export function Crest({
  shape,
  color,
}: {
  shape: CrestShape;
  /** Variable CSS del color de la sección a la que pertenece la cresta. */
  color: string;
}) {
  return (
    <div className="crest" aria-hidden="true">
      <svg viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path d={SHAPES[shape]} fill={color} />
      </svg>
    </div>
  );
}
