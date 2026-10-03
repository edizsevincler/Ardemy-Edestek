import { makeT, type TFunction } from "@/lib/i18n/translate";

type SessionType = "PACKAGE" | "UNLIMITED" | "PAY_PER_SESSION";

// `t` verilmezse metinler Türkçe kalır (yönetici paneli).
export function formatSessionStatus(
  sessionType: SessionType,
  sessionsRemaining: number,
  t: TFunction = makeT(null)
) {
  if (sessionType === "UNLIMITED") return t("Sınırsız");
  if (sessionType === "PAY_PER_SESSION") return t("Günlük Ödemeli");
  return t("{n} oturum", { n: sessionsRemaining });
}
