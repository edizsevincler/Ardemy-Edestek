"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startExam } from "@/lib/exam-actions";
import { useT } from "@/lib/i18n/client";

export function ExamStartButtons({
  languages,
  price,
  credits,
}: {
  languages: { language: string; count: number }[];
  price: number;
  credits: number;
}) {
  const t = useT();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function start(language: string) {
    setError(null);
    startTransition(async () => {
      const res = await startExam(language);
      if (res.status === "error") {
        setError(res.message);
        return;
      }
      router.push(`/guest/exam/${res.attemptId}`);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {languages.map((l) => (
          <button
            key={l.language}
            type="button"
            disabled={isPending || credits < price}
            onClick={() => start(l.language)}
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            {isPending ? t("Hazırlanıyor...") : t("{lang} sınavı başlat ({n} kredi)", { lang: t(l.language), n: price })}
          </button>
        ))}
      </div>
      {credits < price && (
        <p className="text-sm text-slate-500">
          {t("Yeterli kredin yok — önce kredi satın alman gerekiyor.")}
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
