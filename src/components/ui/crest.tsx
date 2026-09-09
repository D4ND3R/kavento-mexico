/**
 * Cresta: el corte entre dos secciones no es una recta.
 *
 * Cada sección apilada lleva una cresta arriba, del color de la propia
 * sección, colocada justo por encima de su borde superior. Al montarse
 * sobre la sección anterior, el filo que se ve es una silueta y no una
 * línea horizontal. Es la mecánica de `.t-wavy-crest` del portafolio,
 * dibujada en SVG en lugar de con un PNG.
 *
 * Los perfiles son deliberadamente irregulares: amplitudes desiguales,
 * algún pico afilado y algún hundimiento. Una onda regular se lee como
 * un adorno de plantilla; una silueta rota se lee como terreno.
 */

const SHAPES = {
  /** Rompiente: sube en dos crestas desiguales y cae con un pico seco. */
  rompiente:
    "M0,118 C96,104 138,52 214,44 C286,36 318,88 386,80 C444,73 470,18 540,26 L566,8 L592,40 C664,52 690,110 772,100 C846,91 872,44 946,50 C1024,56 1050,116 1126,108 C1198,100 1224,54 1300,62 C1364,69 1388,104 1440,92 L1440,200 L0,200 Z",

  /** Duna partida: masa a la derecha con una muesca profunda a un tercio. */
  duna: "M0,150 C118,142 176,110 268,96 C338,85 372,120 424,112 L452,150 L470,104 C548,88 596,30 692,26 C792,22 828,86 918,84 C1012,82 1058,34 1152,40 C1244,46 1282,96 1356,88 C1396,84 1416,66 1440,58 L1440,200 L0,200 Z",

  /** Sierra: picos agudos de altura desigual, sin repetición. */
  sierra:
    "M0,96 L74,44 L128,82 C176,88 200,26 258,34 L312,6 L352,62 C410,74 436,114 496,104 L544,132 L604,72 C664,60 692,18 754,30 L800,4 L846,58 C902,70 928,116 990,106 L1040,134 L1096,68 C1152,56 1186,96 1240,90 L1300,46 L1348,88 C1392,96 1416,76 1440,64 L1440,200 L0,200 Z",

  /** Loma rota: casi plana pero con dos hendiduras que la desalinean. */
  loma: "M0,132 C160,146 246,120 348,116 L392,140 L436,110 C556,102 656,138 776,140 C880,142 934,116 1010,110 L1058,138 L1104,106 C1224,100 1330,140 1440,126 L1440,200 L0,200 Z",

  /** Desgarro: borde de papel rasgado, con muescas cortas y aleatorias. */
  desgarro:
    "M0,104 L58,92 L96,118 L152,86 L214,110 L262,74 L318,102 L390,80 L436,112 L498,84 L560,106 L618,72 L684,98 L742,78 L806,110 L864,86 L928,114 L992,82 L1052,106 L1116,76 L1178,104 L1240,88 L1304,116 L1366,90 L1440,108 L1440,200 L0,200 Z",
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
      <svg viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d={SHAPES[shape]} fill={color} />
      </svg>
    </div>
  );
}
