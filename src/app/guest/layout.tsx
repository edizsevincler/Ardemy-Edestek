import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";
import { prisma } from "@/lib/prisma";
import { displayStreak } from "@/lib/streak";
import { UserAvatar } from "@/components/UserAvatar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getT } from "@/lib/i18n/server";
import { findTitle } from "@/lib/cosmetics";
import { InstallPrompt } from "@/components/InstallPrompt";
import { BottomNav } from "@/components/BottomNav";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getT();
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
    select: {
        credits: true,
        currentStreak: true,
        lastStreakDate: true,
        streakFreezes: true,
        equippedTitle: true,
        equippedFrame: true,
      },
  });
  const title = findTitle(me?.equippedTitle);
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-brand-950 px-4 py-3 shadow-md sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Logo size={36} className="shrink-0" />
            <UserAvatar
              name={session.user.name ?? ""}
              frameId={me?.equippedFrame}
              size={32}
            />
            <div className="min-w-0">
              <p className="truncate text-[11px] tracking-wide text-brand-200 sm:text-xs">
                {title ? (
                  <span className="font-medium text-gold-400">
                    {title.emoji} {t(title.label)}
                  </span>
                ) : (
                  <span className="uppercase">Ardemy Academy</span>
                )}
              </p>
              <p className="truncate text-sm font-medium text-white sm:text-base">
                {session.user.name}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher tone="dark" />
            <SignOutButton />
          </div>
        </div>
        <nav className="-mx-4 mt-3 flex items-center gap-x-4 gap-y-2 overflow-x-auto whitespace-nowrap px-4 text-sm text-brand-100 sm:mx-0 sm:flex-wrap sm:px-0">
          {isStudent && (
            <Link
              href="/student"
              className="hidden shrink-0 transition hover:text-gold-400 sm:block"
            >
              {t("← Öğrenci Paneli")}
            </Link>
          )}
          <Link href="/guest" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("Panel")}
          </Link>
          <Link href="/guest/questions" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("İçerikler")}
          </Link>
          <Link href="/guest/exam" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("Deneme Sınavı")}
          </Link>
          <Link href="/guest/shop" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("Mağaza")}
          </Link>
          <Link href="/guest/credits" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("Kredi Satın Al")}
          </Link>
          <Link href="/guest/history" className="hidden shrink-0 transition hover:text-gold-400 sm:block">
            {t("Geçmişim")}
          </Link>
          <Link
            href="/guest/credits"
            className="shrink-0 rounded-full bg-gold-500/20 px-2.5 py-1 text-xs font-medium text-gold-400 transition hover:bg-gold-500/30"
          >
            {t("{n} kredi", { n: me?.credits ?? 0 })}
          </Link>
          <span
            className={`shrink-0 rounded-full bg-orange-500/20 px-2.5 py-1 text-xs font-medium text-orange-400 ${
              streak > 0 ? "animate-ember" : ""
            }`}
          >
            {t("🔥 {n} gün", { n: streak })}
          </span>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 animate-fade-in sm:px-6 sm:py-8 sm:pb-8">
        <InstallPrompt />
        {children}
      </main>
      <BottomNav
        items={[
          ...(isStudent
            ? [{ href: "/student", label: t("Öğrenci"), icon: "student" as const, exact: true }]
            : []),
          { href: "/guest", label: t("Panel"), icon: "home" as const, exact: true },
          { href: "/guest/questions", label: t("İçerikler"), icon: "book" as const },
          { href: "/guest/exam", label: t("Deneme"), icon: "exam" as const },
          { href: "/guest/shop", label: t("Mağaza"), icon: "shop" as const },
          { href: "/guest/history", label: t("Geçmişim"), icon: "history" as const },
        ]}
      />
    </div>
  );
}
