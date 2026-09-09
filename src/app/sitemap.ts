import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * El sitio es una sola página. Se declara esa URL con sus dos idiomas:
 * el inglés vive en la misma dirección y se activa con el conmutador,
 * así que ambos apuntan aquí.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          "es-MX": siteUrl,
          en: siteUrl,
        },
      },
    },
  ];
}
