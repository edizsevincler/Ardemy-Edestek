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
      <header className="bg-brand-950 px-4 py-3 shadow-md sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={36} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-brand-200 sm:text-xs">
                Ardemy Academy
              </p>
              <p className="truncate text-sm font-medium text-white sm:text-base">
                {session.user.name}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
        <nav className="-mx-4 mt-3 flex items-center gap-x-4 gap-y-2 overflow-x-auto whitespace-nowrap px-4 text-sm text-brand-100 sm:mx-0 sm:flex-wrap sm:px-0">
          {isStudent && (
            <Link
              href="/student"
              className="shrink-0 transition hover:text-gold-400"
            >
              ← Öğrenci Paneli
            </Link>
          )}
          <Link href="/guest" className="shrink-0 transition hover:text-gold-400">
            Panel
          </Link>
          <Link href="/guest/questions" className="shrink-0 transition hover:text-gold-400">
            İçerikler
          </Link>
          <Link href="/guest/credits" className="shrink-0 transition hover:text-gold-400">
            Kredi Satın Al
          </Link>
          <Link href="/guest/history" className="shrink-0 transition hover:text-gold-400">
            Geçmişim
          </Link>
          <span className="shrink-0 rounded-full bg-gold-500/20 px-2.5 py-1 text-xs font-medium text-gold-400">
            {me?.credits ?? 0} kredi
          </span>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 animate-fade-in sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
