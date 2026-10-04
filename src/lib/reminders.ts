import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

function sign(userId: string) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET tanımlı değil.");
  return createHmac("sha256", secret).update(`unsubscribe:${userId}`).digest("base64url");
}

// E-postadaki "abonelikten çık" linki: kullanıcı kimliği + imza. İmza
// sayesinde başkasının kimliğiyle abonelik iptal edilemez.
export function unsubscribeUrl(userId: string) {
  return `${APP_URL}/unsubscribe?u=${encodeURIComponent(userId)}&t=${sign(userId)}`;
}

export function verifyUnsubscribeToken(userId: string, token: string) {
  const given = Buffer.from(token);
  const expected = Buffer.from(sign(userId));
  return given.length === expected.length && timingSafeEqual(given, expected);
}

// Aynı e-posta aynı kullanıcıya iki kez gitmesin: önce kayıt oluşturulur
// (benzersiz kısıt), kayıt başarısızsa daha önce gönderilmiştir. Gönderim
// hata verirse kayıt silinir ki bir sonraki çalıştırmada yeniden denensin.
export async function claimEmail(userId: string, kind: string, dayKey = "") {
  try {
    await prisma.emailLog.create({ data: { userId, kind, dayKey } });
    return true;
  } catch {
    return false;
  }
}

export async function releaseEmail(userId: string, kind: string, dayKey = "") {
  await prisma.emailLog
    .delete({ where: { userId_kind_dayKey: { userId, kind, dayKey } } })
    .catch(() => undefined);
}
