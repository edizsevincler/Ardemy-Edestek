"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Kullanıcı sıralamada adının görünüp görünmeyeceğini seçer.
export async function setShowInRanking(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;
  const show = formData.get("show") === "1";
  await prisma.user.update({ where: { id: session.user.id }, data: { showInRanking: show } });
  revalidatePath("/guest/ranking");
}
