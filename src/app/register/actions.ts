"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

type RegisterState =
  | { status: "idle" }
  | { status: "error"; message: string };

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
  await prisma.user.create({
    data: { name, email, passwordHash, role: "GUEST" },
  });

  try {
    await signIn("credentials", {
      username: email,
      password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        status: "error",
        message: "Hesap oluşturuldu ama giriş başarısız oldu, lütfen giriş yapın.",
      };
    }
    throw error;
  }

  return { status: "idle" };
}
