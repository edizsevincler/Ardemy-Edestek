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

  const [unreadCount, pendingPaymentsCount] = await Promise.all([
    prisma.message.count({
      where: { senderRole: "STUDENT", read: false },
    }),
    prisma.creditPurchase.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between bg-brand-950 px-6 py-4 shadow-md">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-xs uppercase tracking-wide text-brand-200">
                Yönetici Paneli
              </p>
              <p className="font-medium text-white">{session.user.name}</p>
            </div>
          </div>
          <nav className="flex gap-4 text-sm text-brand-100">
            <Link href="/admin" className="transition hover:text-gold-400">
              Panel
            </Link>
            <Link href="/admin/students" className="transition hover:text-gold-400">
              Öğrenciler
            </Link>
            <Link href="/admin/guests" className="transition hover:text-gold-400">
              Misafirler
            </Link>
            <Link href="/admin/assignments" className="transition hover:text-gold-400">
              Ödevler
            </Link>
            <Link href="/admin/lesson-files" className="transition hover:text-gold-400">
              Ders Dosyaları
            </Link>
            <Link href="/admin/questions" className="transition hover:text-gold-400">
              Soru Bankası
            </Link>
            <Link href="/admin/credit-packages" className="transition hover:text-gold-400">
              Kredi Paketleri
            </Link>
            <Link
              href="/admin/pending-payments"
              className="flex items-center gap-1.5 transition hover:text-gold-400"
            >
              Bekleyen Ödemeler
              {pendingPaymentsCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {pendingPaymentsCount}
                </span>
              )}
            </Link>
            <Link
              href="/admin/messages"
              className="flex items-center gap-1.5 transition hover:text-gold-400"
            >
              Mesajlar
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8 animate-fade-in">{children}</main>
    </div>
  );
}
