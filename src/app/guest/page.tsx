import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function GuestHomePage() {
  const session = await auth();
  const [me, unlockedCount, questionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { credits: true },
    }),
    prisma.questionUnlock.count({ where: { userId: session!.user.id } }),
    prisma.question.count({ where: { isPublished: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">Hoş geldiniz</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Kredi bakiyeniz</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {me?.credits ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Açtığınız sorular</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {unlockedCount}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Yayında soru</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {questionCount}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <Link
          href="/guest/questions"
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
        >
          Soru Bankasına Git
        </Link>
        <Link
          href="/guest/credits"
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95"
        >
          Kredi Satın Al
        </Link>
      </div>
    </div>
  );
}
