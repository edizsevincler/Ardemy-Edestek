import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import {
  clearLoginFailures,
  isLoginLocked,
  recordLoginFailure,
} from "@/lib/login-throttle";

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

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
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
