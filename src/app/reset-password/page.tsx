import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { AuthShell } from "@/components/AuthShell";
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
    <AuthShell>

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
    </AuthShell>
  );
}
