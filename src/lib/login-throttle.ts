import { prisma } from "@/lib/prisma";

const MAX_FAILURES = 8;
const WINDOW_MS = 15 * 60 * 1000;

export const LOGIN_LOCK_MINUTES = WINDOW_MS / 60_000;

export function throttleKey(identifier: string) {
  return identifier.trim().toLowerCase().slice(0, 120);
}

// Pencere içinde MAX_FAILURES ve üzeri hatalı deneme varsa giriş kilitlidir.
export async function isLoginLocked(identifier: string) {
  const row = await prisma.loginThrottle.findUnique({
    where: { key: throttleKey(identifier) },
  });
  if (!row) return false;
  if (Date.now() - row.windowStart.getTime() > WINDOW_MS) return false;
  return row.failures >= MAX_FAILURES;
}

export async function recordLoginFailure(identifier: string) {
  const key = throttleKey(identifier);
  const row = await prisma.loginThrottle.findUnique({ where: { key } });
  if (!row || Date.now() - row.windowStart.getTime() > WINDOW_MS) {
    await prisma.loginThrottle.upsert({
      where: { key },
      create: { key, failures: 1, windowStart: new Date() },
      update: { failures: 1, windowStart: new Date() },
    });
    return;
  }
  await prisma.loginThrottle.update({
    where: { key },
    data: { failures: { increment: 1 } },
  });
}

export async function clearLoginFailures(identifier: string) {
  await prisma.loginThrottle.deleteMany({
    where: { key: throttleKey(identifier) },
  });
}

// Genel amaçlı sayaç (aynı tabloyu kullanır): pencere içinde `max` denemeyi aşan
// istek için true döner ve denemeyi sayar. Örn. IP başına kayıt sınırı.
export async function hitRateLimit(key: string, max: number, windowMs: number) {
  const k = throttleKey(key);
  const row = await prisma.loginThrottle.findUnique({ where: { key: k } });
  if (!row || Date.now() - row.windowStart.getTime() > windowMs) {
    await prisma.loginThrottle.upsert({
      where: { key: k },
      create: { key: k, failures: 1, windowStart: new Date() },
      update: { failures: 1, windowStart: new Date() },
    });
    return false;
  }
  if (row.failures >= max) return true;
  await prisma.loginThrottle.update({ where: { key: k }, data: { failures: { increment: 1 } } });
  return false;
}
