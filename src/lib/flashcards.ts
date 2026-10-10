import { prisma } from "@/lib/prisma";

// Kelime kartları yöneticinin eklediği kelimelerden (CardWord, /admin/cards) gelir.
// Her kullanıcı kendi kartlarını FlashCard'da tutar (ilerleme için); yeni/eklenen
// kelimeler kullanıcı kartlarına girdiğinde buraya kopyalanır.

export const ADMIN_SOURCE = "admin";

// Kart dilleri: kod -> soru bankasındaki konu öneki / FlagIcon dil adı.
export type CardLanguage = "EN" | "RU";
export const CARD_LANGUAGES: { code: CardLanguage; name: "İngilizce" | "Rusça" }[] = [
  { code: "EN", name: "İngilizce" },
  { code: "RU", name: "Rusça" },
];
export function parseCardLanguage(value: unknown): CardLanguage | null {
  return value === "EN" || value === "RU" ? value : null;
}

export type CardPair = { front: string; back: string };

const clean = (text: string) => text.replace(/\s+/g, " ").trim();

// Yönetici girişi: her satır "Türkçe = yabancı dil". Sol taraf kartın önü olur.
// Boş satırlar ve "=" içermeyen satırlar `skipped` listesine girer.
export function parseWordLines(text: string): { pairs: CardPair[]; skipped: string[] } {
  const seen = new Set<string>();
  const pairs: CardPair[] = [];
  const skipped: string[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split("=");
    const front = clean(parts[0] ?? "");
    const back = clean(parts.slice(1).join("="));
    if (parts.length < 2 || !front || !back || front.length > 80 || back.length > 80) {
      skipped.push(line);
      continue;
    }
    const key = `${front.toLocaleLowerCase("tr")}|${back.toLocaleLowerCase("tr")}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ front, back });
  }
  return { pairs, skipped };
}

const pairKey = (front: string, back: string) =>
  `${front.toLocaleLowerCase("tr")}|${back.toLocaleLowerCase("tr")}`;

// Yöneticinin eklediği tüm kelimeleri kullanıcının kartlarına ekler (eksik olanları).
// Kart sayfası ve panel açılınca çağrılır, bu yüzden sonradan eklenen kelimeler ve
// sonradan kayıt olan kullanıcılar da kartlarını otomatik alır. Kelime silinince
// kartları da silindiği için iki sayı eşitse eksik yoktur (ucuz kontrol).
export async function syncAdminCards(userId: string) {
  const [wordCount, cardCount] = await Promise.all([
    prisma.cardWord.count(),
    prisma.flashCard.count({ where: { userId, sourceTitle: ADMIN_SOURCE } }),
  ]);
  if (wordCount === 0 || cardCount >= wordCount) return;

  const [words, existing] = await Promise.all([
    prisma.cardWord.findMany({ select: { front: true, back: true, language: true } }),
    prisma.flashCard.findMany({ where: { userId, sourceTitle: ADMIN_SOURCE }, select: { front: true, back: true } }),
  ]);
  const have = new Set(existing.map((c) => pairKey(c.front, c.back)));
  const fresh = words.filter((w) => !have.has(pairKey(w.front, w.back)));
  if (fresh.length === 0) return;
  await prisma.flashCard.createMany({
    data: fresh.map((w) => ({ userId, front: w.front, back: w.back, language: w.language, sourceTitle: ADMIN_SOURCE })),
    skipDuplicates: true,
  });
}
