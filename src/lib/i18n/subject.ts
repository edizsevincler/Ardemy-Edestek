import { tx, type TFunction } from "./translate";

// Soru bankası konuları veritabanında "Dil - Konu" biçiminde Türkçe tutulur
// (ör. "Rusça - Padejler"). Bilinen parçalar çevrilir; bilinmeyen (yöneticinin
// eklediği yeni) konular olduğu gibi gösterilir.
export const KNOWN_SUBJECT_PARTS = [
  tx("Rusça"),
  tx("İngilizce"),
  tx("Kelime ve Kalıplar"),
  tx("Zamanlar"),
  tx("Padejler"),
  tx("Fiil Yapıları ve Kelimeler"),
  tx("Dil Bilgisi ve Kalıplar"),
];

export function subjectLabel(subject: string, t: TFunction): string {
  return subject
    .split(" - ")
    .map((part) => t(part.trim()))
    .join(" - ");
}

// Soru/test başlıkları "12 Konu adı" ve "12 Konu adı - Test" biçimindedir.
// Sıra numarası ve " - Test" soneki korunur, yalnızca konu adı çevrilir
// (çeviriler messages/titles.ts içinde, numarasız ve soneksiz anahtarlarla).
export function questionTitleLabel(title: string, t: TFunction): string {
  const m = /^(\d+)\s*(.*?)(\s-\sTest)?$/.exec(title);
  if (!m) return t(title);
  const [, num, core, test] = m;
  return `${num} ${t(core)}${test ? ` - ${t("Test")}` : ""}`;
}
