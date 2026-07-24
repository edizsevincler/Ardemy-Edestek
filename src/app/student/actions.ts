"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

type SubmitState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function submitAssignment(
  _prevState: SubmitState,
  formData: FormData
): Promise<SubmitState> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const assignmentId = String(formData.get("assignmentId") ?? "");
  const note = String(formData.get("note") ?? "").trim();
  const file = formData.get("file");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.studentId !== session.user.id) {
    return { status: "error", message: "Bu ödev size ait değil." };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Bir dosya seçin." };
  }

  const saved = await saveUploadedFile(file, "submissions");

  await prisma.assignmentSubmission.create({
    data: {
      assignmentId,
      studentId: session.user.id,
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      note: note || null,
    },
  });

  revalidatePath("/student");

  return { status: "success" };
}
