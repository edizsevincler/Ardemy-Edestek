"use client";

import { useState, useTransition } from "react";
import { answerDailyQuestion } from "@/lib/daily-question-actions";
import { NewBadgesBanner } from "@/components/NewBadgesBanner";
import { Celebration } from "@/components/Celebration";
import { useT } from "@/lib/i18n/client";
import { subjectLabel } from "@/lib/i18n/subject";
import type { DailyItem, DailyOption, DailyResult } from "@/lib/daily-question";

const OPTIONS: DailyOption[] = ["A", "B", "C", "D"];

export function DailyQuestionCard({
  item,
  initialResult,
  shareUrl,
}: {
  shareUrl: string;
  item: DailyItem;
  initialResult: DailyResult | null;
}) {
  const t = useT();
  const [selected, setSelected] = useState<DailyOption | null>(
    initialResult?.selected ?? null
  );
  const [result, setResult] = useState<DailyResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);
  const [newBadges, setNewBadges] = useState<{ id: string; emoji: string; title: string }[]>([]);
  const [notes, setNotes] = useState<string[]>([]);
  // Sayfa yüklenirken değil, cevap şimdi verildiğinde animasyon oynasın.
  const [justAnswered, setJustAnswered] = useState(false);
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const res = await answerDailyQuestion(selected);
      if (res.status === "error") {
        setError(res.message);
        return;
      }
      setResult({
        selected,
        correct: res.correct,
        correctOption: res.correctOption,
      });
      setNewBadges(res.newBadges);
      setNotes(res.streakNotes);
      setJustAnswered(true);
    });
  }

  return (
    <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-5 shadow-sm">
      {justAnswered && result?.correct && newBadges.length === 0 && <Celebration count={24} />}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-brand-950">{t("📅 Günün Sorusu")}</h2>
        <span className="text-xs text-slate-500">{subjectLabel(item.subject, t)}</span>
      </div>
      <p className="mt-3 font-medium text-brand-950">{item.prompt}</p>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((opt) => {
          const label = item[`option${opt}` as const];
          let style = "border-slate-200 bg-white hover:border-brand-300";
          if (result) {
            if (opt === result.correctOption) {
              style = `border-green-400 bg-green-50 ${justAnswered ? "animate-pop" : ""}`;
            } else if (opt === result.selected) {
              style = `border-red-400 bg-red-50 ${justAnswered ? "animate-shake" : ""}`;
            } else {
              style = "border-slate-200 bg-white opacity-70";
            }
          } else if (selected === opt) {
            style = "border-brand-500 bg-brand-50";
          }
          return (
            <label
              key={opt}
              className={`flex min-h-12 items-center gap-3 rounded-lg border p-3 text-sm transition-colors sm:min-h-0 sm:gap-2 sm:p-2 ${style} ${
                result ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                className="h-5 w-5 shrink-0 accent-brand-600 sm:h-4 sm:w-4"
                name="daily-question"
                disabled={!!result || isPending}
                checked={selected === opt}
                onChange={() => setSelected(opt)}
              />
              <span>
                {opt}) {label}
              </span>
            </label>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {(newBadges.length > 0 || notes.length > 0) && (
        <div className="mt-3">
          <NewBadgesBanner badges={newBadges} notes={notes} shareUrl={shareUrl} />
        </div>
      )}

      {result ? (
        <p className="mt-3 text-sm font-medium text-brand-950">
          {result.correct
            ? t("🎉 Doğru! Serin devam ediyor, yarın yeni soru seni bekliyor.")
            : t("Bu sefer olmadı — doğru cevap {opt}. Serin devam ediyor, yarın yeniden dene!", { opt: result.correctOption })}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!selected || isPending}
            onClick={submit}
            className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {isPending ? t("Gönderiliyor...") : t("Cevapla")}
          </button>
          <span className="text-xs text-slate-500">
            {t("Ücretsiz — cevaplayınca serin de devam eder 🔥")}
          </span>
        </div>
      )}
    </div>
  );
}
