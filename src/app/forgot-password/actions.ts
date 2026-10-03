"use server";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import { hashResetToken } from "@/lib/password-reset";

type State =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

const RESET_TTL_MS = 60 * 60 * 1000; // 1 saat
const MIN_INTERVAL_MS = 2 * 60 * 1000; // aynı kullanıcıya 2 dakikada bir

export async function requestPasswordReset(
  _prev: State,
  formData: FormData
): Promise<State> {
  const { locale, t } = await getI18n();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: t("Geçerli bir e-posta girin.") };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (user && (user.role === "GUEST" || user.role === "STUDENT")) {
    // Sık tekrarlanan istekler yeni link üretmez (e-posta bombardımanını önler).
    const recent = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        createdAt: { gt: new Date(Date.now() - MIN_INTERVAL_MS) },
      },
    });
    if (!recent) {
      const token = randomBytes(32).toString("hex");
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashResetToken(token),
          expiresAt: new Date(Date.now() + RESET_TTL_MS),
        },
      });
      try {
        await sendPasswordResetEmail(
          email,
          user.name,
          token,
          isLocale(user.locale) ? user.locale : locale
        );
      } catch (error) {
        console.error("Şifre sıfırlama e-postası gönderilemedi:", error);
      }
    }
  }

  // Hesap var ya da yok, her zaman aynı cevap: hesap varlığı sızdırılmaz.
  return { status: "success" };
}
