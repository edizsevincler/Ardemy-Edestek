import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHomePage() {
  const [
    studentCount,
    guestCount,
    revenue,
    topQuestions,
    recentGuests,
    recentSubmissions,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "GUEST" } }),
    prisma.creditPurchase.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.question.findMany({
      orderBy: { unlocks: { _count: "desc" } },
      take: 5,
      include: { _count: { select: { unlocks: true } } },
    }),
    prisma.user.findMany({
      where: { role: "GUEST" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.assignmentSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: 5,
      include: {
        student: { select: { name: true } },
        assignment: { select: { title: true } },
      },
    }),
  ]);

  const sections = [
    {
      title: "Öğrenciler",
      description: "Öğrenci hesabı oluştur, kayıtları yönet.",
      href: "/admin/students",
    },
    {
      title: "Misafirler",
      description: "Soru çözmeye gelen dış kullanıcıları yönet.",
      href: "/admin/guests",
    },
    {
      title: "Ödevler",
      description: "Öğrencilere ödev ata, teslimleri takip et.",
      href: "/admin/assignments",
    },
    {
      title: "Ders Dosyaları",
      description: "Öğrencilere özel ders dosyası paylaş.",
      href: "/admin/lesson-files",
    },
    {
      title: "Mesajlar",
      description: "Öğrencilerle birebir yazışın.",
      href: "/admin/messages",
    },
    {
      title: "Soru Bankası",
      description: "İngilizce/Rusça soru ekle, kredi bedeli belirle, yayınla.",
      href: "/admin/questions",
    },
    {
      title: "Kredi Paketleri",
      description: "Misafirlerin satın alabileceği kredi paketlerini yönet.",
      href: "/admin/credit-packages",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-brand-950">Hoş geldiniz</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Öğrenci sayısı</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {studentCount}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Misafir sayısı</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {guestCount}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Toplam kredi satışı</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {Number(revenue._sum.amount ?? 0).toLocaleString("tr-TR", {
              style: "currency",
              currency: "TRY",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <h2 className="font-medium text-brand-950">En çok açılan sorular</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {topQuestions.length === 0 && (
              <li className="text-slate-400">Henüz soru açılmadı.</li>
            )}
            {topQuestions.map((q) => (
              <li key={q.id} className="flex min-w-0 justify-between text-slate-700">
                <span className="min-w-0 truncate pr-2">{q.title}</span>
                <span className="shrink-0 text-slate-400">
                  {q._count.unlocks} açılma
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <h2 className="font-medium text-brand-950">Son kayıt olan misafirler</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {recentGuests.length === 0 && (
              <li className="text-slate-400">Henüz misafir yok.</li>
            )}
            {recentGuests.map((g) => (
              <li key={g.id} className="flex min-w-0 justify-between text-slate-700">
                <span className="min-w-0 truncate pr-2">{g.name}</span>
                <span className="shrink-0 text-slate-400">
                  {g.createdAt.toLocaleDateString("tr-TR")}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <h2 className="font-medium text-brand-950">Son ödev teslimleri</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {recentSubmissions.length === 0 && (
              <li className="text-slate-400">Henüz teslim yok.</li>
            )}
            {recentSubmissions.map((s) => (
              <li key={s.id} className="text-slate-700">
                <p className="truncate">{s.student.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {s.assignment.title} —{" "}
                  {s.submittedAt.toLocaleDateString("tr-TR")}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.title} href={s.href}>
            <div className="h-full rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm transition hover:border-brand-300">
              <h2 className="font-medium text-brand-950">{s.title}</h2>
              <p className="mt-1 text-sm text-slate-500">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
