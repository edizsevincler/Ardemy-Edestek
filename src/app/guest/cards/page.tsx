import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { getDailyDeck, getUserDeck } from "@/lib/cards";
import { SwipeDeck } from "@/components/SwipeDeck";
import { EmptyState } from "@/components/EmptyState";

export default async function CardsPage() {
  const t = await getT();
  const session = await auth();
  const userId = session!.user.id;

  // Önce kullanıcının kendi ders kartları; yoksa günlük ücretsiz kelime destesi.
  let deck = await getUserDeck(userId);
  if (deck.total === 0) deck = await getDailyDeck(userId);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">{t("🃏 Kelime Kartları")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {deck.source === "lessons"
            ? t("Ders notlarından {n} kartın var, {m} tanesini öğrendin.", { n: deck.total, m: deck.mastered })
            : t("Günün kelimeleri: günde 10 ücretsiz kart. Derslerinden kart çıkınca burada kendi kartların görünür.")}
        </p>
      </div>
      {deck.cards.length > 0 ? (
        <SwipeDeck cards={deck.cards} canReload={deck.source === "lessons"} />
      ) : (
        <EmptyState icon="book" text={t("Kart bulunamadı.")} />
      )}
    </div>
  );
}
