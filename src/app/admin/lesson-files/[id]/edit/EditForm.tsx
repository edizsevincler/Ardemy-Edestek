"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { editLessonFile } from "../../actions";

const initialState = { status: "idle" } as const;

export function EditForm({
  id,
  title,
  lessonDate,
  currentFileName,
}: {
  id: string;
  title: string;
  lessonDate: string;
  currentFileName: string;
}) {
  const [state, formAction, isPending] = useActionState(
    editLessonFile,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/lesson-files");
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
      <input type="hidden" name="id" value={id} />

      <div>
        <label className="text-sm font-medium text-slate-700">Başlık</label>
        <input
          name="title"
          type="text"
          required
          defaultValue={title}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Ders tarihi
        </label>
        <input
          name="lessonDate"
          type="date"
          defaultValue={lessonDate}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">
          Dosyayı değiştir (opsiyonel)
        </label>
        <p className="mt-1 text-xs text-slate-500">
          Mevcut dosya: {currentFileName}
        </p>
        <input name="file" type="file" className="mt-1 w-full text-sm" />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
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
