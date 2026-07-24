"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approvePayment(purchaseId: string) {
  const purchase = await prisma.creditPurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase || purchase.status !== "PENDING") return;

  await prisma.$transaction([
    prisma.creditPurchase.update({
      where: { id: purchaseId },
      data: { status: "PAID" },
    }),
    prisma.user.update({
      where: { id: purchase.userId },
      data: { credits: { increment: purchase.credits } },
    }),
  ]);

  revalidatePath("/admin/pending-payments");
  revalidatePath("/admin/students");
  revalidatePath("/admin/guests");
  revalidatePath("/guest");
  revalidatePath("/student");
}

export async function rejectPayment(purchaseId: string) {
  const purchase = await prisma.creditPurchase.findUnique({
    where: { id: purchaseId },
  });
  if (!purchase || purchase.status !== "PENDING") return;

  await prisma.creditPurchase.update({
    where: { id: purchaseId },
    data: { status: "FAILED" },
  });

  revalidatePath("/admin/pending-payments");
}
