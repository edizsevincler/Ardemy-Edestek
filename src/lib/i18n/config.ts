// Çok dillilik ayarları (istemci ve sunucudan import edilebilir).
// Dil çerezi (ardemy_lang) yoksa tarayıcının Accept-Language başlığına bakılır.
// URL'ler dile göre değişmez; seçim çerezde tutulur.

export const LOCALES = ["tr", "en", "ru"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";
export const LOCALE_COOKIE = "ardemy_lang";
export const LOCALE_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

// Tarih/sayı biçimleri için BCP 47 etiketi.
export const INTL_TAG: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-GB",
  ru: "ru-RU",
};

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: "TR",
  en: "EN",
  ru: "RU",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  ru: "Русский",
};

// Accept-Language başlığından dil seçer. Başlık yoksa (ör. arama motoru
// botları) Türkçe; başlık var ama tr/en/ru hiçbiri değilse İngilizce.
export function pickFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return {
        lang: tag.trim().toLowerCase().split("-")[0],
        q: q ? Number(q.trim().slice(2)) || 0 : 1,
      };
    })
    .filter((x) => x.lang)
    .sort((a, b) => b.q - a.q);
  for (const { lang } of ranked) {
    if (isLocale(lang)) return lang;
  }
  return "en";
}
