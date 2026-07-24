"use server";

import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

type CreateAssignmentState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; count: number };

export async function createAssignment(
  _prevState: CreateAssignmentState,
  formData: FormData
): Promise<CreateAssignmentState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const dueDateRaw = String(formData.get("dueDate") ?? "");
  const studentIds = formData.getAll("studentIds").map(String);
  const file = formData.get("file");

  if (!title) {
    return { status: "error", message: "Ödev başlığı gerekli." };
  }
  if (studentIds.length === 0) {
    return { status: "error", message: "En az bir öğrenci seçin." };
  }

  let fileUrl: string | undefined;
  let fileName: string | undefined;
  if (file instanceof File && file.size > 0) {
    const saved = await saveUploadedFile(file, "assignments");
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
  }

  await prisma.assignment.createMany({
    data: studentIds.map((studentId) => ({
      title,
      description: description || null,
      dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
      studentId,
      fileUrl,
      fileName,
    })),
  });

  revalidatePath("/admin/assignments");

  return { status: "success", count: studentIds.length };
}
