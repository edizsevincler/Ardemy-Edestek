"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

// E-posta onayı sonrası tek kullanımlık jetonla giriş yapar ve panele yönlendirir.
export async function completeSignIn(loginToken: string) {
  try {
    await signIn("verified-login", { token: loginToken, redirectTo: "/" });
  } catch (error) {
    if (error instanceof AuthError) return { ok: false as const };
    throw error; // başarılı girişteki yönlendirme de bir "hata" olarak fırlatılır
  }
  return { ok: true as const };
}
