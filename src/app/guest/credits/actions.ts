"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type BuyState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

// iyzico henüz kurulmadığı için satın alma anında kredi vermiyoruz — kayıt
// PENDING olarak açılır, kullanıcı havaleyi gönderir, admin dekontu görüp
// /admin/pending-payments üzerinden onaylayınca kredi hesaba işlenir.
export async function requestCreditPurchase(
  _prevState: BuyState,
  formData: FormData
): Promise<BuyState> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const packageId = String(formData.get("packageId") ?? "");
  const pkg = await prisma.creditPackage.findUnique({ where: { id: packageId } });
  if (!pkg || !pkg.isActive) {
    return { status: "error", message: "Bu paket artık satışta değil." };
  }

  await prisma.creditPurchase.create({
    data: {
      userId: session.user.id,
      packageId: pkg.id,
      credits: pkg.credits,
      amount: pkg.priceTRY,
      status: "PENDING",
    },
  });

  revalidatePath("/guest/credits");
  revalidatePath("/guest/history");
  revalidatePath("/admin/pending-payments");

  return { status: "success" };
}
