"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import type * as THREE from "three";

import { readPalette, type Palette } from "@/lib/palette";

/* ==================================================================
   Un solo motor de animación, cinco juegos de datos.

   Cada escena describe sus piezas: dónde están cuando el modelo está
   armado y hacia dónde se van al abrirse. El avance del scroll (0 a 1)
   se convierte en sin(p * PI), así que el modelo se descompone a la
   mitad del recorrido y se vuelve a ensamblar al final. Nunca queda
   desarmado en reposo.
   ================================================================== */

export type SceneProps = { progress: RefObject<number> };

type Tone = keyof Palette;

type Piece = {
  kind: "box" | "ring" | "sphere";
  /** box: [ancho, alto, fondo] · ring: [radio, grosor] · sphere: [radio] */
  args: number[];
  /** Posición con el modelo armado. */
  at: [number, number, number];
  /** Desplazamiento que aplica al descomponerse. */
  drift: [number, number, number];
  tone: Tone;
  /** Giro continuo sobre Z, en radianes por segundo. */
  spin?: number;
  glow?: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** 0 armado, 1 abierto, 0 armado otra vez. */
const spreadOf = (p: number) => Math.sin(clamp01(p) * Math.PI);

/** Luz compartida: cae desde arriba a la izquierda, como el sol del hero. */
export function SceneLights() {
  const palette = useMemo(() => readPalette(), []);
  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[-3.4, 4.2, 5]}
        intensity={2.6}
        color={palette.solar}
      />
      <pointLight
        position={[4, -2.4, 3.2]}
        intensity={16}
        distance={16}
        color={palette.teal}
      />
    </>
  );
}

