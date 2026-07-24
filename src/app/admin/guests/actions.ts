"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generatePassword } from "@/lib/generate";
import { revalidatePath } from "next/cache";

export async function resetGuestPassword(userId: string) {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  revalidatePath("/admin/guests");

  return { password };
}
