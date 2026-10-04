import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { AuthShell } from "@/components/AuthShell";
import { getT } from "@/lib/i18n/server";
import { tx } from "@/lib/i18n/translate";
import { sendWelcomeEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";
import { claimEmail, releaseEmail } from "@/lib/reminders";
import { createLoginToken, LOGIN_TOKEN_PREFIX } from "@/lib/login-links";
import { AutoSignIn } from "./AutoSignIn";

type Verification =
  | { result: "missing" | "invalid" | "expired" }
  | { result: "success"; loginToken: string };

async function verifyToken(token: string | undefined): Promise<Verification> {
  if (!token) return { result: "missing" };
  // Otomatik giriş jetonları e-posta onayı için kullanılamaz.
  if (token.startsWith(LOGIN_TOKEN_PREFIX)) return { result: "invalid" };

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record) return { result: "invalid" };

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { result: "expired" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    // Link hemen silinmez: e-posta tarayıcıları/önizlemeler linki önceden açsa
    // bile kullanıcı tıkladığında çalışsın. 15 dakika sonra geçersiz olur.
    prisma.verificationToken.update({
      where: { id: record.id },
      data: { expiresAt: new Date(Math.min(record.expiresAt.getTime(), Date.now() + 15 * 60 * 1000)) },
    }),
  ]);

  // Karşılama e-postası (bir kez; hata verirse onayı etkilemez).
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    select: { id: true, name: true, email: true, locale: true, emailReminders: true },
  });
  if (user?.email && user.emailReminders && (await claimEmail(user.id, "welcome"))) {
    try {
      await sendWelcomeEmail(
        user.id,
        user.email,
        user.name,
        isLocale(user.locale) ? user.locale : "tr"
      );
    } catch (error) {
      await releaseEmail(user.id, "welcome");
      console.error("Karşılama e-postası gönderilemedi:", error);
    }
  }

  return { result: "success", loginToken: await createLoginToken(record.userId) };
}

const MESSAGES = {
  success: {
    title: tx("E-postanız onaylandı"),
    body: tx("Artık hesabınızla giriş yapabilirsiniz."),
  },
  expired: {
    title: tx("Linkin süresi dolmuş"),
    body: tx("Bu doğrulama linki artık geçerli değil. Tekrar kayıt olmayı deneyin."),
  },
  invalid: {
    title: tx("Geçersiz link"),
    body: tx("Bu doğrulama linki tanınmıyor. Linki e-postadaki haliyle tam olarak kullandığınızdan emin olun."),
  },
  missing: {
    title: tx("Geçersiz bağlantı"),
    body: tx("Bu sayfaya bir doğrulama linki olmadan ulaştınız."),
  },
} as const;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const t = await getT();
  const { token } = await searchParams;
  const verification = await verifyToken(token);
  const { title, body } = MESSAGES[verification.result];

  return (
    <AuthShell>
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
        <Logo size={64} />
        <h1 className="text-xl font-semibold text-brand-950">{t(title)}</h1>
        {verification.result === "success" ? (
          <AutoSignIn loginToken={verification.loginToken} />
        ) : (
          <>
            <p className="text-sm text-slate-500">{t(body)}</p>
            {verification.result !== "missing" && (
              <p className="text-sm text-slate-500">
                {t("E-postanı daha önce onayladıysan doğrudan giriş yapabilirsin.")}
              </p>
            )}
            <Link
              href="/login"
              className="inline-block text-sm font-medium text-brand-600 hover:underline"
            >
              {t("Giriş sayfasına dön")}
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}