function Assembly({
  pieces,
  progress,
}: {
  pieces: Piece[];
  progress: RefObject<number>;
}) {
  const palette = useMemo(() => readPalette(), []);
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Object3D | null)[]>([]);

  useFrame((_state, delta) => {
    const p = clamp01(progress.current);

    if (group.current) {
      // El conjunto gira un poco con el scroll: da volumen sin marear.
      group.current.rotation.y = (p - 0.5) * 0.72;
      group.current.rotation.x = -0.14 + spreadOf(p) * 0.12;
    }

    for (let i = 0; i < pieces.length; i += 1) {
      const node = nodes.current[i];
      const piece = pieces[i];
      if (!node) continue;

      // Cada pieza va un poco retrasada respecto a la anterior: el modelo
      // se arma en secuencia en lugar de aparecer de golpe.
      const staggered = spreadOf((p - i * 0.03) / 0.92);

      node.position.set(
        piece.at[0] + piece.drift[0] * staggered,
        piece.at[1] + piece.drift[1] * staggered,
        piece.at[2] + piece.drift[2] * staggered,
      );

      if (piece.spin) node.rotation.z += delta * piece.spin;
    }
  });

  return (
    <group ref={group}>
      {pieces.map((piece, index) => {
        const color = palette[piece.tone];
        const assign = (node: THREE.Object3D | null) => {
          nodes.current[index] = node;
        };

        const material = (
          <meshStandardMaterial
            color={color}
            roughness={piece.glow ? 0.85 : 0.38}
            metalness={piece.glow ? 0 : 0.18}
            emissive={piece.glow ? color : "#000000"}
            emissiveIntensity={piece.glow ? 0.75 : 0}
          />
        );

        if (piece.kind === "box") {
          return (
            <RoundedBox
              key={index}
              ref={assign}
              args={[piece.args[0], piece.args[1], piece.args[2]]}
              radius={Math.min(0.06, piece.args[1] / 2.6)}
              smoothness={3}
              position={piece.at}
            >
              {material}
            </RoundedBox>
          );
        }

        if (piece.kind === "ring") {
          return (
            <mesh key={index} ref={assign} position={piece.at}>
              <torusGeometry args={[piece.args[0], piece.args[1], 10, 28]} />
              {material}
            </mesh>
          );
        }

        return (
          <mesh key={index} ref={assign} position={piece.at}>
            <sphereGeometry args={[piece.args[0], 20, 20]} />
            {material}
          </mesh>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------
   Desarrollo web: las capas de una página se separan en el eje Z.
   ------------------------------------------------------------------ */
const WEB_PIECES: Piece[] = [
  { kind: "box", args: [3.3, 2.1, 0.1], at: [0, 0, 0], drift: [0, 0, -0.5], tone: "surface" },
  { kind: "box", args: [3.0, 0.24, 0.07], at: [0, 0.82, 0.1], drift: [0, 0.3, 0.55], tone: "base" },
  { kind: "box", args: [1.55, 0.9, 0.07], at: [-0.68, 0.14, 0.1], drift: [-0.5, 0.12, 1.1], tone: "ember", glow: true },
  { kind: "box", args: [1.1, 0.24, 0.07], at: [0.78, 0.36, 0.1], drift: [0.55, 0.2, 1.5], tone: "ink" },
  { kind: "box", args: [1.1, 0.24, 0.07], at: [0.78, -0.02, 0.1], drift: [0.6, -0.05, 1.9], tone: "ink" },
  { kind: "box", args: [0.72, 0.26, 0.07], at: [-0.98, -0.66, 0.1], drift: [-0.4, -0.5, 2.3], tone: "teal", glow: true },
];

export function WebScene({ progress }: SceneProps) {
  return <Assembly pieces={WEB_PIECES} progress={progress} />;
}

/* ------------------------------------------------------------------
   Automatización: engranajes y nodos encadenados por enlaces.
   ------------------------------------------------------------------ */
const AUTOMATION_PIECES: Piece[] = [
  { kind: "ring", args: [0.62, 0.14], at: [-1.15, 0.62, 0], drift: [-0.9, 0.75, 0], tone: "ember", spin: 0.5 },
  { kind: "ring", args: [0.42, 0.11], at: [0.05, 1.0, -0.2], drift: [0.15, 1.05, -0.6], tone: "solar", spin: -0.75 },
  { kind: "sphere", args: [0.2], at: [-1.5, -0.55, 0.2], drift: [-1.1, -0.7, 0.5], tone: "teal", glow: true },
  { kind: "box", args: [0.95, 0.06, 0.06], at: [-0.92, -0.55, 0.2], drift: [-0.2, -0.35, 0.9], tone: "ink" },
  { kind: "sphere", args: [0.2], at: [-0.32, -0.55, 0.2], drift: [0, -0.5, 0.5], tone: "teal", glow: true },
  { kind: "box", args: [0.95, 0.06, 0.06], at: [0.28, -0.55, 0.2], drift: [0.35, -0.3, 0.9], tone: "ink" },
  { kind: "sphere", args: [0.2], at: [0.88, -0.55, 0.2], drift: [0.9, -0.45, 0.5], tone: "teal", glow: true },
  { kind: "box", args: [0.62, 0.06, 0.06], at: [1.38, -0.55, 0.2], drift: [1.15, -0.25, 0.9], tone: "ink" },
  { kind: "sphere", args: [0.26], at: [1.86, -0.55, 0.2], drift: [1.5, -0.4, 0.5], tone: "ember", glow: true },
];

export function AutomationScene({ progress }: SceneProps) {
  return <Assembly pieces={AUTOMATION_PIECES} progress={progress} />;
}

/* ------------------------------------------------------------------
   Apps a la medida: un dispositivo cuyas capas de interfaz flotan.
   ------------------------------------------------------------------ */
const SOFTWARE_PIECES: Piece[] = [
  { kind: "box", args: [1.5, 2.7, 0.16], at: [0, 0, 0], drift: [0, 0, -0.45], tone: "surface" },
  { kind: "box", args: [1.28, 0.5, 0.07], at: [0, 0.92, 0.12], drift: [-0.75, 0.65, 0.85], tone: "ember", glow: true },
  { kind: "box", args: [1.28, 0.62, 0.07], at: [0, 0.2, 0.12], drift: [0.85, 0.3, 1.25], tone: "base" },
  { kind: "box", args: [0.58, 0.58, 0.07], at: [-0.34, -0.62, 0.12], drift: [-0.95, -0.75, 1.7], tone: "teal", glow: true },
  { kind: "box", args: [0.58, 0.58, 0.07], at: [0.34, -0.62, 0.12], drift: [0.95, -0.6, 2.05], tone: "ink" },
  { kind: "box", args: [0.66, 0.1, 0.07], at: [0, -1.16, 0.12], drift: [0.2, -1.0, 2.4], tone: "faint" },
];

export function SoftwareScene({ progress }: SceneProps) {
  return <Assembly pieces={SOFTWARE_PIECES} progress={progress} />;
}

/* ------------------------------------------------------------------
   Chatbots: las burbujas emergen y se ordenan en conversación.
   El teal marca lo que responde el bot; el ámbar, lo que escribe la
   persona. No se reproduce el logotipo de WhatsApp: se sugiere la
   forma de la conversación con los colores de la marca.
   ------------------------------------------------------------------ */
const CHAT_PIECES: Piece[] = [
  { kind: "box", args: [1.5, 0.44, 0.12], at: [-0.62, 1.05, 0], drift: [-1.4, 0.9, -0.8], tone: "surface" },
  { kind: "box", args: [1.7, 0.44, 0.12], at: [0.5, 0.42, 0.1], drift: [1.5, 0.7, 0.7], tone: "teal", glow: true },
  { kind: "box", args: [1.9, 0.44, 0.12], at: [-0.44, -0.22, 0.2], drift: [-1.6, -0.35, 1.1], tone: "surface" },
  { kind: "box", args: [1.35, 0.44, 0.12], at: [0.72, -0.86, 0.3], drift: [1.7, -0.7, 1.5], tone: "ember", glow: true },
  { kind: "box", args: [0.6, 0.3, 0.12], at: [-1.06, -1.44, 0.4], drift: [-1.3, -1.2, 1.9], tone: "surface" },
];

export function ChatScene({ progress }: SceneProps) {
  return <Assembly pieces={CHAT_PIECES} progress={progress} />;
}

/* ------------------------------------------------------------------
   IA privada: una red de nodos que se reconfigura.
   ------------------------------------------------------------------ */
const AI_PIECES: Piece[] = [
  { kind: "sphere", args: [0.19], at: [-1.5, 0.86, 0], drift: [-0.9, 0.8, 0.7], tone: "teal", glow: true },
  { kind: "sphere", args: [0.19], at: [-1.5, 0, 0], drift: [-1.1, 0.1, -0.5], tone: "teal", glow: true },
  { kind: "sphere", args: [0.19], at: [-1.5, -0.86, 0], drift: [-0.95, -0.9, 0.6], tone: "teal", glow: true },
  { kind: "box", args: [1.36, 0.035, 0.035], at: [-0.82, 0.43, 0], drift: [-0.3, 0.9, -0.8], tone: "faint" },
  { kind: "box", args: [1.36, 0.035, 0.035], at: [-0.82, -0.43, 0], drift: [-0.35, -0.95, -0.8], tone: "faint" },
  { kind: "sphere", args: [0.25], at: [-0.14, 0.43, 0.1], drift: [0.1, 1.0, 0.9], tone: "ember", glow: true },
  { kind: "sphere", args: [0.25], at: [-0.14, -0.43, 0.1], drift: [0.05, -1.05, 0.9], tone: "ember", glow: true },
  { kind: "box", args: [1.36, 0.035, 0.035], at: [0.54, 0.43, 0.1], drift: [0.9, 0.85, -0.7], tone: "faint" },
  { kind: "box", args: [1.36, 0.035, 0.035], at: [0.54, -0.43, 0.1], drift: [0.95, -0.8, -0.7], tone: "faint" },
  { kind: "sphere", args: [0.32], at: [1.24, 0, 0.2], drift: [1.5, 0.05, 1.1], tone: "solar", glow: true },
];

export function AiScene({ progress }: SceneProps) {
  return <Assembly pieces={AI_PIECES} progress={progress} />;
}
