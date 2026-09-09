/**
 * Configuración editable del sitio.
 * Los valores sensibles o específicos del cliente viven en .env.local
 * (ver .env.example). Nada de esto debería requerir tocar componentes.
 */

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kavento.mx";

/**
 * Número de WhatsApp en formato internacional, solo dígitos.
 * Ejemplo México: 5215512345678 (52 país + 1 móvil + 10 dígitos).
 */
export const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hola@kavento.mx";

/** Marcador: sustituye por los perfiles reales cuando existan. */
export const socialLinks = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/kavento" },
  { label: "Instagram", href: "https://www.instagram.com/kavento" },
  { label: "Facebook", href: "https://www.facebook.com/kavento" },
] as const;

export const navSections = [
  { id: "servicios", key: "nav.services" },
  { id: "equipo", key: "nav.team" },
  { id: "contacto", key: "nav.contact" },
] as const;

/**
 * Construye el deep link de WhatsApp con el mensaje ya escrito.
 * Devuelve null si todavía no se configuró el número, para que la UI
 * pueda avisarlo en vez de abrir un enlace roto.
 */
export function buildWhatsappUrl(message: string): string | null {
  const digits = whatsappNumber.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
