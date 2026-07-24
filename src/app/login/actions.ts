"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticate(_prevState: string | undefined, formData: FormData) {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Kullanıcı adı veya şifre hatalı.";
    }
    throw error;
  }
}
