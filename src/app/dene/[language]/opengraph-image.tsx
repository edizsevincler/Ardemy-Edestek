import { FREE_TEST_LANGUAGES, type FreeTestSlug } from "@/lib/free-test";
import { CHIP_EN, CHIP_RU, PAGE_CARD_SIZE, pageCard } from "@/lib/og/page-card";

export const alt = "Ücretsiz dil testi — Ardemy Academy";
export const size = PAGE_CARD_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return Object.keys(FREE_TEST_LANGUAGES).map((language) => ({ language }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const known = language in FREE_TEST_LANGUAGES;
  const lang = FREE_TEST_LANGUAGES[(known ? language : "rusca") as FreeTestSlug];
  return pageCard({
    title: lang.h1,
    subtitle: "5 soruda seviyeni dene, kayıt gerekmez",
    chips: [language === "ingilizce" ? CHIP_EN : CHIP_RU],
  });
}
