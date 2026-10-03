import { CHIP_EN, CHIP_RU, PAGE_CARD_SIZE, pageCard } from "@/lib/og/page-card";

export const alt = "Ücretsiz Rusça ve İngilizce testi — Ardemy Academy";
export const size = PAGE_CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return pageCard({
    title: "Ücretsiz Dil Testleri",
    subtitle: "Kayıt olmadan 5 soruluk test çöz",
    chips: [CHIP_RU, CHIP_EN],
  });
}
