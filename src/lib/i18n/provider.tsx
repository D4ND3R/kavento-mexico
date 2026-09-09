"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  dictionaries,
  LOCALE_COOKIE,
  translate,
  type Locale,
  type MessageKey,
} from "./config";

type TranslateFn = (key: MessageKey, values?: Record<string, string | number>) => string;

type I18nContextValue = {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: TranslateFn;
};

const I18nContext = createContext<I18nContextValue | null>(null);

/** Un año: la preferencia de idioma no debería expirar en una visita. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * El idioma es estado de React, no una ruta: cambiarlo no navega, así que
 * no se pierde la posición de scroll ni se desmontan los canvas 3D.
 *
 * La persistencia vive en una cookie —no en localStorage— porque el layout
 * la lee en el servidor y sirve el HTML con el `lang` correcto desde el
 * primer byte. Eso evita el parpadeo de idioma y deja el atributo bien
 * puesto para lectores de pantalla y buscadores.
 */
export function I18nProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
    document.documentElement.lang = next;
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const messages = dictionaries[locale];
    return {
      locale,
      setLocale,
      t: (key, values) => translate(messages, key, values),
    };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>.");
  }
  return context;
}

/** Atajo cuando el componente solo necesita traducir. */
export function useTranslations(): TranslateFn {
  return useI18n().t;
}
