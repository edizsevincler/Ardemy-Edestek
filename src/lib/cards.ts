import { prisma } from "@/lib/prisma";
import { syncAdminCards, CARD_LANGUAGES, type CardLanguage } from "@/lib/flashcards";
import { dateKey } from "@/lib/streak";
import { ttlCached } from "@/lib/ttl-cache";

export type DeckCard = {
  id: string;
  front: string;
  back: string;
  // true: ilerlemesi kaydedilen kendi kartı; false: günlük ücretsiz deste (kaydedilmez)
  tracked: boolean;
  // Hoparlör düğmesiyle sesli okunan yabancı dil tarafı
  speak: string;
};

export type Deck = {
  language: CardLanguage;
  cards: DeckCard[];
  source: "lessons" | "daily";
  total: number; // kullanıcının toplam kart sayısı (günlük destede 0)
  mastered: number; // art arda en az 3 kez "biliyorum" denen kart sayısı
};

export const MASTERED_STREAK = 3;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

function shuffle<T>(items: T[], random: () => number) {
  const list = [...items];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

// Kullanıcının kart sayısı (önce yöneticinin eklediği yeni kelimeleri kartlarına ekler).
export async function getCardCount(userId: string) {
  await syncAdminCards(userId);
  return prisma.flashCard.count({ where: { userId } });
}

// Dil başına kullanıcının kart sayısı (dil seçici için).
export async function getLanguageCounts(userId: string): Promise<Record<CardLanguage, number>> {
  await syncAdminCards(userId);
  const groups = await prisma.flashCard.groupBy({ by: ["language"], where: { userId }, _count: { _all: true } });
  const counts: Record<CardLanguage, number> = { EN: 0, RU: 0 };
  for (const g of groups) if (g.language === "EN" || g.language === "RU") counts[g.language] = g._count._all;
  return counts;
}

// Kullanıcının seçili dildeki kartlarından bir deste: en az bilinen ve en eski görülen kartlar
// önce gelir, aralarından rastgele seçilir.
export async function getUserDeck(userId: string, language: CardLanguage, size = 15): Promise<Deck> {
  await syncAdminCards(userId);
  const [total, mastered, pool] = await Promise.all([
    prisma.flashCard.count({ where: { userId, language } }),
    prisma.flashCard.count({ where: { userId, language, knownStreak: { gte: MASTERED_STREAK } } }),
    prisma.flashCard.findMany({
      where: { userId, language },
      orderBy: [{ knownStreak: "asc" }, { lastSeenAt: { sort: "asc", nulls: "first" } }],
      take: size * 5,
      select: { id: true, front: true, back: true },
    }),
  ]);
  const picked = shuffle(pool, Math.random).slice(0, size);
  return {
    language,
    cards: picked.map((c) => ({ ...c, tracked: true, speak: c.back })),
    source: "lessons",
    total,
    mastered,
  };
}

const WORD_PROMPT =
  /^"([^"]+)"\s+(?:kelimesinin|fiilinin|ifadesinin)\s+(?:anlamı nedir|İngilizcesi nedir)\??\s*$/;

// Soru bankasındaki "X kelimesinin anlamı nedir?" sorularından kelime çiftleri.
async function loadBankPairs() {
  return ttlCached("bank-word-pairs", 60 * 60 * 1000, async () => {
    const items = await prisma.quizItem.findMany({
      where: { question: { isPublished: true }, prompt: { startsWith: '"' } },
      select: { id: true, prompt: true, question: { select: { subject: true } }, optionA: true, optionB: true, optionC: true, optionD: true, correct: true },
    });
    const pairs: { id: string; word: string; meaning: string; language: CardLanguage | null }[] = [];
    for (const item of items) {
      const match = WORD_PROMPT.exec(item.prompt.trim());
      if (!match) continue;
      const meaning = { A: item.optionA, B: item.optionB, C: item.optionC, D: item.optionD }[item.correct];
      if (!meaning) continue;
      const raw = match[1];
      // Bazı sorularda kelime BÜYÜK HARFLE yazılmış; kartta küçük harfle göster.
      const word = raw.length > 1 && raw === raw.toLocaleUpperCase() ? raw.toLocaleLowerCase() : raw;
      const subject = item.question.subject;
      const language = CARD_LANGUAGES.find((l) => subject.startsWith(l.name))?.code ?? null;
      pairs.push({ id: item.id, word, meaning, language });
    }
    return pairs;
  });
}

// Kartı olmayan kullanıcılar için günlük ücretsiz deste (herkes için gün
// boyunca aynı 10 kart, kullanıcıya göre farklı karışım).
export async function getDailyDeck(userId: string, language: CardLanguage, size = 10): Promise<Deck> {
  const pairs = (await loadBankPairs()).filter((p) => p.language === language);
  const random = mulberry32(hash(`${dateKey(new Date())}:${userId}:${language}`));
  const picked = shuffle(pairs, random).slice(0, size);
  return {
    language,
    cards: picked.map((p) => ({ id: `q:${p.id}`, front: p.word, back: p.meaning, tracked: false, speak: p.word })),
    source: "daily",
    total: 0,
    mastered: 0,
  };
}
