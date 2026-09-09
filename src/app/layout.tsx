import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { cookies } from "next/headers";

import {
  defaultLocale,
  dictionaries,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/provider";
import { siteUrl } from "@/lib/site";

import "./globals.css";

/** Display: Manrope. Tracking cerrado a tamaños grandes, cálido y geométrico. */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-manrope",
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
    <html lang={locale} className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
