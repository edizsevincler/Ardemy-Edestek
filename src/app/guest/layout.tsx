import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    redirect("/login");
  }

  const isStudent = session.user.role === "STUDENT";

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between bg-brand-950 px-6 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-200">
                Ardemy Academy
              </p>
              <p className="font-medium text-white">{session.user.name}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm text-brand-100">
            {isStudent && (
              <Link
                href="/student"
                className="transition hover:text-gold-400"
              >
                ← Öğrenci Paneli
              </Link>
            )}
            <Link href="/guest" className="transition hover:text-gold-400">
              Panel
            </Link>
            <Link href="/guest/questions" className="transition hover:text-gold-400">
              Sorular
            </Link>
            <Link href="/guest/credits" className="transition hover:text-gold-400">
              Kredi Satın Al
            </Link>
            <Link href="/guest/history" className="transition hover:text-gold-400">
              Geçmişim
            </Link>
            <span className="rounded-full bg-gold-500/20 px-2.5 py-1 text-xs font-medium text-gold-400">
              {me?.credits ?? 0} kredi
            </span>
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
