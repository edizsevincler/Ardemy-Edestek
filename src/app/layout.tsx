import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/site";
import { SourceCapture } from "@/components/SourceCapture";
import { PageViewTracker } from "@/components/PageViewTracker";
import { PwaRegister } from "@/components/PwaRegister";
import { I18nProvider } from "@/lib/i18n/client";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getI18n } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1c1147",
  viewportFit: "cover",
};

// Sayfa boyanmadan önce kayıtlı/cihaz temasını uygular (yanıp sönmeyi önler).
const THEME_SCRIPT = `try{var t=localStorage.getItem("ardemy_theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

const OG_LOCALES = { tr: "tr_TR", en: "en_GB", ru: "ru_RU" } as const;

export async function generateMetadata(): Promise<Metadata> {
  const { locale, t } = await getI18n();
  return {
    metadataBase: new URL(SITE_URL),
    title: t("Ardemy Academy — Rusça ve İngilizce Test Çöz, Pratik Yap"),
    description: t("Rusça ve İngilizce konu anlatımları, binlerce test sorusu, günlük soru, deneme sınavları ve birebir ders takibi. Kayıt ol, 2 kredi hediye."),
    appleWebApp: { capable: true, title: "Ardemy", statusBarStyle: "black-translucent" },
    openGraph: {
      title: t("Ardemy Academy — Dil öğrenmenin en pratik yolu"),
      description: t("Rusça ve İngilizce testler, günlük soru, deneme sınavları ve birebir ders takibi."),
      siteName: "Ardemy Academy",
      locale: OG_LOCALES[locale],
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale } = await getI18n();
  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <I18nProvider locale={locale} dict={getDictionary(locale)}>
          <Suspense fallback={null}>
            <SourceCapture />
            <PageViewTracker />
          </Suspense>
          <PwaRegister />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
