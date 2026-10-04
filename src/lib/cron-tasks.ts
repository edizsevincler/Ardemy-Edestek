import { gzipSync } from "node:zlib";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { dateKey } from "@/lib/streak";
import { isLocale } from "@/lib/i18n/config";
import { claimEmail, releaseEmail } from "@/lib/reminders";
import { sendAdminHtmlEmail, sendFirstTestEmail } from "@/lib/email";

// Zamanlanmış görevler (bkz. app/api/cron/*). Vercel Hobby planı en fazla 2
// cron işine izin verdiği için günlük görevler tek bir uçtan (cron/daily)
// çalışır; haftalık işler yalnızca Pazartesi çalışır.

// ── İlk test daveti ──────────────────────────────────────────────────────
const MIN_AGE_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;

// E-postasını onaylamış, kaydının üzerinden en az 2 gün geçmiş ama hiçbir şey
// çözmemiş misafirlere bir kereye mahsus "ilk testini çöz" daveti gönderir.
export async function runFirstTestInvites() {
  const now = Date.now();
  const candidates = await prisma.user.findMany({
    where: {
      role: "GUEST",
      email: { not: null },
      emailVerified: { not: null },
      emailReminders: true,
      createdAt: { lte: new Date(now - MIN_AGE_MS), gte: new Date(now - MAX_AGE_MS) },
      quizSubmissions: { none: {} },
      dailyAnswers: { none: {} },
      examAttempts: { none: {} },
      unlockedQuestions: { none: {} },
      emailLogs: { none: { kind: "first-test" } },
    },
    select: { id: true, name: true, email: true, credits: true, locale: true },
  });

  let sent = 0;
  for (const user of candidates) {
    if (!user.email) continue;
    if (!(await claimEmail(user.id, "first-test"))) continue;
    try {
      await sendFirstTestEmail(
        user.id,
        user.email,
        user.name,
        user.credits,
        isLocale(user.locale) ? user.locale : "tr"
      );
      sent++;
    } catch {
      await releaseEmail(user.id, "first-test");
    }
  }
  return { checked: candidates.length, sent };
}

// ── Haftalık özet ────────────────────────────────────────────────────────
// Türkiye saati sabittir (UTC+3, yaz saati yok): "YYYY-MM-DD" günlerinin sınırı.
const dayStart = (key: string) => new Date(`${key}T00:00:00+03:00`);
const shiftKey = (offsetDays: number) =>
  dateKey(new Date(Date.now() + offsetDays * 86_400_000));

type PeriodStats = {
  views: number;
  signups: number;
  tests: number;
  dailies: number;
  exams: number;
  purchases: number;
  revenue: number;
  activeUsers: number;
  bySource: Map<string, number>;
  signupsBySource: Map<string, number>;
  topPages: Map<string, number>;
};

