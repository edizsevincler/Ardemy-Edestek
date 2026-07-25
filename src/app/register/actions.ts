"use server";

import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { sendVerificationEmail } from "@/lib/email";

type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function registerGuest(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!name || !email || !password) {
    return { status: "error", message: "Tüm alanları doldurun." };
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: "Geçerli bir e-posta girin." };
  }
  if (password.length < 6) {
    return { status: "error", message: "Şifre en az 6 karakter olmalı." };
  }
  if (password !== passwordConfirm) {
    return { status: "error", message: "Şifreler eşleşmiyor." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return {
      status: "error",
      message: "Bu e-posta ile zaten bir hesap var. Giriş yapmayı deneyin.",
    };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, passwordHash, role: "GUEST" },
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
    await sendVerificationEmail(email, name, token);
  } catch (error) {
    // Mail gönderilemezse hesabı yarım bırakmayalım — kullanıcı aynı
    // e-postayla tekrar deneyebilsin diye kaydı geri alıyoruz.
    await prisma.user.delete({ where: { id: user.id } });
    console.error("Doğrulama e-postası gönderilemedi:", error);
    return {
      status: "error",
      message: "Onay e-postası gönderilemedi. Lütfen birazdan tekrar deneyin.",
    };
  }

  return { status: "success" };
}
