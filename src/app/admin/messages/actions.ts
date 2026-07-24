"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type SendMessageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function sendAdminMessage(
  _prevState: SendMessageState,
  formData: FormData
): Promise<SendMessageState> {
  const studentId = String(formData.get("studentId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!body) {
    return { status: "error", message: "Mesaj boş olamaz." };
  }

  await prisma.message.create({
    data: { studentId, body, senderRole: "ADMIN" },
  });

  revalidatePath(`/admin/messages/${studentId}`);
  revalidatePath("/admin/messages");
  revalidatePath("/student", "layout");
  revalidatePath("/student/messages");

  return { status: "success" };
}

// Sohbet sayfası açıldığında istemci tarafından çağrılır. Mesajları okundu
// yapmak bir Server Component render'ı sırasında değil, burada (Server
// Action) yapılır; `revalidatePath(..., "layout")` sayesinde üst paneldeki
// okunmamış mesaj rozeti de hemen güncellenir (layout, sayfalar arası
// geçişte normalde yeniden render edilmez).
export async function markThreadRead(studentId: string) {
  await prisma.message.updateMany({
    where: { studentId, senderRole: "STUDENT", read: false },
    data: { read: true },
  });

  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");
}
