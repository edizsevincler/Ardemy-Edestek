type SessionType = "PACKAGE" | "UNLIMITED" | "PAY_PER_SESSION";

export function formatSessionStatus(
  sessionType: SessionType,
  sessionsRemaining: number
) {
  if (sessionType === "UNLIMITED") return "Sınırsız";
  if (sessionType === "PAY_PER_SESSION") return "Günlük Ödemeli";
  return `${sessionsRemaining} oturum`;
}
