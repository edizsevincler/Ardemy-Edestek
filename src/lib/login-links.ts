import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

// E-posta onayından hemen sonra kullanıcıyı otomatik giriş yaptırmak için
// kısa ömürlü, tek kullanımlık giriş jetonu (VerificationToken tablosunda "lg_"
// önekiyle saklanır; e-posta onay jetonlarıyla karışmaz).
export const LOGIN_TOKEN_PREFIX = "lg_";
const LOGIN_TOKEN_TTL_MS = 10 * 60 * 1000;

export async function createLoginToken(userId: string) {
  await prisma.verificationToken.deleteMany({
    where: { userId, token: { startsWith: LOGIN_TOKEN_PREFIX } },
  });
  const token = LOGIN_TOKEN_PREFIX + randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: { token, userId, expiresAt: new Date(Date.now() + LOGIN_TOKEN_TTL_MS) },
  });
  return token;
}

// Geçerli jetonu siler ve kullanıcı kimliğini döndürür; ikinci kullanımda null.
export async function consumeLoginToken(token: string): Promise<string | null> {
  if (!token.startsWith(LOGIN_TOKEN_PREFIX)) return null;
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expiresAt < new Date()) return null;
  // Eşzamanlı iki istekten yalnızca biri silmeyi başarır.
  const { count } = await prisma.verificationToken.deleteMany({ where: { id: record.id } });
  return count === 1 ? record.userId : null;
}
