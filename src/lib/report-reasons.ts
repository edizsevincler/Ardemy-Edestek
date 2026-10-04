import { tx } from "@/lib/i18n/translate";

// "Soruyu bildir" sebepleri. Veritabanında Türkçe metin olarak saklanır;
// kullanıcıya gösterilirken t() ile çevrilir.
export const REPORT_REASONS = [
  tx("Doğru cevap yanlış işaretlenmiş"),
  tx("Birden fazla şık doğru olabilir"),
  tx("Soru anlaşılmıyor"),
  tx("Yazım hatası var"),
  tx("Diğer"),
] as const;
