import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";

/**
 * Cinta de Möbius con grosor, generada por código.
 *
 * altitude101 carga un FBX; aquí la cinta se construye barriendo un
 * rectángulo de esquinas redondeadas a lo largo de un círculo, girando
 * el perfil media vuelta (π) en el recorrido. Al cerrar, el perfil ha
 * girado 180°, así que el punto k del último anillo empalma con el
 * punto k + P/2 del primero: ese desplazamiento de índices es lo que
 * hace la Möbius.
 *
 * Como la sección es cerrada, la superficie resultante es orientable
 * (topológicamente un toro) y las normales calculadas no dan salto en
 * la costura, aunque la cinta sí sea de una sola cara.
 */
export function createMobiusGeometry({
  radius = 3.1,
  halfWidth = 0.78,
  halfThickness = 0.16,
  cornerRadius = 0.13,
  segments = 320,
  cornerSegments = 5,
}: {
  radius?: number;
  halfWidth?: number;
  halfThickness?: number;
  cornerRadius?: number;
  segments?: number;
  cornerSegments?: number;
} = {}): BufferGeometry {
  /* Perfil: rectángulo redondeado, recorrido en sentido antihorario en
     el plano (ancho, grosor). Cuatro esquinas de `cornerSegments + 1`
     puntos; el orden hace que girar π equivalga a saltar P/2 índices. */
  const profile: [number, number][] = [];
  const corners: [number, number, number][] = [
    [halfWidth - cornerRadius, -(halfThickness - cornerRadius), -Math.PI / 2],
    [halfWidth - cornerRadius, halfThickness - cornerRadius, 0],
    [-(halfWidth - cornerRadius), halfThickness - cornerRadius, Math.PI / 2],
    [-(halfWidth - cornerRadius), -(halfThickness - cornerRadius), Math.PI],
  ];
  for (const [cx, cy, start] of corners) {
    for (let s = 0; s <= cornerSegments; s += 1) {
      const angle = start + (s / cornerSegments) * (Math.PI / 2);
      profile.push([
        cx + Math.cos(angle) * cornerRadius,
        cy + Math.sin(angle) * cornerRadius,
      ]);
    }
  }
  const P = profile.length;
  const half = P / 2;

  const positions = new Float32Array(segments * P * 3);
  const uvs = new Float32Array(segments * P * 2);

  const center = new Vector3();
  const normalDir = new Vector3();
  const tangent = new Vector3();
  const binormal = new Vector3(0, 0, 1);
  const dir1 = new Vector3();
  const dir2 = new Vector3();
  const point = new Vector3();

  for (let i = 0; i < segments; i += 1) {
    const u = (i / segments) * Math.PI * 2;
    center.set(Math.cos(u) * radius, Math.sin(u) * radius, 0);
    normalDir.set(Math.cos(u), Math.sin(u), 0);
    tangent.set(-Math.sin(u), Math.cos(u), 0);

    // Media vuelta del perfil a lo largo del círculo.
    const twist = u / 2;
    dir1
      .copy(normalDir)
      .multiplyScalar(Math.cos(twist))
      .addScaledVector(binormal, Math.sin(twist));
    dir2
      .copy(normalDir)
      .multiplyScalar(-Math.sin(twist))
      .addScaledVector(binormal, Math.cos(twist));

    for (let k = 0; k < P; k += 1) {
      const [a, b] = profile[k];
      point.copy(center).addScaledVector(dir1, a).addScaledVector(dir2, b);
      const v = (i * P + k) * 3;
      positions[v] = point.x;
      positions[v + 1] = point.y;
      positions[v + 2] = point.z;
      uvs[(i * P + k) * 2] = i / segments;
      uvs[(i * P + k) * 2 + 1] = k / P;
    }
  }

  const indices: number[] = [];
  const vertexAt = (ring: number, k: number) => {
    // El anillo que cierra el círculo es el anillo 0 con el perfil
    // girado media vuelta: se salta P/2 índices.
    if (ring === segments) return ((k + half) % P) as number;
    return ring * P + k;
  };

  for (let i = 0; i < segments; i += 1) {
    for (let k = 0; k < P; k += 1) {
      const kn = (k + 1) % P;
      const a = vertexAt(i, k);
      const b = vertexAt(i + 1, k);
      const c = vertexAt(i + 1, kn);
      const d = vertexAt(i, kn);
      indices.push(a, b, c, a, c, d);
    }
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // Las normales deben apuntar hacia fuera del sólido. Se comprueba en
  // el primer vértice (que está en la cara exterior) y, si salieron
  // hacia dentro, se invierte el orden de los triángulos.
  const normal = geometry.getAttribute("normal");
  const outward = new Vector3(positions[0], positions[1], positions[2]).sub(
    new Vector3(radius, 0, 0),
  );
  if (outward.dot(new Vector3(normal.getX(0), normal.getY(0), normal.getZ(0))) < 0) {
    for (let t = 0; t < indices.length; t += 3) {
      const tmp = indices[t + 1];
      indices[t + 1] = indices[t + 2];
      indices[t + 2] = tmp;
    }
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
  }

  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
