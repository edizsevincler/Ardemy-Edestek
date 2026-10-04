"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type Result = { ok: boolean };

function validHour(hour: unknown): hour is number {
  return typeof hour === "number" && Number.isInteger(hour) && hour >= 0 && hour <= 23;
}

// Tarayıcının verdiği bildirim aboneliğini (cihaz adresi + anahtarlar) kaydeder
// ve hatırlatma saatini günceller. Aynı cihaz başka hesapla giriş yaptıysa
// abonelik yeni hesaba taşınır.
export async function savePushSubscription(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  hour: number
): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false };
  if (!validHour(hour)) return { ok: false };
  const { endpoint, keys } = subscription ?? {};
  if (
    typeof endpoint !== "string" ||
    !endpoint.startsWith("https://") ||
    endpoint.length > 1000 ||
    typeof keys?.p256dh !== "string" ||
    typeof keys?.auth !== "string"
  ) {
    return { ok: false };
  }

  const userId = session.user.id;
  await prisma.$transaction([
    prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh: keys.p256dh, auth: keys.auth, userId },
      update: { p256dh: keys.p256dh, auth: keys.auth, userId },
    }),
    prisma.user.update({ where: { id: userId }, data: { reminderHour: hour } }),
  ]);
  return { ok: true };
}

export async function removePushSubscription(endpoint: string): Promise<Result> {
  const session = await auth();
  if (!session?.user) return { ok: false };
  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  });
  return { ok: true };
}

export async function setReminderHour(hour: number): Promise<Result> {
  const session = await auth();
  if (!session?.user || !validHour(hour)) return { ok: false };
  await prisma.user.update({ where: { id: session.user.id }, data: { reminderHour: hour } });
  return { ok: true };
}
