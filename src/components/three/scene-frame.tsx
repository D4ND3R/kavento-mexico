"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { useCoarsePointer, useReducedMotion } from "@/lib/hooks";

type SceneFrameProps = {
  children: ReactNode;
  /** Etiqueta accesible. Si se omite, la escena se marca como decorativa. */
  label?: string;
  className?: string;
  /** Contenido mostrado si el navegador no puede crear un contexto WebGL. */
  fallback?: ReactNode;
  cameraZ?: number;
  fov?: number;
  /**
   * Monta el canvas de inmediato, sin esperar al observador. Se usa en
   * el hero: lo que ya está sobre el pliegue no se gana nada difiriéndolo,
   * y así la marca aparece aunque el observador tarde en entregar.
   */
  eager?: boolean;
};

/**
 * Envoltura común de todos los canvas 3D del sitio.
 *
 * Tres decisiones de rendimiento viven aquí, no en cada escena:
 *  1. El canvas no existe hasta que su sección se acerca al viewport.
 *  2. Cuando sale de pantalla se cambia a frameloop "demand", que detiene
 *     el bucle de render sin desmontar ni perder el contexto WebGL.
 *  3. El pixel ratio se limita a 2 (1.5 en táctil) para no renderizar
 *     cuatro veces los píxeles necesarios en pantallas densas.
 *
 * Con prefers-reduced-motion el bucle nunca arranca: se pinta un cuadro
 * y se queda quieto.
 */
export function SceneFrame({
  children,
  label,
  className,
  fallback,
  cameraZ = 6,
  fov = 42,
  eager = false,
}: SceneFrameProps) {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useCoarsePointer();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(eager);
  const [nearViewport, setNearViewport] = useState(eager);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearViewport(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const animating = nearViewport && !reducedMotion;

  const accessibility = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <div ref={containerRef} className={className} {...accessibility}>
      {mounted ? (
        <Canvas
          frameloop={animating ? "always" : "demand"}
          dpr={[1, coarsePointer ? 1.5 : 2]}
          camera={{ position: [0, 0, cameraZ], fov }}
          gl={{
            alpha: true,
            antialias: !coarsePointer,
            powerPreference: "high-performance",
          }}
          fallback={fallback}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </Canvas>
      ) : null}
    </div>
  );
}
