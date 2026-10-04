"use client";

import { useState, useTransition } from "react";
import { resendVerification, verifyGuestManually } from "./actions";

// Misafirin e-posta onay durumu: onaylanmamışsa onay e-postasını yeniden
// gönderme ve (örn. e-posta ulaşmıyorsa) elle onaylama düğmeleri.
export function VerifyControls({
  userId,
  userName,
  verified,
}: {
  userId: string;
  userName: string;
  verified: boolean;
}) {
  const [done, setDone] = useState(verified);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (done) {
    return <span className="text-green-600">✓ Onaylı</span>;
  }

  function resend() {
    setMessage(null);
    startTransition(async () => {
      const result = await resendVerification(userId);
      setMessage(result.message);
    });
  }

  function verifyNow() {
    if (!confirm(`${userName} adlı kullanıcının e-postası elle onaylansın mı? (E-posta adresinin ona ait olduğundan emin olun.)`)) return;
    startTransition(async () => {
      const result = await verifyGuestManually(userId);
      if (result.ok) setDone(true);
      else setMessage(result.message);
    });
  }

  return (
    <div className="space-y-1">
      <span className="text-amber-600">⏳ Onay bekliyor</span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={resend}
          className="rounded border border-brand-300 px-2 py-0.5 text-xs text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          Yeniden gönder
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={verifyNow}
          className="rounded border border-slate-300 px-2 py-0.5 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Elle onayla
        </button>
      </div>
      {message && <p className="max-w-[16rem] whitespace-normal text-xs text-slate-500">{message}</p>}
    </div>
  );
}
