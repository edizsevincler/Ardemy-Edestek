"use server";

import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

type UploadLessonFileState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; count: number };

export async function uploadLessonFile(
  _prevState: UploadLessonFileState,
  formData: FormData
): Promise<UploadLessonFileState> {
  const title = String(formData.get("title") ?? "").trim();
  const lessonDateRaw = String(formData.get("lessonDate") ?? "");
  const studentIds = formData.getAll("studentIds").map(String);
  const file = formData.get("file");

  if (!title) {
    return { status: "error", message: "Dosya başlığı gerekli." };
  }
  if (studentIds.length === 0) {
    return { status: "error", message: "En az bir öğrenci seçin." };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Bir dosya seçin." };
  }

  const saved = await saveUploadedFile(file, "lesson-files");
  const lessonDate = lessonDateRaw ? new Date(lessonDateRaw) : null;

  await prisma.lessonFile.createMany({
    data: studentIds.map((studentId) => ({
      title,
      studentId,
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      lessonDate,
    })),
  });

  revalidatePath("/admin/lesson-files");

  return { status: "success", count: studentIds.length };
}

type EditLessonFileState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function editLessonFile(
  _prevState: EditLessonFileState,
  formData: FormData
): Promise<EditLessonFileState> {
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const lessonDateRaw = String(formData.get("lessonDate") ?? "");
  const file = formData.get("file");

  if (!title) {
    return { status: "error", message: "Başlık gerekli." };
  }

  const existing = await prisma.lessonFile.findUnique({ where: { id } });
  if (!existing) {
    return { status: "error", message: "Dosya bulunamadı." };
  }

  let fileUrl = existing.fileUrl;
  let fileName = existing.fileName;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedFile(file, "lesson-files");
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
  }

  await prisma.lessonFile.update({
    where: { id },
    data: {
      title,
      lessonDate: lessonDateRaw ? new Date(lessonDateRaw) : null,
      fileUrl,
      fileName,
    },
  });

  revalidatePath("/admin/lesson-files");

  return { status: "success" };
}

// Only the DB row is removed — the underlying file on disk is left in place
// because the same fileUrl can be shared by several students (bulk upload).
export async function deleteLessonFile(id: string) {
  await prisma.lessonFile.delete({ where: { id } });
  revalidatePath("/admin/lesson-files");
}
