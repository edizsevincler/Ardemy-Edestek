import Link from "next/link";
import { WrittenFeedbackForm } from "./WrittenFeedbackForm";

export type WrittenAnswer = { itemId: string; text: string };

export type SubmissionView = {
  id: string;
  submittedAt: Date;
  feedback: string | null;
  answers: WrittenAnswer[];
  user: { name: string; email: string | null; username: string | null; role: string };
  question?: { id: string; title: string; subject: string };
};

// Bir öğrencinin yazılı test gönderimi: her soru, öğrencinin cevabı ve (varsa)
// örnek cevap alt alta; altta geri bildirim formu.
export function SubmissionCard({
  submission,
  items,
}: {
  submission: SubmissionView;
  items: { id: string; order: number; prompt: string; answer: string | null }[];
}) {
  const byItem = new Map(submission.answers.map((a) => [a.itemId, a.text]));
  const { user } = submission;

  return (
    <div id={submission.id} className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-medium text-brand-950">
            {user.name}{" "}
            <span className="font-normal text-slate-400">({user.email ?? user.username})</span>{" "}
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
              {user.role === "STUDENT" ? "Öğrenci" : "Misafir"}
            </span>
          </p>
          {submission.question && (
            <Link
              href={`/admin/questions/${submission.question.id}/answers#${submission.id}`}
              className="text-sm text-brand-600 hover:underline"
            >
              {submission.question.subject} · {submission.question.title}
            </Link>
          )}
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>{submission.submittedAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p>
          <p className={submission.feedback ? "text-emerald-600" : "text-amber-600"}>
            {submission.feedback ? "Geri bildirim verildi" : "Geri bildirim bekliyor"}
          </p>
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        {items.map((item) => {
          const text = byItem.get(item.id)?.trim();
          return (
            <li key={item.id} className="rounded-lg border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-sm font-medium text-brand-950">
                {item.order}. {item.prompt}
              </p>
              <p className={`mt-1 whitespace-pre-wrap text-sm ${text ? "text-slate-800" : "italic text-slate-400"}`}>
                {text || "Boş bırakıldı"}
              </p>
              {item.answer && (
                <p className="mt-1 whitespace-pre-wrap text-xs text-emerald-700">Örnek cevap: {item.answer}</p>
              )}
            </li>
          );
        })}
      </ol>

      <WrittenFeedbackForm submissionId={submission.id} currentFeedback={submission.feedback} />
    </div>
  );
}
