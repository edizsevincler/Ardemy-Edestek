import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileMenu } from "@/components/MobileMenu";
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

  const [unreadCount, pendingPaymentsCount, pendingStreakRewardsCount, openReportsCount] =
    await Promise.all([
      prisma.message.count({
        where: { senderRole: "STUDENT", read: false },
      }),
      prisma.creditPurchase.count({ where: { status: "PENDING" } }),
      prisma.streakReward.count({ where: { fulfilled: false } }),
      prisma.questionReport.count({ where: { status: "OPEN" } }),
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
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <ThemeToggle />
            <SignOutButton />
          </div>
          <MobileMenu
            items={[
              { href: "/admin", label: "Panel", exact: true },
              { href: "/admin/students", label: "Öğrenciler" },
              { href: "/admin/guests", label: "Misafirler" },
              { href: "/admin/assignments", label: "Ödevler" },
              { href: "/admin/lesson-files", label: "Ders Dosyaları" },
              { href: "/admin/questions", label: "Soru Bankası" },
              { href: "/admin/cards", label: "🃏 Kelime Kartları" },
              { href: "/admin/credit-packages", label: "Kredi Paketleri" },
              { href: "/admin/pending-payments", label: "Bekleyen Ödemeler", badge: pendingPaymentsCount },
              { href: "/admin/streak-rewards", label: "🔥 Seri Ödülleri", badge: pendingStreakRewardsCount },
              { href: "/admin/referrals", label: "🎁 Arkadaşını Getir" },
              { href: "/admin/visits", label: "📈 Ziyaretler" },
              { href: "/admin/sources", label: "📊 Kaynaklar" },
              { href: "/admin/social", label: "📣 Sosyal Medya" },
              { href: "/admin/reports", label: "🚩 Soru Bildirimleri", badge: openReportsCount },
              { href: "/admin/inactive-users", label: "Pasif Kullanıcılar" },
              { href: "/admin/messages", label: "Mesajlar", badge: unreadCount },
            ]}
          >
            <ThemeToggle />
            <SignOutButton />
          </MobileMenu>
        </div>
        <nav className="mt-3 hidden flex-wrap gap-x-4 gap-y-2 whitespace-nowrap text-sm text-brand-100 sm:flex">
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
          <Link href="/admin/cards" className="shrink-0 transition hover:text-gold-400">
            🃏 Kelime Kartları
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
            href="/admin/referrals"
            className="shrink-0 transition hover:text-gold-400"
          >
            🎁 Arkadaşını Getir
          </Link>
          <Link
            href="/admin/visits"
            className="shrink-0 transition hover:text-gold-400"
          >
            📈 Ziyaretler
          </Link>
          <Link
            href="/admin/sources"
            className="shrink-0 transition hover:text-gold-400"
          >
            📊 Kaynaklar
          </Link>
          <Link
            href="/admin/social"
            className="shrink-0 transition hover:text-gold-400"
          >
            📣 Sosyal Medya
          </Link>
          <Link
            href="/admin/reports"
            className="flex shrink-0 items-center gap-1.5 transition hover:text-gold-400"
          >
            🚩 Soru Bildirimleri
            {openReportsCount > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                {openReportsCount}
              </span>
            )}
          </Link>
          <Link
            href="/admin/inactive-users"
            className="shrink-0 transition hover:text-gold-400"
          >
            Pasif Kullanıcılar
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
