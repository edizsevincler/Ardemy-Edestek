"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitAnswer } from "./actions";

const initialState = { status: "idle" } as const;

type Answer = {
  body: string | null;
  fileUrl: string | null;
  fileName: string | null;
  id: string;
  submittedAt: Date;
  feedback: string | null;
  gradedAt: Date | null;
} | null;

export function AnswerForm({
  questionId,
  answer,
}: {
  questionId: string;
  answer: Answer;
}) {
  const [state, formAction, isPending] = useActionState(
    submitAnswer,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="space-y-4">
      {answer && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <p className="text-sm font-medium text-brand-950">
            Gönderdiğiniz cevap ({answer.submittedAt.toLocaleString("tr-TR")})
          </p>
          {answer.body && (
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {answer.body}
            </p>
          )}
          {answer.fileUrl && (
            <a
              href={`/api/question-answers/${answer.id}/file`}
              className="mt-2 inline-block text-sm text-brand-600 underline"
            >
              {answer.fileName}
            </a>
          )}

          {answer.gradedAt ? (
            <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
                Eğitmen geri bildirimi
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">
                {answer.feedback}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500">
              Değerlendirme bekleniyor...
            </p>
          )}
        </div>
      )}

      <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-medium text-brand-950">
          {answer ? "Yeni cevap gönder" : "Cevabınızı gönderin"}
        </h2>
        <form ref={formRef} action={formAction} className="mt-3 space-y-3">
          <input type="hidden" name="questionId" value={questionId} />
          <textarea
            name="body"
            rows={4}
            placeholder="Cevabınızı buraya yazın..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
          <input name="file" type="file" className="w-full text-sm" />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
          >
            {isPending ? "Gönderiliyor..." : "Cevabı Gönder"}
          </button>
          {state.status === "error" && (
            <p className="text-sm text-red-600">{state.message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
