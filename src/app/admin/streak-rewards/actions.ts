"use server";

import { requireAdmin } from "@/lib/admin-guard";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markRewardFulfilled(rewardId: string) {
  await requireAdmin();
  await prisma.streakReward.update({
    where: { id: rewardId },
    data: { fulfilled: true, fulfilledAt: new Date() },
  });

  revalidatePath("/admin/streak-rewards");
}
