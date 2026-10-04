import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { AuthShell } from "@/components/AuthShell";
import { getT } from "@/lib/i18n/server";
import { verifyUnsubscribeToken } from "@/lib/reminders";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string; t?: string }>;
}) {
  const t = await getT();
  const { u, t: token } = await searchParams;
  const valid = !!u && !!token && verifyUnsubscribeToken(u, token);

  return (
    <AuthShell>
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
        <Logo size={64} />
        <h1 className="text-xl font-semibold text-brand-950">{t("E-posta aboneliği")}</h1>
        {valid ? (
          <UnsubscribeForm userId={u} token={token} />
        ) : (
          <p className="text-sm text-slate-500">{t("Bu bağlantı geçersiz.")}</p>
        )}
      </div>
    </AuthShell>
  );
}
