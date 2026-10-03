import type { Locale } from "./config";
import { MESSAGES } from "./messages";

const cache = new Map<Locale, Record<string, string> | null>();

// Dile göre { Türkçe kaynak: çeviri } sözlüğü. Türkçe için null (kaynak = metin).
export function getDictionary(locale: Locale): Record<string, string> | null {
  if (locale === "tr") return null;
  const cached = cache.get(locale);
  if (cached !== undefined) return cached;
  const index = locale === "en" ? 1 : 2;
  const dict: Record<string, string> = {};
  for (const entry of MESSAGES) {
    const translated = entry[index];
    if (translated) dict[entry[0]] = translated;
  }
  cache.set(locale, dict);
  return dict;
}
