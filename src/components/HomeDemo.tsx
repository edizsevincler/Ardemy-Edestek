"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { gradeFreeTest } from "@/lib/free-test-actions";
import type { FreeTestQuestion } from "@/lib/free-test";
import { FlagIcon } from "@/components/FlagIcon";
import { Celebration } from "@/components/Celebration";
import { useT } from "@/lib/i18n/client";

type Letter = "A" | "B" | "C" | "D";
const OPTIONS: Letter[] = ["A", "B", "C", "D"];

export type DemoSet = {
  language: "Rusça" | "İngilizce";
  question: FreeTestQuestion;
  token: string;
};

type Outcome = { selected: Letter; correct: Letter };

// Ana sayfadaki canlı örnek: ziyaretçi kayıt olmadan tek bir soru çözüp
// doğru/yanlış tepkisini görür (değerlendirme gradeFreeTest ile sunucuda).
export function HomeDemo({ sets }: { sets: DemoSet[] }) {
  const t = useT();
  const [active, setActive] = useState(0);
  const [outcomes, setOutcomes] = useState<Record<number, Outcome>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sets.length === 0) return null;
  const current = sets[active];
  const outcome = outcomes[active];

  function choose(opt: Letter) {
    if (outcome || isPending) return;
    setError(null);
    startTransition(async () => {
      const res = await gradeFreeTest(current.token, { [current.question.id]: opt });
      if (res.status === "error") {
        setError(res.message);
        return;
      }
      setOutcomes((prev) => ({
        ...prev,
        [active]: { selected: opt, correct: res.correct[current.question.id] },
      }));
    });
  }

  const right = outcome && outcome.selected === outcome.correct;

  return (
    <div className="rounded-2xl border border-white/20 bg-white p-5 text-left shadow-xl shadow-brand-950/30">
      {right && <Celebration count={26} />}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brand-950">{t("✨ Hemen dene")}</p>
        <div className="flex gap-1.5">
          {sets.map((s, i) => (
            <button
              key={s.language}
              type="button"
              onClick={() => {
                setActive(i);
                setError(null);
              }}
              aria-pressed={i === active}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                i === active
                  ? "border-brand-500 bg-brand-50 text-brand-800"
                  : "border-slate-200 text-slate-500 hover:border-brand-300"
              }`}
            >
              <FlagIcon language={s.language} className="h-3 w-4" />
              {t(s.language)}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 font-medium text-brand-950">{current.question.prompt}</p>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((opt) => {
          let style = "border-slate-200 bg-white hover:border-brand-300 active:bg-brand-50";
          if (outcome) {
            if (opt === outcome.correct) {
              style = `border-green-400 bg-green-50 ${right ? "animate-pop" : ""}`;
            } else if (opt === outcome.selected) {
              style = "border-red-400 bg-red-50 animate-shake";
            } else {
              style = "border-slate-200 bg-white opacity-60";
            }
          }
          return (
            <button
              key={opt}
              type="button"
              disabled={!!outcome || isPending}
              onClick={() => choose(opt)}
              className={`flex min-h-12 w-full items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors ${style}`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                {opt}
              </span>
              <span>{current.question[`option${opt}` as const]}</span>
            </button>
          );
        })}
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {outcome && (
        <div className="mt-4 animate-pop rounded-xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-3 text-center">
          <p className="text-sm font-semibold text-brand-950">
            {right ? t("🎉 Doğru bildin!") : t("Bu sefer olmadı, ama doğru cevap yukarıda 👆")}
          </p>
          <Link
            href="/register"
            className="mt-2 inline-block rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
          >
            {t("Devamı için ücretsiz kayıt ol")}
          </Link>
        </div>
      )}
    </div>
  );
}
