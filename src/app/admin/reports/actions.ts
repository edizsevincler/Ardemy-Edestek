"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN";
}

// Bir sorunun tüm açık bildirimlerini "çözüldü" işaretler.
export async function resolveReports(kind: string, itemId: string) {
  if (!(await isAdmin())) return;
  await prisma.questionReport.updateMany({
    where: { kind, itemId, status: "OPEN" },
    data: { status: "RESOLVED", resolvedAt: new Date() },
  });
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
}

// Bir sorunun tüm bildirimlerini siler (çözülenler listesini temizlemek için).
export async function deleteReports(kind: string, itemId: string) {
  if (!(await isAdmin())) return;
  await prisma.questionReport.deleteMany({ where: { kind, itemId } });
  revalidatePath("/admin/reports");
}
