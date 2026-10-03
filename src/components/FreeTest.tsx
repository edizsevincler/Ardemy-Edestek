"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { gradeFreeTest, type FreeTestResult } from "@/lib/free-test-actions";
import type { FreeTestQuestion } from "@/lib/free-test";

type Letter = "A" | "B" | "C" | "D";
const OPTIONS: Letter[] = ["A", "B", "C", "D"];

export function FreeTest({
  token,
  questions,
  otherLanguage,
}: {
  token: string;
  questions: FreeTestQuestion[];
  otherLanguage: { slug: string; name: string };
}) {
  const [answers, setAnswers] = useState<Record<string, Letter>>({});
  const [result, setResult] = useState<FreeTestResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const done = result?.status === "success" ? result : null;
  const answered = Object.keys(answers).length;

  function submit() {
    startTransition(async () => {
      setResult(await gradeFreeTest(token, answers));
    });
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        {questions.map((q, index) => (
          <li
            key={q.id}
            className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-slate-400">{index + 1}. soru</p>
            <p className="mt-1 font-medium text-brand-950">{q.prompt}</p>
            <div className="mt-2 space-y-1.5">
              {OPTIONS.map((opt) => {
                const checked = answers[q.id] === opt;
                let style = checked
                  ? "border-brand-500 bg-brand-50"
                  : "border-slate-200 bg-white hover:border-brand-300";
                if (done) {
                  if (opt === done.correct[q.id]) {
                    style = "border-green-400 bg-green-50";
                  } else if (checked) {
                    style = "border-red-400 bg-red-50";
                  } else {
                    style = "border-slate-200 bg-white opacity-70";
                  }
                }
                return (
                  <label
                    key={opt}
                    className={`flex items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${style} ${
                      done ? "cursor-default" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`free-${q.id}`}
                      checked={checked}
                      disabled={!!done || isPending}
                      onChange={() =>
                        setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                      }
                    />
                    <span>
                      {opt}) {q[`option${opt}` as const]}
                    </span>
                  </label>
                );
              })}
            </div>
          </li>
        ))}
      </ol>

      {result?.status === "error" && (
        <p className="text-sm text-red-600">{result.message}</p>
      )}

      {done ? (
        <div className="space-y-3 rounded-xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-5 text-center shadow-sm">
          <p className="text-2xl font-semibold text-brand-950">
            {done.score} / {done.total}{" "}
            {done.score >= done.total - 1 ? "🎉" : done.score >= 3 ? "👏" : "💪"}
          </p>
          <p className="text-sm text-slate-600">
            Daha fazlası seni bekliyor: binlerce test sorusu, günlük seri,
            rozetler ve deneme sınavları.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register"
              className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 sm:w-auto"
            >
              Ücretsiz Kayıt Ol — 2 kredi hediye
            </Link>
            <Link
              href={`/dene/${otherLanguage.slug}`}
              className="w-full rounded-lg border border-brand-200 bg-white px-6 py-3 text-sm font-medium text-brand-700 hover:bg-brand-50 sm:w-auto"
            >
              {otherLanguage.name} testini dene
            </Link>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={isPending || answered < questions.length}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending
            ? "Kontrol ediliyor..."
            : answered < questions.length
              ? `Sonucu gör (${answered}/${questions.length})`
              : "Sonucu gör"}
        </button>
      )}
    </div>
  );
}
