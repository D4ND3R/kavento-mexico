/**
 * Casos de clientes — MARCADORES.
 *
 * Estos NO son clientes reales. Publicar casos o testimonios inventados
 * como si fueran de clientes es engañoso, así que se dejan
 * explícitamente vacíos: cada campo en `null` dibuja su marcador
 * etiquetado.
 *
 * Cada caso es un póster a toda altura (como la parrilla de trabajos de
 * altitude101): una imagen grande, quién es el cliente y qué le
 * hicimos. Para llenarlo:
 *
 *   {
 *     id: "c1",
 *     client: "Acme",                       // nombre grande sobre la imagen
 *     sector: "Logística · CDMX",           // etiqueta pequeña arriba
 *     work: "Panel de control y automatización de pedidos por WhatsApp",
 *     quote: "…",                           // opcional, una frase del cliente
 *     image: "/casos/acme.webp",            // 1200×1500 px, WebP o AVIF
 *   }
 */
export type CaseStudy = {
  id: string;
  client: string | null;
  sector: string | null;
  work: string | null;
  quote: string | null;
  image: string | null;
};

export const cases: CaseStudy[] = [
  { id: "c1", client: null, sector: null, work: null, quote: null, image: null },
  { id: "c2", client: null, sector: null, work: null, quote: null, image: null },
  { id: "c3", client: null, sector: null, work: null, quote: null, image: null },
];
