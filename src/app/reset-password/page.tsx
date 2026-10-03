import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";
import { ResetForm } from "./ResetForm";
import { hashResetToken } from "@/lib/password-reset";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getT();
  const { token } = await searchParams;

  const record = token
    ? await prisma.passwordResetToken.findUnique({
        where: { tokenHash: hashResetToken(token) },
      })
    : null;
  const valid = !!record && record.expiresAt > new Date();

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />
      <div className="absolute right-4 top-4">
        <LanguageSwitcher tone="dark" />
      </div>

      {valid && token ? (
        <ResetForm token={token} />
      ) : (
        <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
          <Logo size={64} />
          <h1 className="text-xl font-semibold text-brand-950">
            {t("Geçersiz veya süresi dolmuş link")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("Bu şifre sıfırlama linki geçersiz ya da süresi dolmuş. Lütfen yeni bir link isteyin.")}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("Yeni link iste")}
          </Link>
        </div>
      )}
    </main>
  );
}
