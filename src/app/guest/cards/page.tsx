import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getT } from "@/lib/i18n/server";
import { getDailyDeck, getLanguageCounts, getUserDeck } from "@/lib/cards";
import { CARD_LANGUAGES, parseCardLanguage, type CardLanguage } from "@/lib/flashcards";
import { SwipeDeck } from "@/components/SwipeDeck";
import { EmptyState } from "@/components/EmptyState";
import { FlagIcon } from "@/components/FlagIcon";

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
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

  // Önce kullanıcının kartları (yöneticinin eklediği kelimeler); yoksa günlük ücretsiz deste.
  let deck = await getUserDeck(userId, lang);
  if (deck.total === 0) deck = await getDailyDeck(userId, lang);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">{t("Kelime Kartları")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {deck.source === "lessons"
            ? t("{n} kartın var, {m} tanesini öğrendin.", { n: deck.total, m: deck.mastered })
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

      {deck.cards.length > 0 ? (
        <SwipeDeck key={lang} cards={deck.cards} language={lang} canReload={deck.source === "lessons"} />
      ) : (
        <EmptyState icon="book" text={t("Kart bulunamadı.")} />
      )}
    </div>
  );
}
