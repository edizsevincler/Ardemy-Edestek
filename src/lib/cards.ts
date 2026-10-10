import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { ttlCached } from "@/lib/ttl-cache";

export type DeckCard = {
  id: string;
  front: string;
  back: string;
  // true: ilerlemesi kaydedilen kendi kartı; false: günlük ücretsiz deste (kaydedilmez)
  tracked: boolean;
};

export type Deck = {
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

// Kullanıcının kendi ders kartlarından bir deste: en az bilinen ve en eski
// görülen kartlar önce gelir, aralarından rastgele seçilir.
export async function getUserDeck(userId: string, size = 15): Promise<Deck> {
  const [total, mastered, pool] = await Promise.all([
    prisma.flashCard.count({ where: { userId } }),
    prisma.flashCard.count({ where: { userId, knownStreak: { gte: MASTERED_STREAK } } }),
    prisma.flashCard.findMany({
      where: { userId },
      orderBy: [{ knownStreak: "asc" }, { lastSeenAt: { sort: "asc", nulls: "first" } }],
      take: size * 5,
      select: { id: true, front: true, back: true },
    }),
  ]);
  const picked = shuffle(pool, Math.random).slice(0, size);
  return {
    cards: picked.map((c) => ({ ...c, tracked: true })),
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
      select: { id: true, prompt: true, optionA: true, optionB: true, optionC: true, optionD: true, correct: true },
    });
    const pairs: { id: string; word: string; meaning: string }[] = [];
    for (const item of items) {
      const match = WORD_PROMPT.exec(item.prompt.trim());
      if (!match) continue;
      const meaning = { A: item.optionA, B: item.optionB, C: item.optionC, D: item.optionD }[item.correct];
      if (!meaning) continue;
      const raw = match[1];
      // Bazı sorularda kelime BÜYÜK HARFLE yazılmış; kartta küçük harfle göster.
      const word = raw.length > 1 && raw === raw.toLocaleUpperCase() ? raw.toLocaleLowerCase() : raw;
      pairs.push({ id: item.id, word, meaning });
    }
    return pairs;
  });
}

// Dersi/kartı olmayan kullanıcılar için günlük ücretsiz deste (herkes için gün
// boyunca aynı 10 kart, kullanıcıya göre farklı karışım).
export async function getDailyDeck(userId: string, size = 10): Promise<Deck> {
  const pairs = await loadBankPairs();
  const random = mulberry32(hash(`${dateKey(new Date())}:${userId}`));
  const picked = shuffle(pairs, random).slice(0, size);
  return {
    cards: picked.map((p) => ({ id: `q:${p.id}`, front: p.word, back: p.meaning, tracked: false })),
    source: "daily",
    total: 0,
    mastered: 0,
  };
}
