import { signOut } from "@/auth";
import { getT } from "@/lib/i18n/server";

export async function SignOutButton() {
  const t = await getT();
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/login" });
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-brand-100 transition hover:border-white/40 hover:bg-white/10 hover:text-white"
      >
        {t("Çıkış Yap")}
      </button>
    </form>
  );
}
