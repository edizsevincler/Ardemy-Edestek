import { signOut } from "@/auth";

export function SignOutButton() {
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
        Çıkış Yap
      </button>
    </form>
  );
}
