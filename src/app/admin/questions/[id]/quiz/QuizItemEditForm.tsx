"use client";

import { useActionState } from "react";
import { updateQuizItem } from "./actions";

const initialState = { status: "idle" } as const;

type Item = {
  id: string;
  order: number;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: string;
};

const OPTIONS = ["A", "B", "C", "D"] as const;

export function QuizItemEditForm({
  item,
  questionId,
}: {
  item: Item;
  questionId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    updateQuizItem,
    initialState
  );

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
    >
      <input type="hidden" name="id" value={item.id} />
      <input type="hidden" name="questionId" value={questionId} />

      <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
        Soru {item.order}
      </p>

      <textarea
        name="prompt"
        defaultValue={item.prompt}
        rows={2}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <label key={opt} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct"
              value={opt}
              defaultChecked={item.correct === opt}
            />
            <span className="text-sm font-medium text-slate-500">{opt})</span>
            <input
              name={`option${opt}`}
              defaultValue={item[`option${opt}` as keyof Item] as string}
              className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {state.status === "success" && (
          <span className="text-xs text-emerald-600">Kaydedildi</span>
        )}
        {state.status === "error" && (
          <span className="text-xs text-red-600">{state.message}</span>
        )}
      </div>
    </form>
  );
}
