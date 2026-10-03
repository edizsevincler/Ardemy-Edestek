import Link from "next/link";
import { getT } from "@/lib/i18n/server";

export async function Footer() {
  const t = await getT();
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-400">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} Ardemy Academy</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link href="/gizlilik-politikasi" className="hover:text-brand-600 hover:underline">
            {t("Gizlilik Politikası")}
          </Link>
          <Link
            href="/mesafeli-satis-sozlesmesi"
            className="hover:text-brand-600 hover:underline"
          >
            {t("Mesafeli Satış Sözleşmesi")}
          </Link>
          <a
            href="mailto:sevinclere@gmail.com"
            className="hover:text-brand-600 hover:underline"
          >
            {t("İletişim")}
          </a>
        </div>
      </div>
    </footer>
  );
}
