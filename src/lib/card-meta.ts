import { tx } from "@/lib/i18n/translate";

// Kelime kartı dilleri ve konuları. Veritabanına dokunmaz; istemci bileşenleri
// (ör. admin kelime formu) de güvenle içe aktarabilir.

// Kart dilleri: kod -> soru bankasındaki konu öneki / FlagIcon dil adı.
export type CardLanguage = "EN" | "RU";
export const CARD_LANGUAGES: { code: CardLanguage; name: "İngilizce" | "Rusça" }[] = [
  { code: "EN", name: "İngilizce" },
  { code: "RU", name: "Rusça" },
];
export function parseCardLanguage(value: unknown): CardLanguage | null {
  return value === "EN" || value === "RU" ? value : null;
}

// Kelime konuları (sabit liste: adları arayüzde çevrilir). Sıra, sayfadaki sıradır.
export const CARD_TOPICS = [
  { id: "verbs", name: tx("Fiiller") },
  { id: "adjectives", name: tx("Sıfatlar") },
  { id: "greetings", name: tx("Selamlaşma ve kalıplar") },
  { id: "time", name: tx("Zaman") },
  { id: "people", name: tx("Aile ve insanlar") },
  { id: "food", name: tx("Yiyecek ve içecek") },
  { id: "places", name: tx("Ev, okul ve şehir") },
  { id: "travel", name: tx("Ulaşım ve seyahat") },
  { id: "learning", name: tx("Dil ve öğrenme") },
  { id: "other", name: tx("Diğer") },
] as const;
export type CardTopic = (typeof CARD_TOPICS)[number]["id"];
export function parseCardTopic(value: unknown): CardTopic | null {
  return CARD_TOPICS.find((t) => t.id === value)?.id ?? null;
}
