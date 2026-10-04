import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { consumeLoginToken } from "@/lib/login-links";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/login-throttle";

type LoginUser = {
  id: string;
  name: string;
  username: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
  lastLoginAt: Date | null;
};

// Her başarılı girişten sonra: son giriş zamanı güncellenir; kullanıcı ilk kez
// giriş yapıyorsa yöneticiye e-posta gider. Hata girişi engellemez.
async function afterLogin(user: LoginUser) {
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  if (!user.lastLoginAt && user.role !== "ADMIN") {
    try {
      const { sendAdminAlertEmail } = await import("@/lib/email");
      await sendAdminAlertEmail(
        `👋 ${user.name} ilk kez giriş yaptı`,
        [
          `Ad Soyad: ${user.name}`,
          `Hesap türü: ${user.role === "STUDENT" ? "Öğrenci" : "Misafir"}`,
          `Kullanıcı adı / e-posta: ${user.username ?? user.email ?? "-"}`,
          `Hesap oluşturulma: ${user.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
          `İlk giriş: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
        ].join("\n")
      );
    } catch (error) {
      console.error("İlk giriş bildirimi gönderilemedi:", error);
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        username: { label: "Kullanıcı adı", type: "text" },
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        const username = credentials?.username;
        const password = credentials?.password;
        if (typeof username !== "string" || typeof password !== "string") {
          return null;
        }

        // Kilitliyse şifre denemesine hiç izin verilmez (şifre tahminini zorlaştırır).
        if (await isLoginLocked(username)) return null;

        const user = await prisma.user.findFirst({
          where: {
            OR: [{ username }, { email: username }],
          },
        });
        if (!user) {
          await recordLoginFailure(username);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        if (!valid) {
          await recordLoginFailure(username);
          return null;
        }
        await clearLoginFailures(username);

        await afterLogin(user);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
    // E-posta onayından hemen sonra tek kullanımlık jetonla otomatik giriş
    // (bkz. lib/login-links.ts ve app/verify-email).
    Credentials({
      id: "verified-login",
      credentials: { token: { label: "Token", type: "text" } },
      authorize: async (credentials) => {
        const token = credentials?.token;
        if (typeof token !== "string") return null;
        const userId = await consumeLoginToken(token);
        if (!userId) return null;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return null;
        // Yalnızca e-postası onaylı kullanıcılar bu yoldan girebilir.
        if (user.role === "GUEST" && !user.emailVerified) return null;
        await afterLogin(user);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/admin")) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }
      if (pathname.startsWith("/student")) {
        return isLoggedIn && auth.user.role === "STUDENT";
      }
      if (pathname.startsWith("/guest")) {
        return (
          isLoggedIn &&
          (auth.user.role === "GUEST" || auth.user.role === "STUDENT")
        );
      }
      return true;
    },
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.id = token.sub as string;
      }
      return session;
    },
  },
});
