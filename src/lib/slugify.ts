// Dil adlarini URL'de guvenli sekilde tasimak icin ASCII slug'a ceviriyoruz.
// Turkce karakterlerin URL encode/decode turunda Unicode normalizasyon
// farklari yuzunden eslesmemesi riskini tamamen ortadan kaldirir.
export function slugify(text: string): string {
  const COMBINING_MARKS = /[̀-ͯ]/g;
  return text
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
