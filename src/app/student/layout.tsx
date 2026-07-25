import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [unreadCount, me] = await Promise.all([
    prisma.message.count({
      where: { studentId: session.user.id, senderRole: "ADMIN", read: false },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between bg-brand-950 px-6 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-200">
                Öğrenci Paneli
              </p>
              <p className="font-medium text-white">{session.user.name}</p>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-sm text-brand-100">
            <Link href="/student" className="transition hover:text-gold-400">
              Panel
            </Link>
            <Link
              href="/student/messages"
              className="flex items-center gap-1.5 transition hover:text-gold-400"
            >
              Mesajlar
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
            <Link
              href="/guest/questions"
              className="transition hover:text-gold-400"
            >
              İçerikler
            </Link>
            <Link
              href="/guest/credits"
              className="transition hover:text-gold-400"
            >
              Kredi Satın Al
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
