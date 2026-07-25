"use client";

import { useActionState, useRef, useEffect } from "react";
import { createStudents } from "./actions";

const initialState = { status: "idle" } as const;

export function StudentForm() {
  const [state, formAction, isPending] = useActionState(
    createStudents,
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
      <h2 className="font-medium text-slate-900">Yeni Öğrenci Ekle</h2>
      <p className="mt-1 text-sm text-slate-500">
        Her satıra bir öğrenci adı soyadı yazın. Tek seferde birden fazla
        öğrenci ekleyebilirsiniz.
      </p>
      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        <textarea
          name="names"
          required
          rows={6}
          placeholder={"Ahmetcan Koç\nReyyan Kara\nEymen Kara"}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Ekleniyor..." : "Ekle"}
        </button>
      </form>

      {state.status === "error" && (
        <p className="mt-2 text-sm text-red-600">{state.message}</p>
      )}

      {state.status === "success" && (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm font-medium text-emerald-900">
            {state.accounts.length} hesap oluşturuldu — bu bilgiler bir daha
            gösterilmeyecek, şimdi kaydedin:
          </p>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-emerald-700">
                  <th className="pr-4 py-1 font-medium">Ad Soyad</th>
                  <th className="pr-4 py-1 font-medium">Kullanıcı Adı</th>
                  <th className="pr-4 py-1 font-medium">Şifre</th>
                </tr>
              </thead>
              <tbody>
                {state.accounts.map((acc) => (
                  <tr key={acc.username} className="text-emerald-900">
                    <td className="pr-4 py-1">{acc.name}</td>
                    <td className="pr-4 py-1 font-mono">{acc.username}</td>
                    <td className="pr-4 py-1 font-mono">{acc.password}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
