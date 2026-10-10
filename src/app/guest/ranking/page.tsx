import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import { EmptyState } from "@/components/EmptyState";
import { getRanking, maskName, RANKING_KINDS, type RankingKind, type RankingPeriod } from "@/lib/ranking";
import { setShowInRanking } from "./actions";

const TOP = 20;
const MEDALS = ["🥇", "🥈", "🥉"];

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ k?: string; p?: string }>;
}) {
  const t = await getT();
  const session = await auth();
  const userId = session!.user.id;
  const sp = await searchParams;
  const kind: RankingKind = RANKING_KINDS.includes(sp.k as RankingKind) ? (sp.k as RankingKind) : "cards";
  const period: RankingPeriod = sp.p === "all" ? "all" : "week";
  const usesPeriod = kind === "cards" || kind === "questions";

  const [rows, me] = await Promise.all([
    getRanking(kind, period),
    prisma.user.findUnique({ where: { id: userId }, select: { showInRanking: true } }),
  ]);
  const hidden = me?.showInRanking === false;
  // Kendini gizleyen kullanıcı, önbellekteki listede bile kendini görmesin.
  const list = hidden ? rows.filter((r) => r.userId !== userId) : rows;
  const myIndex = list.findIndex((r) => r.userId === userId);
  const shown = list.slice(0, TOP);
  const extra = myIndex >= TOP ? list[myIndex] : null;

  const kinds: { id: RankingKind; label: string }[] = [
    { id: "cards", label: t("🃏 Kart") },
    { id: "lessons", label: t("🎓 Ders") },
    { id: "streak", label: t("🔥 Seri") },
    { id: "questions", label: t("✏️ Soru") },
  ];
  const titles: Record<RankingKind, string> = {
    cards: t("En çok kart çalışanlar"),
    lessons: t("En çok ders yapanlar"),
    streak: t("En uzun seriye sahip olanlar"),
    questions: t("En çok soru çözenler"),
  };
  const valueLabel = (value: number) =>
    kind === "cards"
      ? t("{n} kart", { n: value })
      : kind === "lessons"
        ? t("{n} ders", { n: value })
        : kind === "streak"
          ? t("{n} gün", { n: value })
          : t("{n} soru", { n: value });

  const href = (k: RankingKind, p: RankingPeriod) => `/guest/ranking?k=${k}&p=${p}`;
  const pill = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
      active ? "bg-brand-600 text-white shadow-sm" : "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
    }`;

  const renderRow = (row: { userId: string; name: string; value: number }, rank: number) => {
    const isMe = row.userId === userId;
    return (
      <li
        key={row.userId}
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
          isMe ? "border-gold-400 bg-gold-50" : "border-brand-100 bg-white"
        }`}
      >
        <span className="w-8 shrink-0 text-center text-lg font-semibold text-brand-950">
          {rank <= 3 ? MEDALS[rank - 1] : rank}
        </span>
        <span className="min-w-0 flex-1 truncate font-medium text-brand-950">
          {maskName(row.name)}
          {isMe && <span className="ml-2 rounded-full bg-gold-400 px-2 py-0.5 text-xs font-semibold text-brand-950">{t("Sen")}</span>}
        </span>
        <span className="shrink-0 text-sm font-semibold text-brand-700">{valueLabel(row.value)}</span>
      </li>
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">{t("🏆 Sıralama")}</h1>
        <p className="mt-1 text-sm text-slate-500">{titles[kind]}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <Link key={k.id} href={href(k.id, period)} className={pill(k.id === kind)}>
            {k.label}
          </Link>
        ))}
      </div>

      {usesPeriod && (
        <div className="flex gap-2">
          <Link href={href(kind, "week")} className={pill(period === "week")}>
            {t("Bu hafta")}
          </Link>
          <Link href={href(kind, "all")} className={pill(period === "all")}>
            {t("Tüm zamanlar")}
          </Link>
        </div>
      )}

      {shown.length === 0 ? (
        <EmptyState icon="history" text={t("Henüz sıralama yok. İlk sen ol!")} />
      ) : (
        <ol className="space-y-2">
          {shown.map((row, i) => renderRow(row, i + 1))}
          {extra && (
            <>
              <li className="text-center text-slate-400" aria-hidden>
                ⋯
              </li>
              {renderRow(extra, myIndex + 1)}
            </>
          )}
        </ol>
      )}

      {kind === "lessons" && <p className="text-xs text-slate-500">{t("Ders sıralaması yalnızca öğrencileri kapsar.")}</p>}

      <form action={setShowInRanking} className="rounded-xl border border-brand-100 bg-white p-4 text-sm text-slate-600">
        <p>
          {hidden
            ? t("Sıralamada görünmüyorsun.")
            : t("Sıralamada adın ve soyadının baş harfi görünür.")}
        </p>
        <input type="hidden" name="show" value={hidden ? "1" : "0"} />
        <button
          type="submit"
          className="mt-2 rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {hidden ? t("Sıralamada görün") : t("Sıralamada görünmek istemiyorum")}
        </button>
      </form>
    </div>
  );
}
