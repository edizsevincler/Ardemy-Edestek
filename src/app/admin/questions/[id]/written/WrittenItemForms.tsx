"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addWrittenItem, deleteWrittenItem, deleteWrittenPage, updateWrittenItem, uploadWrittenPages } from "./actions";

const initialState = { status: "idle" } as const;
const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 active:scale-95 disabled:opacity-60";

function PageSelect({ pageCount, value }: { pageCount: number; value?: number | null }) {
  if (pageCount === 0) return null;
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700">
      Sayfa:
      <select
        name="page"
        defaultValue={value ?? ""}
        className="rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-brand-500"
      >
        <option value="">Yok</option>
        {Array.from({ length: pageCount }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}. sayfa
          </option>
        ))}
      </select>
    </label>
  );
}

export function AddWrittenItemForm({ questionId, pageCount }: { questionId: string; pageCount: number }) {
  const [state, formAction, isPending] = useActionState(addWrittenItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">Soru Ekle</h2>
      <input type="hidden" name="questionId" value={questionId} />
      <div>
        <label className="text-sm font-medium text-slate-700">Soru</label>
        <textarea name="prompt" required rows={3} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Örnek / doğru cevap (isteğe bağlı)</label>
        <textarea name="answer" rows={2} className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">Öğrenci testi gönderdikten sonra kendi cevabıyla karşılaştırması için gösterilir.</p>
      </div>
      <PageSelect pageCount={pageCount} />
      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? "Ekleniyor..." : "Soruyu Ekle"}
      </button>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === "success" && <p className="text-sm text-emerald-600">Eklendi.</p>}
    </form>
  );
}

export function EditWrittenItemForm({
  item,
  pageCount,
}: {
  item: { id: string; order: number; prompt: string; answer: string | null; page: number | null };
  pageCount: number;
}) {
  const [state, formAction, isPending] = useActionState(updateWrittenItem, initialState);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={item.id} />
      <p className="text-sm font-semibold text-brand-700">{item.order}. soru</p>
      <textarea name="prompt" required rows={3} defaultValue={item.prompt} className={inputClass} />
      <textarea
        name="answer"
        rows={2}
        defaultValue={item.answer ?? ""}
        placeholder="Örnek / doğru cevap (isteğe bağlı)"
        className={inputClass}
      />
      <PageSelect pageCount={pageCount} value={item.page} />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className={buttonClass}>
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (confirm(`${item.order}. soru silinsin mi?`)) startDelete(() => deleteWrittenItem(item.id));
          }}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "Siliniyor..." : "Sil"}
        </button>
        {state.status === "success" && <span className="text-xs text-emerald-600">Kaydedildi</span>}
        {state.status === "error" && <span className="text-xs text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}

// Yüklemeden önce tarayıcıda küçültür (sunucu işlemi istek sınırı ~1 MB; telefon
// fotoğrafları çok daha büyük olabilir). En fazla 1600 px genişlik, JPEG.
async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.82));
  if (!blob) throw new Error("Görsel işlenemedi.");
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export function WrittenPagesManager({ questionId, pageCount }: { questionId: string; pageCount: number }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleting, startDelete] = useTransition();

  async function upload() {
    const files = Array.from(inputRef.current?.files ?? []).sort((a, b) =>
      a.name.localeCompare(b.name, "tr", { numeric: true })
    );
    if (files.length === 0) return setMessage({ ok: false, text: "Görsel seçin." });
    setMessage(null);
    try {
      for (let i = 0; i < files.length; i++) {
        setProgress(`${i + 1}/${files.length}`);
        const formData = new FormData();
        formData.append("questionId", questionId);
        formData.append("pages", await compressImage(files[i]));
        const result = await uploadWrittenPages({ status: "idle" }, formData);
        if (result.status === "error") throw new Error(result.message);
      }
      if (inputRef.current) inputRef.current.value = "";
      setMessage({ ok: true, text: `${files.length} sayfa eklendi.` });
      router.refresh();
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : "Yükleme başarısız." });
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">Sayfa Görselleri ({pageCount})</h2>
      <p className="text-xs text-slate-500">
        Taranmış veya fotoğraflanmış test sayfaları (dosya adına göre sıralanır). Öğrenci her sayfanın altında o sayfaya
        bağlı soruların cevap kutularını görür. Cevap anahtarı sayfalarını yüklemeyin.
      </p>
      {pageCount > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: pageCount }, (_, i) => (
            <div key={i} className="space-y-1">
              {/* eslint-disable-next-line @next/next/no-img-element -- korumalı API'den gelen sayfa görseli */}
              <img
                src={`/api/questions/${questionId}/page/${i + 1}`}
                alt={`${i + 1}. sayfa`}
                className="w-full rounded border border-slate-200"
              />
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{i + 1}. sayfa</span>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    if (confirm(`${i + 1}. sayfa silinsin mi?`)) startDelete(() => deleteWrittenPage(questionId, i + 1));
                  }}
                  className="font-medium text-red-600 hover:underline disabled:opacity-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="text-sm" />
        <button type="button" onClick={upload} disabled={progress !== null} className={buttonClass}>
          {progress ? `Yükleniyor ${progress}...` : "Sayfa Ekle"}
        </button>
        {message && <span className={`text-sm ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</span>}
      </div>
    </div>
  );
}
