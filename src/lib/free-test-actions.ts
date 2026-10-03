"use server";

import { prisma } from "@/lib/prisma";
import { readFreeTestToken } from "@/lib/free-test";

type Letter = "A" | "B" | "C" | "D";

export type FreeTestResult =
  | { status: "error"; message: string }
  | {
      status: "success";
      score: number;
      total: number;
      correct: Record<string, Letter>;
    };

// Giriş gerektirmez; yalnızca sayfanın imzaladığı sorular değerlendirilir.
export async function gradeFreeTest(
  token: string,
  answers: Record<string, Letter>
): Promise<FreeTestResult> {
  const ids = readFreeTestToken(token);
  if (!ids) {
    return { status: "error", message: "Test süresi doldu, sayfayı yenile." };
  }
  if (ids.some((id) => !answers[id])) {
    return { status: "error", message: "Lütfen tüm soruları cevapla." };
  }

  const items = await prisma.quizItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, correct: true },
  });
  const correct: Record<string, Letter> = {};
  let score = 0;
  for (const item of items) {
    correct[item.id] = item.correct;
    if (answers[item.id] === item.correct) score++;
  }
  return { status: "success", score, total: items.length, correct };
}
