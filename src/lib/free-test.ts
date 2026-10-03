import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

export const FREE_TEST_SIZE = 5;

export const FREE_TEST_LANGUAGES = {
  rusca: { name: "Rusça", sample: "Rusça padejler, fiiller ve günlük kalıplar" },
  ingilizce: {
    name: "İngilizce",
    sample: "İngilizce zamanlar, kelimeler ve kalıplar",
  },
} as const;

export type FreeTestSlug = keyof typeof FREE_TEST_LANGUAGES;

export type FreeTestQuestion = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

function sign(ids: string[]) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET tanımlı değil.");
  return createHmac("sha256", secret)
    .update(`free-test:${ids.join(",")}`)
    .digest("base64url");
}

// Sayfa, gösterdiği soruların id listesini imzalar; değerlendirme yalnızca bu
// imzalı liste için yapılır (rastgele id ile cevap anahtarı taranamasın).
export function makeFreeTestToken(ids: string[]) {
  return `${ids.join(",")}.${sign(ids)}`;
}

export function readFreeTestToken(token: string): string[] | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const ids = token.slice(0, dot).split(",");
  const given = Buffer.from(token.slice(dot + 1));
  const expected = Buffer.from(sign(ids));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return null;
  }
  return ids;
}

// Yayındaki test sorularından rastgele FREE_TEST_SIZE tane (doğru cevap yok).
export async function pickFreeTestQuestions(
  language: string
): Promise<FreeTestQuestion[]> {
  const where = {
    question: {
      isPublished: true,
      type: "QUIZ" as const,
      subject: { startsWith: language },
    },
  };
  const count = await prisma.quizItem.count({ where });
  if (count < FREE_TEST_SIZE) return [];

  const offsets = new Set<number>();
  while (offsets.size < FREE_TEST_SIZE) {
    offsets.add(Math.floor(Math.random() * count));
  }
  const items = await Promise.all(
    [...offsets].map((skip) =>
      prisma.quizItem.findFirst({
        where,
        orderBy: { id: "asc" },
        skip,
        select: {
          id: true,
          prompt: true,
          optionA: true,
          optionB: true,
          optionC: true,
          optionD: true,
        },
      })
    )
  );
  return items.filter((i): i is FreeTestQuestion => i !== null);
}
