// Çeviri fonksiyonu: anahtar, Türkçe kaynak metnin kendisidir. Sözlükte
// karşılığı yoksa metin olduğu gibi (Türkçe) döner.
//
//   t("Merhaba")                      -> "Hello"
//   t("{n} gün sonra", { n: 3 })      -> "in 3 days"
//
// Çoğul biçimler: {n#tekil|çoğul} (İngilizce) ve {n#bir|birkaç|çok} (Rusça).
// Sayıyı yazmaz; yalnızca doğru kelimeyi seçer, sayı için ayrıca {n} kullanılır:
//   "{n} {n#day|days}"                 -> "1 day" / "5 days"
//   "{n} {n#кредит|кредита|кредитов}"  -> "1 кредит" / "2 кредита" / "5 кредитов"
// Türkçede çoğul eki gerekmez; ilk biçim kullanılır.

import type { Locale } from "./config";

export type TFunction = (
  text: string,
  vars?: Record<string, string | number>
) => string;

function pluralIndex(locale: Locale, n: number): number {
  if (locale === "ru") {
    const abs = Math.abs(n);
    const mod10 = abs % 10;
    const mod100 = abs % 100;
    if (mod10 === 1 && mod100 !== 11) return 0;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 1;
    return 2;
  }
  if (locale === "en") return n === 1 ? 0 : 1;
  return 0;
}

export function makeT(
  dict: Record<string, string> | null,
  locale: Locale = "tr"
): TFunction {
  return (text, vars) => {
    let out = dict?.[text] ?? text;
    if (vars) {
      out = out.replace(/\{(\w+)#([^}]*)\}/g, (match, key: string, forms: string) => {
        if (!(key in vars)) return match;
        const list = forms.split("|");
        const index = Math.min(pluralIndex(locale, Number(vars[key])), list.length - 1);
        return list[index];
      });
      out = out.replace(/\{(\w+)\}/g, (match, key: string) =>
        key in vars ? String(vars[key]) : match
      );
    }
    return out;
  };
}

// Çevrilecek ama o anda çevrilmeyen sabit metinler (veri dizileri, tanımlar)
// için işaretleyici: çeviri kontrol script'i bunları da sözlükte arar.
// Gösterim sırasında t(metin) ile çevrilir.
export const tx = (text: string) => text;
