"use client";

import { useTransition } from "react";
import { deleteReports, resolveReports } from "./actions";

export function ReportActions({
  kind,
  itemId,
  open,
}: {
  kind: string;
  itemId: string;
  open: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex gap-2">
      {open && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => resolveReports(kind, itemId))}
          className="rounded border border-green-300 px-2 py-1 text-xs text-green-700 hover:bg-green-50 disabled:opacity-50"
        >
          ✓ Çözüldü
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Bu sorunun bildirimleri silinsin mi?")) {
            startTransition(() => deleteReports(kind, itemId));
          }
        }}
        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
}
