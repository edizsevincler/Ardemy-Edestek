"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";

type ItemState = { status: "idle" } | { status: "error"; message: string } | { status: "success" };

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Yetkisiz");
}

// Formdaki sayfa numarası (boş = sayfaya bağlı değil).
function parsePage(value: FormDataEntryValue | null): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
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
    data: {
      questionId,
      prompt,
      answer: answer || null,
      page: parsePage(formData.get("page")),
      order: (last?.order ?? 0) + 1,
    },
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
  const item = await prisma.writtenItem.update({
    where: { id },
    data: { prompt, answer: answer || null, page: parsePage(formData.get("page")) },
  });
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

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Sayfa görselleri ekler (taranmış/fotoğraflanmış sınav sayfaları); dosya adına göre
// sıralanıp mevcut sayfaların sonuna eklenir.
export async function uploadWrittenPages(_prev: ItemState, formData: FormData): Promise<ItemState> {
  await requireAdmin();
  const questionId = String(formData.get("questionId") ?? "");
  const files = formData
    .getAll("pages")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .sort((a, b) => a.name.localeCompare(b.name, "tr", { numeric: true }));
  if (files.length === 0) return { status: "error", message: "Görsel seçin." };
  if (files.some((f) => !IMAGE_TYPES.includes(f.type))) {
    return { status: "error", message: "Yalnızca JPG, PNG veya WEBP görsel yüklenebilir." };
  }

  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { pageImages: true } });
  if (!question) return { status: "error", message: "Test bulunamadı." };
  const urls: string[] = [];
  for (const file of files) urls.push((await saveUploadedFile(file, "written-pages")).fileUrl);
  await prisma.question.update({ where: { id: questionId }, data: { pageImages: [...question.pageImages, ...urls] } });
  refresh(questionId);
  return { status: "success" };
}

// Sayfayı kaldırır; o sayfadaki soruların sayfa bağı boşalır, sonraki sayfalara
// bağlı sorular bir sayfa yukarı kayar.
export async function deleteWrittenPage(questionId: string, page: number) {
  await requireAdmin();
  const question = await prisma.question.findUnique({ where: { id: questionId }, select: { pageImages: true } });
  if (!question || page < 1 || page > question.pageImages.length) return;
  await prisma.$transaction([
    prisma.question.update({
      where: { id: questionId },
      data: { pageImages: question.pageImages.filter((_, i) => i !== page - 1) },
    }),
    prisma.writtenItem.updateMany({ where: { questionId, page }, data: { page: null } }),
    prisma.writtenItem.updateMany({ where: { questionId, page: { gt: page } }, data: { page: { decrement: 1 } } }),
  ]);
  refresh(questionId);
}

