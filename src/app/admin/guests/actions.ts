"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generatePassword } from "@/lib/generate";
import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { sendVerificationEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";

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

async function isAdmin() {
  const session = await auth();
  return session?.user.role === "ADMIN";
}

// Onay e-postası ulaşmayan misafire yeni bir onay linki gönderir (eski
// linkler geçersiz kılınır).
export async function resendVerification(userId: string) {
  if (!(await isAdmin())) return { ok: false, message: "Yetkisiz işlem." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, emailVerified: true, locale: true },
  });
  if (!user?.email) return { ok: false, message: "Bu kullanıcının e-postası yok." };
  if (user.emailVerified) return { ok: false, message: "E-posta zaten onaylı." };

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.deleteMany({ where: { userId } });
  await prisma.verificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  try {
    await sendVerificationEmail(
      user.email,
      user.name,
      token,
      isLocale(user.locale) ? user.locale : "tr"
    );
  } catch (error) {
    console.error("Onay e-postası yeniden gönderilemedi:", error);
    return { ok: false, message: "E-posta gönderilemedi, birazdan tekrar deneyin." };
  }
  return { ok: true, message: `Onay e-postası ${user.email} adresine gönderildi (spam klasörüne de bakmasını söyleyin).` };
}

// E-posta ulaşmıyorsa yönetici hesabı elle onaylayabilir.
export async function verifyGuestManually(userId: string) {
  if (!(await isAdmin())) return { ok: false, message: "Yetkisiz işlem." };

  await prisma.user.update({
    where: { id: userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId } });

  revalidatePath("/admin/guests");
  return { ok: true, message: "" };
}
