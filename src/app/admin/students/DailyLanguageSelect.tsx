"use client";

import { useState, useTransition } from "react";
import { setDailyLanguage } from "./actions";
import { DAILY_LANGUAGES } from "@/lib/daily-languages";

// Öğrencinin "Günün Sorusu" dilini seçer; boş = Rusça ve İngilizce karışık.
export function DailyLanguageSelect({
  studentId,
  value,
}: {
  studentId: string;
  value: string | null;
}) {
  const [current, setCurrent] = useState(value ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function change(next: string) {
    setCurrent(next);
    setSaved(false);
    startTransition(async () => {
      await setDailyLanguage(studentId, next);
      setSaved(true);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        disabled={isPending}
        onChange={(e) => change(e.target.value)}
        className="rounded border border-slate-300 px-1.5 py-1 text-xs disabled:opacity-60"
      >
        <option value="">Karışık</option>
        {DAILY_LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
      {saved && !isPending && <span className="text-xs text-green-600">✓</span>}
    </div>
  );
}
