"use client";

import { useActionState } from "react";
import { gradeAnswer } from "./actions";

const initialState = { status: "idle" } as const;

export function FeedbackForm({
  answerId,
  questionId,
  currentFeedback,
}: {
  answerId: string;
  questionId: string;
  currentFeedback: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    gradeAnswer,
    initialState
  );

  return (
    <form action={formAction} className="mt-3 space-y-2">
      <input type="hidden" name="answerId" value={answerId} />
      <input type="hidden" name="questionId" value={questionId} />
      <textarea
        name="feedback"
        rows={2}
        required
        defaultValue={currentFeedback ?? ""}
        placeholder="Geri bildiriminizi yazın..."
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {isPending ? "Kaydediliyor..." : currentFeedback ? "Güncelle" : "Geri Bildirim Gönder"}
      </button>
      {state.status === "success" && (
        <span className="ml-2 text-xs text-emerald-600">Kaydedildi</span>
      )}
      {state.status === "error" && (
        <p className="text-xs text-red-600">{state.message}</p>
      )}
    </form>
  );
}
