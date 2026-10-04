"use server";

import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/reminders";

// E-postadaki imzalı linkten gelen onayla hatırlatma e-postalarını kapatır.
export async function confirmUnsubscribe(formData: FormData) {
  const userId = String(formData.get("u") ?? "");
  const token = String(formData.get("t") ?? "");
  if (!userId || !token || !verifyUnsubscribeToken(userId, token)) {
    return { ok: false };
  }
  await prisma.user.updateMany({
    where: { id: userId },
    data: { emailReminders: false },
  });
  return { ok: true };
}
