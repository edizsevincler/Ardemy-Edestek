"use client";

import { useState, useTransition } from "react";
import { answerDailyQuestion } from "@/lib/daily-question-actions";
import type { DailyItem, DailyOption, DailyResult } from "@/lib/daily-question";

const OPTIONS: DailyOption[] = ["A", "B", "C", "D"];

export function DailyQuestionCard({
  item,
  initialResult,
}: {
  item: DailyItem;
  initialResult: DailyResult | null;
}) {
  const [selected, setSelected] = useState<DailyOption | null>(
    initialResult?.selected ?? null
  );
  const [result, setResult] = useState<DailyResult | null>(initialResult);
  const [error, setError] = useState<string | null>(null);
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
    });
  }

  return (
    <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-brand-950">📅 Günün Sorusu</h2>
        <span className="text-xs text-slate-500">{item.subject}</span>
      </div>
      <p className="mt-3 font-medium text-brand-950">{item.prompt}</p>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((opt) => {
          const label = item[`option${opt}` as const];
          let style = "border-slate-200 bg-white hover:border-brand-300";
          if (result) {
            if (opt === result.correctOption) {
              style = "border-green-400 bg-green-50";
            } else if (opt === result.selected) {
              style = "border-red-400 bg-red-50";
            } else {
              style = "border-slate-200 bg-white opacity-70";
            }
          } else if (selected === opt) {
            style = "border-brand-500 bg-brand-50";
          }
          return (
            <label
              key={opt}
              className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${style} ${
                result ? "cursor-default" : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
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

      {result ? (
        <p className="mt-3 text-sm font-medium text-brand-950">
          {result.correct
            ? "🎉 Doğru! Serin devam ediyor, yarın yeni soru seni bekliyor."
            : `Bu sefer olmadı — doğru cevap ${result.correctOption}. Serin devam ediyor, yarın yeniden dene!`}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={!selected || isPending}
            onClick={submit}
            className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
          >
            {isPending ? "Gönderiliyor..." : "Cevapla"}
          </button>
          <span className="text-xs text-slate-500">
            Ücretsiz — cevaplayınca serin de devam eder 🔥
          </span>
        </div>
      )}
    </div>
  );
}
