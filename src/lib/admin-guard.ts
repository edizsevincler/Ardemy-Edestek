import { auth } from "@/auth";

// Admin sunucu eylemlerinin ilk satırı. Server action'lar sayfa korumasından bağımsız
// olarak herhangi bir adresten çağrılabilir; bu yüzden /admin altındaki her eylem
// yetkiyi kendisi doğrular. Yetkisiz çağrıda hata fırlatır (normal kullanımda olmaz).
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") throw new Error("Yetkisiz işlem.");
  return session;
}
