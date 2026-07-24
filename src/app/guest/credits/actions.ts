"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { chargeCard } from "@/lib/payment";
import { revalidatePath } from "next/cache";

type BuyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; credits: number };

export async function buyCreditPackage(
  _prevState: BuyState,
  formData: FormData
): Promise<BuyState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "GUEST") {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const packageId = String(formData.get("packageId") ?? "");
  const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    return { status: "error", message: "Bu paket artık satışta değil." };
  }

  const payment = await chargeCard(Number(pkg.priceTRY));

  await prisma.creditPurchase.create({
    data: {
      userId: session.user.id,
      packageId: pkg.id,
      credits: pkg.credits,
      amount: pkg.priceTRY,
      status: payment.success ? "PAID" : "FAILED",
      iyzicoPaymentId: payment.iyzicoPaymentId,
    },
  });

  if (!payment.success) {
    return { status: "error", message: "Ödeme başarısız oldu." };
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { increment: pkg.credits } },
  });

  revalidatePath("/guest");
  revalidatePath("/guest/credits");

  return { status: "success", credits: updated.credits };
}
