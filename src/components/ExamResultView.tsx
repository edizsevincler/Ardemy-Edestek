"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";
import type { TFunction } from "@/lib/i18n/translate";
import type { ExamResultData } from "@/lib/exam-config";
import { ShareButton } from "@/components/ShareButton";

const OPTIONS = ["A", "B", "C", "D"] as const;

function verdict(percent: number, t: TFunction) {
  if (percent >= 90) return t("Muhteşem! 🏆");
  if (percent >= 70) return t("Çok iyi! 🎉");
  if (percent >= 50) return t("Fena değil, devam! 💪");
  return t("Çalışmaya devam — yanlışlarına göz at 📚");
}

export function ExamResultView({
  result,
  shareUrl,
}: {
  result: ExamResultData;
  shareUrl: string;
}) {
  const t = useT();
  const percent = Math.round((result.score / Math.max(result.total, 1)) * 100);
  const lang = t(result.language);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-center">
        <p className="text-sm text-slate-500">{t("{lang} Deneme Sınavı", { lang })}</p>
        <p className="mt-1 text-3xl font-semibold text-brand-950">
          {result.score} / {result.total}
        </p>
        <p className="text-sm text-slate-600">
          %{percent} · {verdict(percent, t)}
        </p>
        <div className="mt-3 flex flex-wrap items-start justify-center gap-3">
          <ShareButton
            imagePath={`/api/share/exam/${result.attemptId}`}
            filename="ardemy-deneme-sonucu.png"
            label={t("Sonucumu paylaş")}
            text={t("{lang} deneme sınavında {a}/{b} yaptım! 🎉 Sen de dene: {url}", { lang, a: result.score, b: result.total, url: shareUrl })}
          />
          <Link
            href="/guest/exam"
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
          >
            {t("Deneme Sınavlarım")}
          </Link>
        </div>
      </div>

      <ol className="space-y-3">
        {result.review.map((q, index) => {
          const right = q.selected === q.correct;
          return (
            <li
              key={q.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                right ? "border-green-200" : "border-red-200"
              }`}
            >
              <p className="text-xs text-slate-400">
                {t("{n}. soru", { n: index + 1 })} · {t(q.topic)}
              </p>
              <p className="mt-1 font-medium text-brand-950">{q.prompt}</p>
              <div className="mt-2 space-y-1.5">
                {OPTIONS.map((opt) => {
                  const text = q[`option${opt}` as const];
                  let style = "border-slate-200 bg-white opacity-70";
                  if (opt === q.correct) style = "border-green-400 bg-green-50";
                  else if (opt === q.selected) style = "border-red-400 bg-red-50";
                  return (
                    <div
                      key={opt}
                      className={`rounded-lg border p-2 text-sm ${style}`}
                    >
                      {opt}) {text}
                      {opt === q.selected && opt !== q.correct && t(" — senin cevabın")}
                      {opt === q.correct && opt === q.selected && " ✓"}
                    </div>
                  );
                })}
              </div>
              {q.selected === null && (
                <p className="mt-2 text-xs text-slate-500">{t("Boş bıraktın.")}</p>
              )}
              {q.explanation && (
                <p className="mt-2 rounded-lg bg-gold-50 px-3 py-2 text-sm text-slate-700">
                  💡 {q.explanation}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