async function collect(startKey: string, endKeyExclusive: string): Promise<PeriodStats> {
  const from = dayStart(startKey);
  const to = dayStart(endKeyExclusive);
  const range = { gte: from, lt: to };

  const [views, signups, tests, dailies, exams, purchases, quizUsers, dailyUsers, examUsers, unlockUsers] =
    await Promise.all([
      prisma.pageViewDaily.findMany({
        where: { day: { gte: startKey, lt: endKeyExclusive } },
        select: { path: true, source: true, count: true },
      }),
      prisma.user.findMany({
        where: { role: "GUEST", createdAt: range, NOT: { email: { endsWith: "@example.invalid" } } },
        select: { signupSource: true },
      }),
      prisma.quizSubmission.count({ where: { submittedAt: range } }),
      prisma.dailyQuestionAnswer.count({ where: { answeredAt: range } }),
      prisma.examAttempt.count({ where: { submittedAt: range } }),
      prisma.creditPurchase.aggregate({
        where: { status: "PAID", createdAt: range },
        _count: { _all: true },
        _sum: { amount: true },
      }),
      prisma.quizSubmission.findMany({ where: { submittedAt: range }, select: { userId: true }, distinct: ["userId"] }),
      prisma.dailyQuestionAnswer.findMany({ where: { answeredAt: range }, select: { userId: true }, distinct: ["userId"] }),
      prisma.examAttempt.findMany({ where: { submittedAt: range }, select: { userId: true }, distinct: ["userId"] }),
      prisma.questionUnlock.findMany({ where: { unlockedAt: range }, select: { userId: true }, distinct: ["userId"] }),
    ]);

  const bySource = new Map<string, number>();
  const topPages = new Map<string, number>();
  let viewTotal = 0;
  for (const v of views) {
    viewTotal += v.count;
    const source = v.source || "doğrudan";
    bySource.set(source, (bySource.get(source) ?? 0) + v.count);
    topPages.set(v.path, (topPages.get(v.path) ?? 0) + v.count);
  }
  const signupsBySource = new Map<string, number>();
  for (const s of signups) {
    const source = s.signupSource || "doğrudan / bilinmiyor";
    signupsBySource.set(source, (signupsBySource.get(source) ?? 0) + 1);
  }
  const active = new Set([
    ...quizUsers.map((u) => u.userId),
    ...dailyUsers.map((u) => u.userId),
    ...examUsers.map((u) => u.userId),
    ...unlockUsers.map((u) => u.userId),
  ]);

  return {
    views: viewTotal,
    signups: signups.length,
    tests,
    dailies,
    exams,
    purchases: purchases._count._all,
    revenue: Number(purchases._sum.amount ?? 0),
    activeUsers: active.size,
    bySource,
    signupsBySource,
    topPages,
  };
}

const arrow = (now: number, before: number) =>
  now > before ? `▲ +${now - before}` : now < before ? `▼ ${now - before}` : "–";

const top = (map: Map<string, number>, limit = 5) =>
  [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);

function listHtml(items: [string, number][], empty: string) {
  if (items.length === 0) return `<li style="color:#888">${empty}</li>`;
  return items.map(([name, count]) => `<li>${name}: <strong>${count}</strong></li>`).join("");
}

