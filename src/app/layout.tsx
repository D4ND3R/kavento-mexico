import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { cookies } from "next/headers";

import {
  defaultLocale,
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";
import { Atmosphere } from "@/components/ui/atmosphere";
import { GlassFilters } from "@/components/ui/glass-filters";
import { PointerFx } from "@/components/ui/pointer-fx";
import { SmoothScroll } from "@/components/ui/smooth-scroll";
import { I18nProvider } from "@/lib/i18n/provider";
import { serviceIds } from "@/lib/services";
import { siteUrl, socialLinks } from "@/lib/site";

import "./globals.css";

/**
 * Las tres fuentes del portafolio de Leonardo Díaz Delgado:
 * Space Grotesk para display, Inter para lectura y JetBrains Mono
 * para las etiquetas de sección.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-family",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono-family",
  display: "swap",
});

/** Lectura: Inter, con itálica para el descriptor del lockup. */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Las metaetiquetas salen en español: es el idioma por defecto y el
 * mercado objetivo. `alternates.languages` declara la versión en inglés,
 * que vive en la misma URL y se activa con el conmutador.
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: dictionaries.es.meta.title,
  description: dictionaries.es.meta.description,
  applicationName: "Kavento México",
  authors: [{ name: "Soluciones Digitales Kavento México" }],
  keywords: [
    "desarrollo web México",
    "software a la medida",
    "automatización de procesos",
    "chatbots WhatsApp",
    "inteligencia artificial privada",
    "aplicaciones a medida",
  ],
  alternates: {
    canonical: "/",
    languages: {
      "es-MX": "/",
      en: "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "Kavento México",
    title: dictionaries.es.meta.title,
    description: dictionaries.es.meta.description,
    images: [
      {
        url: "/logo-kavento.svg",
        width: 420,
        height: 120,
        alt: dictionaries.es.meta.ogAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: dictionaries.es.meta.title,
    description: dictionaries.es.meta.description,
    images: ["/logo-kavento.svg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#120e0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Sin maximumScale: bloquear el zoom rompe la accesibilidad.
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Leer la cookie aquí hace que el HTML servido ya traiga el `lang`
  // correcto: sin parpadeo de idioma y con el atributo bien puesto
  // para lectores de pantalla y buscadores.
  const cookieStore = await cookies();
  const stored = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(stored) ? stored : defaultLocale;

  return (
    <html lang={locale} className={`${spaceGrotesk.variable} ${jetbrains.variable} ${inter.variable}`}>
      <body>
        {/* Datos estructurados: solo hechos comprobables, sin inventar
            domicilio ni teléfono. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <GlassFilters />
        <Atmosphere />
        <SmoothScroll />
        <PointerFx />
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}

/**
 * Datos estructurados de la organización. Solo se declara lo que se
 * puede sostener: nombre, sitio, idiomas, país y catálogo de servicios.
 * Sin domicilio ni teléfono hasta que el cliente los proporcione.
 */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "Soluciones Digitales Kavento México",
  alternateName: "Kavento",
  url: siteUrl,
  logo: `${siteUrl}/logo-kavento.svg`,
  image: `${siteUrl}/logo-kavento.svg`,
  description: dictionaries.es.meta.description,
  areaServed: { "@type": "Country", name: "México" },
  availableLanguage: ["es-MX", "en"],
  sameAs: socialLinks.map((social) => social.href),
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: dictionaries.es.services.title,
    itemListElement: serviceIds.map((id) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: dictionaries.es.services.items[id].title,
        description: dictionaries.es.services.items[id].body,
      },
    })),
  },
};
