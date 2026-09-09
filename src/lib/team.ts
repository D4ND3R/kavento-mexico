/**
 * Equipo — MARCADORES.
 * Reemplaza name, role y photo por los datos reales. Las fotos van en
 * /public/equipo/ (recomendado: 800x1000 px, WebP o AVIF).
 * Deja photo en null para mostrar el retrato marcador.
 */
export type TeamMember = {
  id: string;
  name: string | null;
  role: string | null;
  photo: string | null;
};

export const team: TeamMember[] = [
  { id: "m1", name: null, role: null, photo: null },
  { id: "m2", name: null, role: null, photo: null },
  { id: "m3", name: null, role: null, photo: null },
  { id: "m4", name: null, role: null, photo: null },
];
