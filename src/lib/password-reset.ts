import { createHash } from "node:crypto";

// E-postadaki ham token yerine veritabanında yalnızca bu özet saklanır.
export function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
