"use client";

import { useActionState, useRef, useEffect } from "react";
import { createAssignment } from "./actions";
import { StudentPicker } from "@/components/StudentPicker";

const initialState = { status: "idle" } as const;

export function AssignmentForm({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [state, formAction, isPending] = useActionState(
    createAssignment,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-medium text-slate-900">Yeni Ödev Ata</h2>
      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Başlık</label>
          <input
            name="title"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Açıklama (opsiyonel)
          </label>
          <textarea
            name="description"
            rows={3}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Son tarih (opsiyonel)
            </label>
            <input
              name="dueDate"
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Dosya (opsiyonel)
            </label>
            <input
              name="file"
              type="file"
              className="mt-1 w-full text-sm"
            />
          </div>
        </div>

        <StudentPicker students={students} />

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Atanıyor..." : "Ödevi Ata"}
        </button>

        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="text-sm text-emerald-600">
            {state.count} öğrenciye ödev atandı.
          </p>
        )}
      </form>
    </div>
  );
}
