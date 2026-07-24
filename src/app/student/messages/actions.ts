"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SendMessageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function sendStudentMessage(
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const session = await auth();
  if (!session?.user) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { status: "error", message: "Mesaj boş olamaz." };
  }

  await prisma.message.create({
    data: { studentId: session.user.id, body, senderRole: "STUDENT" },
  });

  revalidatePath("/student/messages");
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");

  return { status: "success" };
}

// Sohbet sayfası açıldığında istemci tarafından çağrılır — bkz.
// admin/messages/actions.ts içindeki markThreadRead için aynı gerekçe.
export async function markOwnMessagesRead() {
  const session = await auth();
  if (!session?.user) return;

  await prisma.message.updateMany({
    where: { studentId: session.user.id, senderRole: "ADMIN", read: false },
    data: { read: true },
  });

  revalidatePath("/student", "layout");
}
