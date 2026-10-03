"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { findCosmetic } from "@/lib/cosmetics";
import { revalidatePath } from "next/cache";

type Result = { status: "success" } | { status: "error"; message: string };

async function requireUserId() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return null;
  }
  return session.user.id;
}

function refresh() {
  // Başlıktaki kredi/unvan/çerçeve tüm panel sayfalarında göründüğü için
  // layout seviyesinde yenilenir.
  revalidatePath("/guest", "layout");
  revalidatePath("/student", "layout");
}

export async function buyCosmetic(itemId: string): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { status: "error", message: "Oturum bulunamadı." };

  const item = findCosmetic(itemId);
  if (!item) return { status: "error", message: "Ürün bulunamadı." };

  try {
    await prisma.$transaction(async (tx) => {
      // Kredi düşümü atomik: yeterli kredi yoksa hiçbir şey değişmez.
      const paid = await tx.user.updateMany({
        where: { id: userId, credits: { gte: item.price } },
        data: { credits: { decrement: item.price } },
      });
      if (paid.count === 0) throw new Error("NO_CREDITS");

      // Aynı ürünü iki kez almayı benzersiz kayıt engeller (P2002).
      await tx.userCosmetic.create({ data: { userId, itemId } });

      // Yeni alınan ürün hemen takılır.
      await tx.user.update({
        where: { id: userId },
        data:
          item.kind === "title"
            ? { equippedTitle: itemId }
            : { equippedFrame: itemId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CREDITS") {
      return { status: "error", message: "Yeterli krediniz yok." };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "error", message: "Bu ürüne zaten sahipsin." };
    }
    throw error;
  }

  refresh();
  return { status: "success" };
}

// itemId null ise ilgili türdeki ürün çıkarılır.
export async function equipCosmetic(
  kind: "title" | "frame",
  itemId: string | null
): Promise<Result> {
  const userId = await requireUserId();
  if (!userId) return { status: "error", message: "Oturum bulunamadı." };

  if (itemId !== null) {
    const item = findCosmetic(itemId);
    if (!item || item.kind !== kind) {
      return { status: "error", message: "Ürün bulunamadı." };
    }
    const owned = await prisma.userCosmetic.findUnique({
      where: { userId_itemId: { userId, itemId } },
    });
    if (!owned) return { status: "error", message: "Bu ürüne sahip değilsin." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: kind === "title" ? { equippedTitle: itemId } : { equippedFrame: itemId },
  });

  refresh();
  return { status: "success" };
}