// Geçen haftanın (Pazartesi-Pazar) özetini yöneticiye e-posta ile gönderir.
export async function sendWeeklySummary() {
  // Pazartesi çalışır: geçen hafta = 7 gün önce .. dün; önceki hafta = 14..8 gün önce.
  const startKey = shiftKey(-7);
  const endKey = shiftKey(0); // bugün (dahil değil)
  const prevStartKey = shiftKey(-14);

  const [week, prev, totalUsers, unverified] = await Promise.all([
    collect(startKey, endKey),
    collect(prevStartKey, startKey),
    prisma.user.count({ where: { role: { in: ["GUEST", "STUDENT"] } } }),
    prisma.user.count({ where: { role: "GUEST", emailVerified: null } }),
  ]);

  const lastDay = shiftKey(-1);
  const rows: [string, number, number][] = [
    ["Sayfa görüntüleme (kayıtsız ziyaret)", week.views, prev.views],
    ["Yeni kayıt", week.signups, prev.signups],
    ["Aktif kullanıcı (bir şey çözen)", week.activeUsers, prev.activeUsers],
    ["Çözülen test", week.tests, prev.tests],
    ["Günün sorusu cevabı", week.dailies, prev.dailies],
    ["Deneme sınavı", week.exams, prev.exams],
    ["Onaylanan kredi satışı", week.purchases, prev.purchases],
  ];

  const table = rows
    .map(
      ([label, now, before]) =>
        `<tr><td style="padding:4px 12px 4px 0">${label}</td><td style="padding:4px 12px;font-weight:bold">${now}</td><td style="padding:4px 0;color:#666">${arrow(now, before)} (önceki hafta: ${before})</td></tr>`
    )
    .join("");

  const revenue = week.revenue.toLocaleString("tr-TR", { style: "currency", currency: "TRY" });

  await sendAdminHtmlEmail(
    `📊 Ardemy haftalık özet (${startKey} – ${lastDay})`,
    `
      <p>Merhaba Ediz, geçen haftanın özeti:</p>
      <table style="border-collapse:collapse;font-size:14px">${table}</table>
      <p>Kredi satışı geliri: <strong>${revenue}</strong></p>
      <p><strong>Ziyaretçiler hangi kaynaktan geldi?</strong></p>
      <ul>${listHtml(top(week.bySource), "Kayıtlı ziyaret yok.")}</ul>
      <p><strong>En çok açılan sayfalar</strong></p>
      <ul>${listHtml(top(week.topPages), "Kayıtlı ziyaret yok.")}</ul>
      <p><strong>Yeni kayıtlar hangi kaynaktan?</strong></p>
      <ul>${listHtml(top(week.signupsBySource), "Bu hafta yeni kayıt yok.")}</ul>
      <p style="color:#666">Toplam öğrenci + misafir: ${totalUsers}${unverified ? ` · e-postasını onaylamayan misafir: ${unverified} (Admin > Misafirler'den onay e-postasını yeniden gönderebilirsin)` : ""}</p>
    `
  );
}

// ── Haftalık yedek ───────────────────────────────────────────────────────
// Geçici/hassas tablolar yedeğe girmez; şifre özetleri de dosyadan çıkarılır
// (geri yüklemede kullanıcılar şifrelerini sıfırlar). Dosya yedeği için
// scripts/backup-db.ts --files kullanılır.
const BACKUP_SKIP = new Set([
  "LoginThrottle",
  "PasswordResetToken",
  "VerificationToken",
  "EmailLog",
]);

export async function sendWeeklyBackup() {
  const tables: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};

  for (const model of Object.values(Prisma.ModelName)) {
    if (BACKUP_SKIP.has(model)) continue;
    const key = model.charAt(0).toLowerCase() + model.slice(1);
    const delegate = (prisma as unknown as Record<string, { findMany: () => Promise<Record<string, unknown>[]> }>)[key];
    let rows = await delegate.findMany();
    if (model === "User") {
      rows = rows.map((row) => {
        const copy = { ...row };
        delete copy.passwordHash;
        return copy;
      });
    }
    tables[model] = rows;
    counts[model] = rows.length;
  }

  const stamp = dateKey(new Date());
  const json = JSON.stringify({ createdAt: new Date().toISOString(), counts, tables });
  const gz = gzipSync(Buffer.from(json, "utf8"));
  const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);
  const tooBig = gz.length > 3 * 1024 * 1024;

  await sendAdminHtmlEmail(
    `🗄️ Ardemy haftalık yedek — ${stamp}`,
    `
      <p>Haftalık veritabanı yedeği ${tooBig ? "<strong>çok büyük olduğu için eklenemedi</strong>" : "ekte (sıkıştırılmış JSON)"}.</p>
      <p>${Object.keys(counts).length} tablo, ${totalRows} satır, dosya boyutu ${(gz.length / 1024).toFixed(0)} KB.</p>
      <ul>
        <li>Dosya, kişisel veri (e-posta, mesajlar) içerir; güvenli bir yerde saklayın, kimseyle paylaşmayın.</li>
        <li>Şifre özetleri yedeğe konmaz; geri yüklemede kullanıcılar "Şifremi unuttum" ile yeni şifre belirler.</li>
        <li>Ders dosyaları ve PDF'ler bu yedekte yoktur (Vercel Blob'da durur); gerekirse dosyalı yedek ayrıca alınır.</li>
        <li>Geri yükleme gerekirse bu dosyayı Claude'a verin.</li>
      </ul>
    `,
    tooBig ? undefined : [{ name: `ardemy-yedek-${stamp}.json.gz`, content: gz.toString("base64") }]
  );

  return { tables: Object.keys(counts).length, rows: totalRows, bytes: gz.length, attached: !tooBig };
}
