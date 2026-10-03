"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";
import { sanitizeSource, SOURCE_COOKIE } from "@/lib/source";
import { getI18n } from "@/lib/i18n/server";

type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function registerGuest(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const { locale, t } = await getI18n();
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");
  const consent = formData.get("consent");

  if (!name || !email || !password) {
    return { status: "error", message: t("Tüm alanları doldurun.") };
  }
  if (consent !== "on") {
    return {
      status: "error",
      message: t("Gizlilik Politikası'nı kabul etmelisiniz."),
    };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: t("Geçerli bir e-posta girin.") };
  }
  if (password.length < 6) {
    return { status: "error", message: t("Şifre en az 6 karakter olmalı.") };
  }
  if (password !== passwordConfirm) {
    return { status: "error", message: t("Şifreler eşleşmiyor.") };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      status: "error",
      message: t("Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin."),
    };
  }

  const refCode = String(formData.get("ref") ?? "").trim();
  const referrer = refCode
    ? await prisma.user.findUnique({ where: { referralCode: refCode } })
    : null;

  // Kaynak: çerezdeki kanal (ör. instagram); yoksa arkadaş linkiyle geldiyse
  // "arkadas-linki"; ikisi de yoksa boş (doğrudan/bilinmiyor).
  const cookieStore = await cookies();
  const signupSource =
    sanitizeSource(cookieStore.get(SOURCE_COOKIE)?.value) ??
    (referrer ? "arkadas-linki" : null);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "GUEST",
      referredById: referrer?.id,
      credits: SIGNUP_BONUS_CREDITS,
      signupSource,
      locale,
    },
  });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  try {
    await sendVerificationEmail(email, name, token, locale);
  } catch (error) {
    // Mail gönderilemezse hesabı yarım bırakmayalım — kullanıcı aynı
    // e-postayla tekrar deneyebilsin diye kaydı geri alıyoruz.
    await prisma.user.delete({ where: { id: user.id } });
    console.error("Doğrulama e-postası gönderilemedi:", error);
    return {
      status: "error",
      message: t("Onay e-postası gönderilemedi. Lütfen birazdan tekrar deneyin."),
    };
  }

  return { status: "success" };
}
