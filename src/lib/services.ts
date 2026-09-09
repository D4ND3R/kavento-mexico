import type { MessageKey } from "./i18n/config";

/**
 * Los cinco frentes de trabajo, en el orden en que se presentan.
 * Es la única lista: la sección de servicios arma sus paneles con ella
 * y el formulario de contacto llena su selector con la misma fuente, de
 * modo que agregar un servicio no deja el formulario desactualizado.
 */
export const serviceIds = [
  "web",
  "automation",
  "software",
  "whatsapp",
  "ai",
] as const;

export type ServiceId = (typeof serviceIds)[number];

export const serviceTitleKey = (id: ServiceId) =>
  `services.items.${id}.title` as MessageKey;

export const serviceBodyKey = (id: ServiceId) =>
  `services.items.${id}.body` as MessageKey;

export const serviceAnchor = (id: ServiceId) => `servicio-${id}`;
