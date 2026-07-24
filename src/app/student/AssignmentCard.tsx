"use client";

import { useActionState, useRef, useEffect } from "react";
import { submitAssignment } from "./actions";
import { getLateLabel } from "@/lib/lateness";

const initialState = { status: "idle" } as const;

type Assignment = {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  fileUrl: string | null;
};

type Submission = {
  id: string;
  fileName: string;
  submittedAt: Date;
} | null;


export function AssignmentCard({
  assignment,
  submission,
}: {
  assignment: Assignment;
  submission: Submission;
}) {
  const [state, formAction, isPending] = useActionState(
    submitAssignment,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-slate-900">{assignment.title}</p>
          {assignment.description && (
            <p className="mt-1 text-sm text-slate-600">
              {assignment.description}
            </p>
          )}
          {assignment.dueDate && (
            <p className="mt-1 text-xs text-slate-500">
              Son tarih: {assignment.dueDate.toLocaleDateString("tr-TR")}
            </p>
          )}
        </div>
        {assignment.fileUrl && (
          <a
            href={`/api/assignments/${assignment.id}/file`}
            className="shrink-0 text-sm text-slate-600 underline hover:text-slate-900"
          >
            Dosyayı İndir
          </a>
        )}
      </div>

      {submission ? (
        (() => {
          const lateLabel = getLateLabel(assignment.dueDate, submission.submittedAt);
          const isLate = lateLabel !== null;
          return (
            <div
              className={`mt-3 rounded-md border p-3 text-sm ${
                isLate
                  ? "border-red-200 bg-red-50 text-red-800"
                  : "border-emerald-200 bg-emerald-50 text-emerald-800"
              }`}
            >
              Teslim edildi ({submission.submittedAt.toLocaleDateString("tr-TR")})
              {" — "}
              <a href={`/api/submissions/${submission.id}`} className="underline">
                {submission.fileName}
              </a>
              {isLate && (
                <p className="mt-1 font-medium">
                  {lateLabel} geç teslim edildi
                </p>
              )}
            </div>
          );
        })()
      ) : (
        <form
          ref={formRef}
          action={formAction}
          className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3"
        >
          <input type="hidden" name="assignmentId" value={assignment.id} />
          <input name="file" type="file" required className="text-sm" />
          <input
            name="note"
            type="text"
            placeholder="Not (opsiyonel)"
            className="min-w-[120px] flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-slate-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
          >
            {isPending ? "Gönderiliyor..." : "Teslim Et"}
          </button>
          {state.status === "error" && (
            <p className="w-full text-sm text-red-600">{state.message}</p>
          )}
        </form>
      )}
    </div>
  );
}
