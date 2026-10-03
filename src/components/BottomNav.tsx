"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";

export type BottomNavIcon = "home" | "book" | "exam" | "shop" | "history" | "chat" | "student";

export type BottomNavItem = {
  href: string;
  label: string;
  icon: BottomNavIcon;
  badge?: number;
  // true: yalnızca tam eşleşmede etkin (panel ana sayfaları gibi)
  exact?: boolean;
};

const PATHS: Record<BottomNavIcon, string> = {
  home: "M3 11.5 12 4l9 7.5M5.5 10v9.5h4.5v-5.5h4v5.5h4.5V10",
  book: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5v-15ZM20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5v-15Z",
  exam: "M8 4h8l1 2h2.5v14.5h-13V6H7l1-2ZM9 11h6M9 15h4",
  shop: "M5 8h14l-1 12H6L5 8ZM9 8V6.5a3 3 0 0 1 6 0V8",
  history: "M12 7v5l3 2M4 12a8 8 0 1 0 2.5-5.8M4 4v4h4",
  chat: "M4 5.5h16v10H9.5L5 19.5v-4H4v-10Z",
  student: "M12 4 3 9l9 5 9-5-9-5ZM7 12v4.5c0 1 2.2 2.5 5 2.5s5-1.5 5-2.5V12",
};

// Telefonda ekranın altına sabitlenen gezinme çubuğu (sm ve üstünde gizli).
// Etkin sayfa, yol adına göre belirlenir.
export function BottomNav({ items }: { items: BottomNavItem[] }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-brand-950/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.25)] backdrop-blur sm:hidden"
      aria-label={t("Menü")}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {items.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex h-14 flex-col items-center justify-center gap-0.5 px-1 text-[10px] font-medium transition-colors ${
                  active ? "text-gold-400" : "text-brand-200 active:text-gold-300"
                }`}
              >
                <span className="relative">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={active ? 2 : 1.6}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <path d={PATHS[item.icon]} />
                  </svg>
                  {item.badge ? (
                    <span className="absolute -right-2 -top-1 rounded-full bg-red-500 px-1 text-[9px] leading-4 text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                <span className="max-w-full truncate">{item.label}</span>
                {active && (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-gold-400" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
