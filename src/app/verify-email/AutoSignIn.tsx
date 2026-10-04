"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { completeSignIn } from "./actions";
import { useT } from "@/lib/i18n/client";

// Sayfa açılır açılmaz kullanıcıyı giriş yaptırır; olmazsa elle giriş bağlantısı gösterir.
export function AutoSignIn({ loginToken }: { loginToken: string }) {
  const t = useT();
  const started = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    completeSignIn(loginToken).then((result) => {
      if (result && !result.ok) setFailed(true);
    });
  }, [loginToken]);

  if (failed) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-500">{t("Otomatik giriş yapılamadı, lütfen giriş yapın.")}</p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm"
        >
          {t("Giriş Yap")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600" aria-hidden />
      <p className="text-sm text-slate-500">{t("Giriş yapılıyor...")}</p>
    </div>
  );
}
