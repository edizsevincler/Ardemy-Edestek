"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { editQuestion } from "../../actions";

const initialState = { status: "idle" } as const;

export function EditQuestionForm({
  id,
  title,
  subject,
  body,
  creditCost,
  isPublished,
  currentFileName,
}: {
  id: string;
  title: string;
  subject: string;
  body: string;
  creditCost: number;
  isPublished: boolean;
  currentFileName: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    editQuestion,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/questions");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-brand-100 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="id" value={id} />

      <div>
        <label className="text-sm font-medium text-slate-700">Başlık</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={title}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Konu</label>
          <input
            name="subject"
            type="text"
            required
            defaultValue={subject}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Kredi bedeli
          </label>
          <input
            name="creditCost"
            type="number"
            min={1}
            defaultValue={creditCost}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Soru metni
        </label>
        <textarea
          name="body"
          rows={4}
          defaultValue={body}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Dosyayı değiştir (opsiyonel)
        </label>
        {currentFileName && (
          <p className="mt-1 text-xs text-slate-500">
            Mevcut dosya: {currentFileName}
          </p>
        )}
        <input name="file" type="file" className="mt-1 w-full text-sm" />
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input name="isPublished" type="checkbox" defaultChecked={isPublished} />
        Yayınlansın
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}
