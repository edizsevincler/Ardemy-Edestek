"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { submitExam } from "@/lib/exam-actions";
import { ExamResultView } from "@/components/ExamResultView";
import { NewBadgesBanner } from "@/components/NewBadgesBanner";
import type {
  ExamLetter,
  ExamResultData,
  ExamRunnerQuestion,
} from "@/lib/exam-config";

const OPTIONS = ["A", "B", "C", "D"] as const;

function formatTime(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function ExamRunner({
  attemptId,
  language,
  questions,
  remainingMs,
}: {
  attemptId: string;
  language: string;
  questions: ExamRunnerQuestion[];
  remainingMs: number;
}) {
  const storageKey = `exam-answers-${attemptId}`;
  const [answers, setAnswers] = useState<Record<string, ExamLetter>>({});
  const [loaded, setLoaded] = useState(false);
  // Bitiş anı sayfa açıldığında sunucunun hesapladığı kalan süreden türetilir
  // (istemci saatinin sapması sınav süresini etkilemesin).
  const [deadline] = useState(() => new Date().getTime() + remainingMs);
  const [left, setLeft] = useState(remainingMs);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{
    result: ExamResultData;
    newBadges: { emoji: string; title: string }[];
    notes: string[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const submittedRef = useRef(false);

  // Sayfa yenilenirse işaretlenen cevaplar kaybolmasın. localStorage sunucuda
  // yok; hidrasyon uyuşmazlığı olmasın diye yalnızca mount sonrası okunur.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setAnswers(JSON.parse(saved));
    } catch {
      // localStorage kullanılamıyorsa cevaplar yalnızca bellekte tutulur.
    }
    setLoaded(true);
  }, [storageKey]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      // yok sayılır
    }
  }, [answers, loaded, storageKey]);

  function submit() {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setError(null);
    startTransition(async () => {
      const res = await submitExam(attemptId, answers);
      if (res.status === "error") {
        submittedRef.current = false;
        setError(res.message);
        return;
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // yok sayılır
      }
      setDone({
        result: res.result,
        newBadges: res.newBadges,
        notes: res.streakNotes,
      });
    });
  }

  useEffect(() => {
    if (done || !loaded) return;
    const tick = () => {
      const remaining = deadline - new Date().getTime();
      setLeft(remaining);
      if (remaining <= 0) submit();
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
    // submit her render'da yenilenir; zamanlayıcı yalnızca bitiş/yüklenme
    // değişince yeniden kurulmalı.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deadline, done, loaded]);

  if (done) {
    return (
      <div className="space-y-4">
        <NewBadgesBanner badges={done.newBadges} notes={done.notes} />
        <ExamResultView result={done.result} />
      </div>
    );
  }

  const answered = Object.keys(answers).length;
  const urgent = left < 60_000;

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between gap-3 border-b border-brand-100 bg-white/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-xl sm:border">
        <span className="text-sm text-slate-600">
          {answered}/{questions.length} cevaplandı
        </span>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
            urgent ? "bg-red-100 text-red-700" : "bg-brand-50 text-brand-700"
          }`}
        >
          ⏱ {formatTime(left)}
        </span>
      </div>

      <p className="text-sm text-slate-500">
        {language} Deneme Sınavı — süre dolunca cevapların otomatik gönderilir.
      </p>

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
                return (
                  <label
                    key={opt}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-2 text-sm transition-colors ${
                      checked
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 bg-white hover:border-brand-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      checked={checked}
                      disabled={isPending}
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => {
            if (
              answered < questions.length &&
              !window.confirm(
                `${questions.length - answered} soru boş. Yine de bitirmek istiyor musun?`
              )
            ) {
              return;
            }
            submit();
          }}
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
        >
          {isPending ? "Gönderiliyor..." : "Sınavı Bitir"}
        </button>
      </div>
    </div>
  );
}
