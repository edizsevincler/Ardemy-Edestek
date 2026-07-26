"use client";

import { useState, useTransition } from "react";
import { submitQuiz } from "./actions";

type OptionLetter = "A" | "B" | "C" | "D";

type Item = {
  id: string;
  order: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

type GradedAnswer = { itemId: string; selected: OptionLetter; correct: boolean };

const OPTIONS: OptionLetter[] = ["A", "B", "C", "D"];

export function QuizForm({
  questionId,
  items,
  existingSubmission,
}: {
  questionId: string;
  items: Item[];
  existingSubmission: { score: number; total: number; answers: GradedAnswer[] } | null;
}) {
  const [answers, setAnswers] = useState<Record<string, OptionLetter>>(() => {
    const initial: Record<string, OptionLetter> = {};
    for (const a of existingSubmission?.answers ?? []) {
      initial[a.itemId] = a.selected;
    }
    return initial;
  });
  const [result, setResult] = useState(existingSubmission);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      const res = await submitQuiz(questionId, answers);
      if (res.status === "error") {
        setError(res.message);
        return;
      }
      setResult(res);
    });
  }

  return (
    <div className="space-y-4">
      {result && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
          <p className="text-lg font-semibold text-brand-950">
            {result.score} doğru, {result.total - result.score} yanlış
          </p>
          <p className="text-sm text-slate-500">
            {result.total} sorudan {result.score} tanesini doğru yaptınız.
          </p>
        </div>
      )}

      {items.map((item, idx) => {
        const graded = result?.answers.find((a) => a.itemId === item.id);
        return (
          <div
            key={item.id}
            className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <p className="font-medium text-brand-950">
              {idx + 1}. {item.prompt}
            </p>
            <div className="mt-3 space-y-2">
              {OPTIONS.map((opt) => {
                const label = item[`option${opt}` as const];
                const isSelected = answers[item.id] === opt;
                let optionClass = "border-slate-200 hover:border-brand-300";
                if (graded) {
                  if (opt === graded.selected && graded.correct) {
                    optionClass = "border-green-400 bg-green-50";
                  } else if (opt === graded.selected && !graded.correct) {
                    optionClass = "border-red-400 bg-red-50";
                  }
                }
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${optionClass}`}
                  >
                    <input
                      type="radio"
                      name={item.id}
                      checked={isSelected}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [item.id]: opt }))
                      }
                    />
                    <span>
                      {opt}) {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        disabled={isPending || answeredCount < items.length}
        onClick={handleSubmit}
        className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {isPending ? "Gönderiliyor..." : result ? "Tekrar Gönder" : "Testi Bitir"}
      </button>

      {result && (
        <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-center">
          <p className="text-lg font-semibold text-brand-950">
            {result.score} doğru, {result.total - result.score} yanlış
          </p>
          <p className="text-sm text-slate-500">
            {result.total} sorudan {result.score} tanesini doğru yaptınız.
          </p>
        </div>
      )}
    </div>
  );
}
