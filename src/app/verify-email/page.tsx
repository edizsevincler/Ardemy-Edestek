import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";

async function verifyToken(token: string | undefined) {
  if (!token) return "missing" as const;

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });
  if (!record) return "invalid" as const;

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return "expired" as const;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return "success" as const;
}

const MESSAGES = {
  success: {
    title: "E-postanız onaylandı",
    body: "Artık hesabınızla giriş yapabilirsiniz.",
  },
  expired: {
    title: "Linkin süresi dolmuş",
    body: "Bu doğrulama linki artık geçerli değil. Tekrar kayıt olmayı deneyin.",
  },
  invalid: {
    title: "Geçersiz link",
    body: "Bu doğrulama linki tanınmıyor. Linki e-postadaki haliyle tam olarak kullandığınızdan emin olun.",
  },
  missing: {
    title: "Geçersiz bağlantı",
    body: "Bu sayfaya bir doğrulama linki olmadan ulaştınız.",
  },
} as const;

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyToken(token);
  const { title, body } = MESSAGES[result];

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
        <Logo size={64} />
        <h1 className="text-xl font-semibold text-brand-950">{title}</h1>
        <p className="text-sm text-slate-500">{body}</p>
        <Link
          href="/login"
          className="inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          Giriş sayfasına dön
        </Link>
      </div>
    </main>
  );
}
