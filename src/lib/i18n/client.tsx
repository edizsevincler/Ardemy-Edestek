"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import { makeT, type TFunction } from "./translate";

type I18nValue = { locale: Locale; t: TFunction };

const I18nContext = createContext<I18nValue>({ locale: "tr", t: makeT(null) });

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Record<string, string> | null;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ locale, t: makeT(dict, locale) }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// İstemci bileşenlerinde çeviri: const t = useT();
export function useT(): TFunction {
  return useContext(I18nContext).t;
}

export function useLocale(): Locale {
  return useContext(I18nContext).locale;
}
