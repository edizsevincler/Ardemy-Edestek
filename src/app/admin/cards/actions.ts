"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ADMIN_SOURCE, parseCardLanguage, parseCardTopic, parseWordLines } from "@/lib/flashcards";

type AddState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; added: number; duplicates: number; skipped: string[] };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Yetkisiz");
}

const keyOf = (front: string, back: string) =>
  `${front.toLocaleLowerCase("tr")}|${back.toLocaleLowerCase("tr")}`;

// Her satır "Türkçe = yabancı dil". Kelimeler herkese açıktır; kartlar kullanıcılara bir
// sonraki ziyaretlerinde otomatik eklenir (bkz. lib/flashcards.ts syncAdminCards).
export async function addCardWords(_prev: AddState, formData: FormData): Promise<AddState> {
  await requireAdmin();
  const language = parseCardLanguage(formData.get("language"));
  if (!language) return { status: "error", message: "Dil seçin." };
  const topic = parseCardTopic(formData.get("topic"));
  if (!topic) return { status: "error", message: "Konu seçin." };
  const { pairs, skipped } = parseWordLines(String(formData.get("words") ?? ""));
  if (pairs.length === 0) {
    return { status: "error", message: 'Geçerli satır yok. Her satıra "Türkçe = yabancı dil" yazın.' };
  }

  const existing = await prisma.cardWord.findMany({ select: { front: true, back: true } });
  const have = new Set(existing.map((w) => keyOf(w.front, w.back)));
  const fresh = pairs.filter((p) => !have.has(keyOf(p.front, p.back)));
  if (fresh.length > 0) {
    await prisma.cardWord.createMany({ data: fresh.map((p) => ({ ...p, language, topic })), skipDuplicates: true });
  }

  revalidatePath("/admin/cards");
  return { status: "success", added: fresh.length, duplicates: pairs.length - fresh.length, skipped };
}

// Kelimeyi listeden ve tüm kullanıcıların kartlarından kaldırır.
export async function deleteCardWord(id: string) {
  await requireAdmin();
  const word = await prisma.cardWord.findUnique({ where: { id } });
  if (!word) return;
  await prisma.$transaction([
    prisma.flashCard.deleteMany({ where: { front: word.front, back: word.back, sourceTitle: ADMIN_SOURCE } }),
    prisma.cardWord.delete({ where: { id } }),
  ]);
  revalidatePath("/admin/cards");
}
