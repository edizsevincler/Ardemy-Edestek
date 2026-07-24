import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";
import { Logo } from "@/components/Logo";
import { ClassmatesCard } from "./ClassmatesCard";
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

  const unreadCount = await prisma.message.count({
    where: { studentId: session.user.id, senderRole: "ADMIN", read: false },
  });

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
          <nav className="flex gap-4 text-sm text-brand-100">
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
          </nav>
        </div>
        <SignOutButton />
      </header>
      <main className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-[1fr_260px]">
        <div>{children}</div>
        <aside>
          <ClassmatesCard currentUserId={session.user.id} />
        </aside>
      </main>
    </div>
  );
}
