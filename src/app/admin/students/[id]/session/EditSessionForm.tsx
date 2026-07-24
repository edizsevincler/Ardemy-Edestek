"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionInfo } from "../../actions";

const initialState = { status: "idle" } as const;

type SessionType = "PACKAGE" | "UNLIMITED" | "PAY_PER_SESSION";

export function EditSessionForm({
  studentId,
  sessionType,
  sessionsRemaining,
}: {
  studentId: string;
  sessionType: SessionType;
  sessionsRemaining: number;
}) {
  const [state, formAction, isPending] = useActionState(
    setSessionInfo,
    initialState
  );
  const [type, setType] = useState<SessionType>(sessionType);
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/students");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-slate-200 bg-white p-5"
    >
      <input type="hidden" name="studentId" value={studentId} />

      <div>
        <label className="text-sm font-medium text-slate-700">Tür</label>
        <select
          name="sessionType"
          value={type}
          onChange={(e) => setType(e.target.value as SessionType)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
        >
          <option value="PACKAGE">Sayılı oturum</option>
          <option value="UNLIMITED">Sınırsız</option>
          <option value="PAY_PER_SESSION">Günlük Ödemeli</option>
        </select>
      </div>

      {type === "PACKAGE" && (
        <div>
          <label className="text-sm font-medium text-slate-700">
            Kalan oturum sayısı
          </label>
          <input
            name="sessionsRemaining"
            type="number"
            min={0}
            defaultValue={sessionsRemaining}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      )}

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
