"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { getT } from "@/lib/i18n/server";
import { hashResetToken } from "@/lib/password-reset";

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function resetPassword(
  _prev: State,
  formData: FormData
): Promise<State> {
  const t = await getT();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("passwordConfirm") ?? "");

  if (password.length < 6) {
    return { status: "error", message: t("Şifre en az 6 karakter olmalı.") };
  }
  if (password !== confirm) {
    return { status: "error", message: t("Şifreler eşleşmiyor.") };
  }

  const record = token
    ? await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashResetToken(token) },
      })
    : null;
  if (!record || record.expiresAt < new Date()) {
    return {
      status: "error",
      message: t("Bu şifre sıfırlama linki geçersiz ya da süresi dolmuş."),
    };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: record.userId },
    select: { emailVerified: true },
  });

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: {
        passwordHash,
        // Linke e-postadan ulaşmak adresin sahibi olduğunu da kanıtlar.
        ...(user.emailVerified ? {} : { emailVerified: new Date() }),
      },
    }),
    // Link tek kullanımlıktır; bekleyen diğer linkler de geçersiz kılınır.
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { status: "success" };
}
