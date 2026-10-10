"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";

export type MobileMenuItem = {
  href: string;
  label: string;
  badge?: number;
  // true: yalnızca tam eşleşmede etkin (ana sayfa/panel gibi)
  exact?: boolean;
  // true: altın renkli ana eylem düğmesi gibi görünür (ör. Ücretsiz Kayıt Ol)
  highlight?: boolean;
};

// Telefonda (sm altı) hamburger menü: sağdan açılan panel. Sayfa değişince
// kendiliğinden kapanır; ESC veya dışarıya dokunmakla da kapanır. Dil, tema
// ve çıkış gibi ek öğeler `children` olarak alta eklenir.
export function MobileMenu({
  items,
  tone = "dark",
  children,
}: {
  items: MobileMenuItem[];
  tone?: "dark" | "light";
  children?: React.ReactNode;
}) {
  const t = useT();
  const pathname = usePathname();
  // Menü hangi sayfada açıldıysa orada açık sayılır; sayfa değişince kapanır.
  const [openAt, setOpenAt] = useState<string | null>(null);
  const open = openAt === pathname;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenAt(null);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const buttonStyle =
    tone === "dark"
      ? "border-white/30 text-white hover:bg-white/10"
      : "border-slate-300 text-slate-700 hover:bg-slate-100";

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setOpenAt(pathname)}
        aria-label={t("Menü")}
        aria-expanded={open}
        className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${buttonStyle}`}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={t("Menüyü kapat")}
            onClick={() => setOpenAt(null)}
            className="absolute inset-0 bg-black/60"
          />
          <nav
            aria-label={t("Menü")}
            className="animate-drawer-in absolute right-0 top-0 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto bg-brand-950 pb-[env(safe-area-inset-bottom)] text-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-brand-200">
                {t("Menü")}
              </span>
              <button
                type="button"
                onClick={() => setOpenAt(null)}
                aria-label={t("Menüyü kapat")}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <ul className="flex-1 space-y-1 px-3">
              {items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");
                const style = item.highlight
                  ? "bg-gradient-to-r from-gold-500 to-gold-400 font-semibold text-brand-950"
                  : active
                    ? "bg-white/10 font-medium text-gold-400"
                    : "text-brand-100 hover:bg-white/5";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-12 items-center justify-between gap-3 rounded-xl px-4 text-base ${style}`}
                    >
                      <span>{item.label}</span>
                      {item.badge ? (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                          {item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {children && (
              <div className="mt-4 space-y-4 border-t border-white/10 px-5 py-5">{children}</div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
