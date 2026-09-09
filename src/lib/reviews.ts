/**
 * Reseñas — MARCADORES.
 *
 * Estas NO son reseñas reales. Publicar testimonios inventados como si
 * fueran de clientes es engañoso, así que se dejan explícitamente
 * vacías: cada campo en `null` dibuja su marcador etiquetado.
 *
 * Para llenarlas, pide al cliente dos o tres frases sobre qué se le
 * resolvió, en cuánto tiempo y qué cambió después, y sustituye:
 *
 *   { id: "r1", quote: "…", name: "Ana Ruiz", role: "Directora · Acme",
 *     photo: "/resenas/ana.webp" }
 *
 * Las fotos van en /public/resenas/ (recomendado: 200×200 px, WebP).
 */
export type Review = {
  id: string;
  quote: string | null;
  name: string | null;
  role: string | null;
  photo: string | null;
};

export const reviews: Review[] = [
  { id: "r1", quote: null, name: null, role: null, photo: null },
  { id: "r2", quote: null, name: null, role: null, photo: null },
  { id: "r3", quote: null, name: null, role: null, photo: null },
];
