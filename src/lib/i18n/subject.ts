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
