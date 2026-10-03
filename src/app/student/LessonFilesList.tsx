"use client";

import { useMemo, useState } from "react";
import { useLocale, useT } from "@/lib/i18n/client";
import { INTL_TAG } from "@/lib/i18n/config";
import { EmptyState } from "@/components/EmptyState";

type LessonFile = {
  id: string;
  title: string;
  lessonDate: Date | null;
  uploadedAt: Date;
};

export function LessonFilesList({ lessonFiles }: { lessonFiles: LessonFile[] }) {
  const t = useT();
  const locale = useLocale();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lessonFiles;
    return lessonFiles.filter((f) => {
      const dateStr = (f.lessonDate ?? f.uploadedAt).toLocaleDateString(INTL_TAG[locale]);
      const haystack = `${f.title} ${dateStr}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, lessonFiles, locale]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t("Ders ara (örn: 2025, ders başlığı...)")}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 sm:w-80"
      />

      {filtered.length === 0 ? (
        <EmptyState icon="files" text={t("Eşleşen ders dosyası bulunamadı.")} compact />
      ) : (
        <div className="space-y-2">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{f.title}</p>
                <p className="text-xs text-slate-500">
                  {(f.lessonDate ?? f.uploadedAt).toLocaleDateString(INTL_TAG[locale])}
                </p>
              </div>
              <a
                href={`/api/lesson-files/${f.id}`}
                className="text-sm text-slate-600 underline hover:text-slate-900"
              >
                {t("İndir")}
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
