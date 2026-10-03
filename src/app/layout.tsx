import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { SITE_URL } from "@/lib/site";
import { SourceCapture } from "@/components/SourceCapture";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Ardemy Academy — Rusça ve İngilizce Test Çöz, Pratik Yap",
  description:
    "Rusça ve İngilizce konu anlatımları, binlerce test sorusu, günlük soru, deneme sınavları ve birebir ders takibi. Kayıt ol, 2 kredi hediye.",
  openGraph: {
    title: "Ardemy Academy — Dil öğrenmenin en pratik yolu",
    description:
      "Rusça ve İngilizce testler, günlük soru, deneme sınavları ve birebir ders takibi.",
    siteName: "Ardemy Academy",
    locale: "tr_TR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <SourceCapture />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
