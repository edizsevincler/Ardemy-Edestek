import { cookies, headers } from "next/headers";
import {
  isLocale,
  LOCALE_COOKIE,
  pickFromAcceptLanguage,
  type Locale,
} from "./config";
import { getDictionary } from "./dictionary";
import { makeT, type TFunction } from "./translate";

// Geçerli dil: önce çerez, yoksa tarayıcı dili.
export async function getLocale(): Promise<Locale> {
  const cookieValue = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieValue)) return cookieValue;
  return pickFromAcceptLanguage((await headers()).get("accept-language"));
}

// Sunucu bileşenleri ve server action'lar için çeviri fonksiyonu.
export async function getT(): Promise<TFunction> {
  const locale = await getLocale();
  return makeT(getDictionary(locale), locale);
}

export async function getI18n(): Promise<{ locale: Locale; t: TFunction }> {
  const locale = await getLocale();
  return { locale, t: makeT(getDictionary(locale), locale) };
}
