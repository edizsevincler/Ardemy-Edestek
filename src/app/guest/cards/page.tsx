import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import { getDailyDeck, getLanguageCounts, getLevelStats, getTopicStats, getUserDeck } from "@/lib/cards";
import {
  CARD_LANGUAGES,
  CARD_LEVELS,
  CARD_TOPICS,
  parseCardLanguage,
  parseCardLevel,
  parseCardTopic,
  type CardLanguage,
  type CardLevel,
  type CardTopic,
} from "@/lib/flashcards";
import { tx } from "@/lib/i18n/translate";
import { SwipeDeck } from "@/components/SwipeDeck";
import { EmptyState } from "@/components/EmptyState";
import { FlagIcon } from "@/components/FlagIcon";

export default async function CardsPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string; level?: string; topic?: string }>;
}) {
  const t = await getT();
  const session = await auth();
  const userId = session!.user.id;
  const sp = await searchParams;

  const [counts, me] = await Promise.all([
    getLanguageCounts(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { dailyLanguage: true } }),
  ]);

  // Dil: adresteki seçim; yoksa kullanıcının tercih ettiği dil; yoksa kartı olan dil.
  const preferred = CARD_LANGUAGES.find((l) => me?.dailyLanguage?.startsWith(l.name))?.code;
  const lang: CardLanguage =
    parseCardLanguage(sp.lang?.toUpperCase()) ??
    preferred ??
    (counts.EN === 0 && counts.RU > 0 ? "RU" : "EN");

  // Seviye: adresteki seçim (o dilde bu seviyede kart varsa); yoksa tüm seviyeler.
  const levelStats = await getLevelStats(userId, lang);
  const requestedLevel = parseCardLevel(sp.level?.toUpperCase());
  const level: CardLevel | null = requestedLevel && levelStats.has(requestedLevel) ? requestedLevel : null;

  // Konu: adresteki seçim (o dilde ve seviyede bu konuda kart varsa); yoksa tüm kelimeler.
  const stats = await getTopicStats(userId, lang, level);
  const requested = parseCardTopic(sp.topic);
  const topic: CardTopic | null = requested && stats.has(requested) ? requested : null;

  // Önce kullanıcının kartları (yöneticinin eklediği kelimeler); yoksa günlük ücretsiz deste.
  let deck = await getUserDeck(userId, lang, topic, level);
  if (deck.total === 0) deck = await getDailyDeck(userId, lang);

  const href = (params: { level?: CardLevel | null; topic?: CardTopic | null }) =>
    `/guest/cards?lang=${lang}${params.level ? `&level=${params.level}` : ""}${params.topic ? `&topic=${params.topic}` : ""}`;
  const levelItems: { id: CardLevel | null; name: string; total: number }[] = [
    { id: null, name: tx("Tüm seviyeler"), total: [...levelStats.values()].reduce((acc, s) => acc + s.total, 0) },
    ...CARD_LEVELS.filter((x) => levelStats.has(x.id)).map((x) => ({
      id: x.id,
      name: x.name,
      total: levelStats.get(x.id)!.total,
    })),
  ];

  const sum = (key: "total" | "mastered") => [...stats.values()].reduce((acc, s) => acc + s[key], 0);
  const topicItems: { id: CardTopic | null; name: string; total: number; mastered: number }[] = [
    { id: null, name: tx("Tüm kelimeler"), total: sum("total"), mastered: sum("mastered") },
    ...CARD_TOPICS.filter((x) => stats.has(x.id)).map((x) => ({
      id: x.id,
      name: x.name,
      total: stats.get(x.id)!.total,
      mastered: stats.get(x.id)!.mastered,
    })),
  ];
  const activeName = topic ? CARD_TOPICS.find((x) => x.id === topic)?.name : null;
  const levelLabel = (item: { id: CardLevel | null; name: string }) => (item.id ? `${item.id} · ${t(item.name)}` : t(item.name));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">
          {t("Kelime Kartları")}
          {level && <span className="text-brand-600"> · {level}</span>}
          {activeName && <span className="text-brand-600"> · {t(activeName)}</span>}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {deck.source === "lessons"
            ? topic || level
              ? t("Bu seçimde {n} kartın var, {m} tanesini öğrendin.", { n: deck.total, m: deck.mastered })
              : t("{n} kartın var, {m} tanesini öğrendin.", { n: deck.total, m: deck.mastered })
            : t("Günün kelimeleri: günde 10 ücretsiz kart. Eğitmenin kelime ekleyince burada kartların görünür.")}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CARD_LANGUAGES.map((l) => {
          const active = l.code === lang;
          return (
            <Link
              key={l.code}
              href={`/guest/cards?lang=${l.code}`}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-600 text-white shadow-sm"
                  : "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
              }`}
            >
              <FlagIcon language={l.name} className="h-3.5 w-5" />
              {t(l.name)}
              {counts[l.code] > 0 && <span className={active ? "text-brand-100" : "text-slate-400"}>({counts[l.code]})</span>}
            </Link>
          );
        })}
      </div>

      {levelItems.length > 2 && (
        <nav aria-label={t("Seviye")} className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {levelItems.map((item) => {
            const active = item.id === level;
            return (
              <Link
                key={item.id ?? "all"}
                href={href({ level: item.id })}
                aria-current={active ? "page" : undefined}
                title={`${levelLabel(item)} (${item.total})`}
                className={`min-w-0 rounded-lg border px-2 py-1.5 text-center transition-colors ${
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-800 ring-1 ring-brand-500"
                    : "border-brand-100 bg-white text-slate-700 hover:bg-brand-50"
                }`}
              >
                <span className="block text-sm font-semibold">{item.id ?? t("Tümü")}</span>
                <span className="block truncate text-[11px] text-slate-500">
                  {item.id ? t(item.name) : item.total}
                </span>
              </Link>
            );
          })}
        </nav>
      )}

      {deck.cards.length > 0 ? (
        <SwipeDeck
          key={`${lang}:${level ?? "all"}:${topic ?? "all"}`}
          cards={deck.cards}
          language={lang}
          canReload={deck.source === "lessons"}
        />
      ) : (
        <EmptyState icon="book" text={t("Kart bulunamadı.")} />
      )}

      {deck.source === "lessons" && topicItems.length > 2 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-lg font-semibold text-brand-950">{t("Konular")}</h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {topicItems.map((item) => {
              const active = item.id === topic;
              const percent = item.total > 0 ? Math.round((item.mastered / item.total) * 100) : 0;
              return (
                <Link
                  key={item.id ?? "all"}
                  href={href({ level, topic: item.id })}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-xl border p-3 transition-shadow duration-200 hover:shadow-md sm:p-4 ${
                    active ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500" : "border-brand-100 bg-white"
                  }`}
                >
                  <p className="font-medium text-brand-950">{t(item.name)}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {t("{n} kart · {m} öğrenildi", { n: item.total, m: item.mastered })}
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
