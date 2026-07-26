"use server";

import { prisma } from "@/lib/prisma";
import { saveUploadedFile, getPdfPageCount } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import type { QuestionType } from "@/generated/prisma/client";

function parseQuestionType(value: FormDataEntryValue | null): QuestionType {
  if (value === "TOPIC" || value === "QUIZ") return value;
  return "QUESTION";
}

type CreateQuestionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function createQuestion(
  _prevState: CreateQuestionState,
  formData: FormData
): Promise<CreateQuestionState> {
  const type = parseQuestionType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const creditCost = Number(formData.get("creditCost") ?? 1);
  const isPublished = formData.get("isPublished") === "on";
  const file = formData.get("file");

  if (!title || !subject) {
    return { status: "error", message: "Başlık ve konu gerekli." };
  }
  if (!Number.isFinite(creditCost) || creditCost < 0) {
    return { status: "error", message: "Kredi bedeli negatif olamaz." };
  }

  let fileUrl: string | undefined;
  let fileName: string | undefined;
  let pageCount: number | null = null;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedFile(file, "questions");
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
    pageCount = await getPdfPageCount(file);
  }

  await prisma.question.create({
    data: {
      type,
      title,
      subject,
      body: body || null,
      fileUrl,
      fileName,
      pageCount,
      creditCost: Math.round(creditCost),
      isPublished,
    },
  });

  revalidatePath("/admin/questions");

  return { status: "success" };
}

type EditQuestionState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function editQuestion(
  _prevState: EditQuestionState,
  formData: FormData
): Promise<EditQuestionState> {
  const id = String(formData.get("id") ?? "");
  const type = parseQuestionType(formData.get("type"));
  const title = String(formData.get("title") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const creditCost = Number(formData.get("creditCost") ?? 1);
  const isPublished = formData.get("isPublished") === "on";
  const file = formData.get("file");

  if (!title || !subject) {
    return { status: "error", message: "Başlık ve konu gerekli." };
  }

  const existing = await prisma.question.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "Soru bulunamadı." };
  }

  let fileUrl = existing.fileUrl;
  let fileName = existing.fileName;
  let pageCount = existing.pageCount;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedFile(file, "questions");
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
    pageCount = await getPdfPageCount(file);
  }

  await prisma.question.update({
    where: { id },
    data: {
      type,
      title,
      subject,
      body: body || null,
      fileUrl,
      fileName,
      pageCount,
      creditCost: Math.round(creditCost),
      isPublished,
    },
  });

  revalidatePath("/admin/questions");

  return { status: "success" };
}

// Krediyle açılmış (satılmış) bir soru sessizce silinmez — kilidini açmış
// kullanıcılar mağdur olmasın diye sadece yayından kaldırılır.
export async function deleteQuestion(id: string) {
  const unlockCount = await prisma.questionUnlock.count({
    where: { questionId: id },
  });

  if (unlockCount > 0) {
    await prisma.question.update({
      where: { id },
      data: { isPublished: false },
    });
    revalidatePath("/admin/questions");
    return { deleted: false, unlockCount };
  }

  await prisma.question.delete({ where: { id } });
  revalidatePath("/admin/questions");
  return { deleted: true, unlockCount: 0 };
}
