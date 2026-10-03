"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  const t = await getT();
  const username = String(formData.get("username") ?? "");

  const existing = await prisma.user.findFirst({
    where: { OR: [{ username }, { email: username }] },
  });
  if (existing && existing.role === "GUEST" && !existing.emailVerified) {
    return t("E-postanızı henüz onaylamadınız. Kayıt olurken gönderilen linke tıklayın.");
  }

  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return t("Kullanıcı adı veya şifre hatalı.");
    }
    throw error;
  }
}
