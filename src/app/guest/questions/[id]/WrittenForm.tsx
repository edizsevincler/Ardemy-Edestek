"use client";

import { useEffect, useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitWrittenTest } from "./actions";
import { useT } from "@/lib/i18n/client";
import { ProtectedContent } from "@/components/ProtectedContent";

type Item = { id: string; order: number; prompt: string; page: number | null };

const noopSubscribe = () => () => {};

function parseDraft(raw: string | null): Record<string, string> {
  if (!raw) return {};
  try {
    const value = JSON.parse(raw);
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Yazılı test: her sorunun cevabı klavyeyle yazılır. Taslak bu cihazda saklanır
// (sayfa kapanırsa yazılanlar kaybolmasın); gönderilince eğitmen okur.
export function WrittenForm({
  questionId,
  items,
  submitted,
  modelAnswers,
  feedback,
  pageCount = 0,
  watermarkText = "",
}: {
  questionId: string;
  items: Item[];
  pageCount?: number;
  watermarkText?: string;
  submitted: { answers: Record<string, string>; submittedAt: string } | null;
  modelAnswers: Record<string, string>;
  feedback: string | null;
}) {
  const t = useT();
  const router = useRouter();
  const draftKey = `ardemy_written_${questionId}`;
  // Taslak yalnızca tarayıcıda okunur (sunucuda null): hidrasyon uyumsuzluğu olmaz.
  const draftRaw = useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return window.localStorage.getItem(draftKey);
      } catch {
        return null;
      }
    },
    () => null
  );
  const [edited, setEdited] = useState<Record<string, string> | null>(null);
  const answers: Record<string, string> = edited ?? submitted?.answers ?? parseDraft(draftRaw);
  const setAnswers = (update: (prev: Record<string, string>) => Record<string, string>) =>
    setEdited(update(answers));
  const [editing, setEditing] = useState(!submitted);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!editing || !edited) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify(edited));
    } catch {
      // depolama kapalıysa taslak saklanmaz
    }
  }, [edited, editing, draftKey]);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await submitWrittenTest(questionId, answers);
      if (result.status === "error") {
        setError(result.message);
        return;
      }
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // yok say
      }
      setNotes(result.streakNotes);
      setEditing(false);
      router.refresh();
    });
  }

  const renderItem = (item: Item) => {
    const model = modelAnswers[item.id];
    return (
      <li key={item.id} className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
        <label htmlFor={`w-${item.id}`} className="block whitespace-pre-wrap font-medium text-brand-950">
          {item.order}. {item.prompt}
        </label>
        {editing ? (
          <textarea
            id={`w-${item.id}`}
            rows={3}
            maxLength={5000}
            value={answers[item.id] ?? ""}
            onChange={(e) => setAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))}
            placeholder={t("Cevabını buraya yaz...")}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        ) : (
          <p className={`mt-2 whitespace-pre-wrap text-sm ${answers[item.id]?.trim() ? "text-slate-800" : "italic text-slate-400"}`}>
            {answers[item.id]?.trim() || t("Boş bıraktın")}
          </p>
        )}
        {!editing && model && (
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            <span className="font-medium">{t("Örnek cevap:")}</span> {model}
          </p>
        )}
      </li>
    );
  };

  // Sayfa görselleri sırayla; her sayfanın altında o sayfadaki görevlerin cevap kutuları.
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const loose = items.filter((item) => !item.page || item.page > pageCount);

  const answeredCount = items.filter((item) => answers[item.id]?.trim()).length;

  return (
    <div className="space-y-4">
      {submitted && !editing && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <p className="font-medium">{t("Cevapların gönderildi. Eğitmenin cevaplarını okuyacak.")}</p>
          {notes.map((note) => (
            <p key={note} className="mt-1">{note}</p>
          ))}
        </div>
      )}

      {feedback && !editing && (
        <div className="rounded-xl border border-gold-300 bg-gold-50 p-4">
          <p className="text-sm font-semibold text-brand-950">{t("Eğitmenin geri bildirimi")}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{feedback}</p>
        </div>
      )}

      {pages.map((page) => (
        <section key={page} className="space-y-4">
          <ProtectedContent watermarkText={watermarkText}>
            {/* eslint-disable-next-line @next/next/no-img-element -- korumalı API'den gelen sayfa görseli */}
            <img
              src={`/api/questions/${questionId}/page/${page}`}
              alt={t("Sayfa {n}", { n: page })}
              loading={page === 1 ? "eager" : "lazy"}
              className="w-full rounded-xl border border-slate-200 bg-white shadow-sm"
            />
          </ProtectedContent>
          <ol className="space-y-4">{items.filter((item) => item.page === page).map(renderItem)}</ol>
        </section>
      ))}

      {loose.length > 0 && <ol className="space-y-4">{loose.map(renderItem)}</ol>}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {editing ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 active:scale-95 disabled:opacity-60"
          >
            {pending ? t("Gönderiliyor...") : t("Cevapları Gönder")}
          </button>
          <span className="text-xs text-slate-500">
            {t("{a}/{b} soru cevaplandı", { a: answeredCount, b: items.length })}
          </span>
          {submitted && (
            <button
              type="button"
              onClick={() => {
                setEdited(null);
                setEditing(false);
              }}
              className="text-sm text-slate-500 hover:underline"
            >
              {t("Vazgeç")}
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          {t("Cevaplarımı düzenle")}
        </button>
      )}
      {editing && submitted && (
        <p className="text-xs text-slate-500">{t("Yeniden gönderirsen eğitmenin önceki geri bildirimi silinir.")}</p>
      )}
    </div>
  );
}
