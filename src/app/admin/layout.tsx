import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [unreadCount, pendingPaymentsCount, pendingStreakRewardsCount] =
    await Promise.all([
      prisma.message.count({
        where: { senderRole: "STUDENT", read: false },
      }),
      prisma.creditPurchase.count({ where: { status: "PENDING" } }),
      prisma.streakReward.count({ where: { fulfilled: false } }),
    ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-950 px-4 py-3 shadow-md sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={36} className="shrink-0" />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-wide text-brand-200 sm:text-xs">
                Yönetici Paneli
              </p>
              <p className="truncate text-sm font-medium text-white sm:text-base">
                {session.user.name}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
        <nav className="-mx-4 mt-3 flex gap-x-4 gap-y-2 overflow-x-auto whitespace-nowrap px-4 text-sm text-brand-100 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/admin" className="shrink-0 transition hover:text-gold-400">
            Panel
          </Link>
          <Link href="/admin/students" className="shrink-0 transition hover:text-gold-400">
            Öğrenciler
          </Link>
          <Link href="/admin/guests" className="shrink-0 transition hover:text-gold-400">
            Misafirler
          </Link>
          <Link href="/admin/assignments" className="shrink-0 transition hover:text-gold-400">
            Ödevler
          </Link>
          <Link href="/admin/lesson-files" className="shrink-0 transition hover:text-gold-400">
            Ders Dosyaları
          </Link>
          <Link href="/admin/questions" className="shrink-0 transition hover:text-gold-400">
            Soru Bankası
          </Link>
          <Link href="/admin/credit-packages" className="shrink-0 transition hover:text-gold-400">
            Kredi Paketleri
          </Link>
          <Link
            href="/admin/pending-payments"
            className="flex shrink-0 items-center gap-1.5 transition hover:text-gold-400"
          >
            Bekleyen Ödemeler
            {pendingPaymentsCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                {pendingPaymentsCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/streak-rewards"
            className="flex shrink-0 items-center gap-1.5 transition hover:text-gold-400"
          >
            🔥 Seri Ödülleri
            {pendingStreakRewardsCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                {pendingStreakRewardsCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/messages"
            className="flex shrink-0 items-center gap-1.5 transition hover:text-gold-400"
          >
            Mesajlar
            {unreadCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                {unreadCount}
              </span>
            )}
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 animate-fade-in sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
