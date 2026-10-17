"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ItemState = { status: "idle" } | { status: "error"; message: string } | { status: "success" };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Yetkisiz");
}

function refresh(questionId: string) {
  revalidatePath(`/admin/questions/${questionId}/written`);
  revalidatePath(`/guest/questions/${questionId}`);
}

// Yazılı teste yeni soru ekler (sona).
export async function addWrittenItem(_prev: ItemState, formData: FormData): Promise<ItemState> {
  await requireAdmin();
  const questionId = String(formData.get("questionId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!prompt) return { status: "error", message: "Soru metni gerekli." };

  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { type: true } });
  if (question?.type !== "WRITTEN") return { status: "error", message: "Bu bir yazılı test değil." };

  const last = await prisma.writtenItem.findFirst({ where: { questionId }, orderBy: { order: "desc" } });
  await prisma.writtenItem.create({
    data: { questionId, prompt, answer: answer || null, order: (last?.order ?? 0) + 1 },
  });
  refresh(questionId);
  return { status: "success" };
}

export async function updateWrittenItem(_prev: ItemState, formData: FormData): Promise<ItemState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (!prompt) return { status: "error", message: "Soru metni gerekli." };
  const item = await prisma.writtenItem.update({ where: { id }, data: { prompt, answer: answer || null } });
  refresh(item.questionId);
  return { status: "success" };
}

// Soruyu siler ve kalanları 1'den başlayarak yeniden numaralar.
export async function deleteWrittenItem(id: string) {
  await requireAdmin();
  const item = await prisma.writtenItem.delete({ where: { id } });
  const rest = await prisma.writtenItem.findMany({ where: { questionId: item.questionId }, orderBy: { order: "asc" } });
  await prisma.$transaction([
    // Önce geçici negatif sıralar: unique (questionId, order) çakışmasın.
    ...rest.map((r, i) => prisma.writtenItem.update({ where: { id: r.id }, data: { order: -(i + 1) } })),
    ...rest.map((r, i) => prisma.writtenItem.update({ where: { id: r.id }, data: { order: i + 1 } })),
  ]);
  refresh(item.questionId);
}
