"use client";

import { useState, useTransition } from "react";
import { adjustSessions } from "./actions";
import { formatSessionStatus } from "@/lib/session-status";

type SessionType = "PACKAGE" | "UNLIMITED" | "PAY_PER_SESSION";

export function SessionControls({
  studentId,
  studentName,
  sessionType,
  sessionsRemaining,
}: {
  studentId: string;
  studentName: string;
  sessionType: SessionType;
  sessionsRemaining: number;
}) {
  const [value, setValue] = useState(sessionsRemaining);
  const [isPending, startTransition] = useTransition();

  function adjust(delta: number) {
    const verb = delta > 0 ? "artırmak" : "azaltmak";
    const confirmed = confirm(
      `${studentName} için oturumu 1 ${verb} istediğinize emin misiniz?`
    );
    if (!confirmed) return;

    setValue((v) => Math.max(0, v + delta));
    startTransition(() => {
      adjustSessions(studentId, delta);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-700">
        {formatSessionStatus(sessionType, value)}
      </span>
      {sessionType === "PACKAGE" && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={isPending}
            onClick={() => adjust(-1)}
            className="rounded border border-slate-300 px-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            −
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => adjust(1)}
            className="rounded border border-slate-300 px-1.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
