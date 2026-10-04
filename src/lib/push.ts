import webpush from "web-push";
import { prisma } from "@/lib/prisma";

// Telefon/tarayıcı bildirimi (web push). Anahtarlar ortam değişkenlerinden gelir:
// NEXT_PUBLIC_VAPID_PUBLIC_KEY (tarayıcıya da verilir), VAPID_PRIVATE_KEY (gizli).
const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:sevinclere@gmail.com";

export function pushConfigured() {
  return !!PUBLIC_KEY && !!PRIVATE_KEY;
}

let configured = false;
function configure() {
  if (configured || !pushConfigured()) return;
  webpush.setVapidDetails(SUBJECT, PUBLIC_KEY!, PRIVATE_KEY!);
  configured = true;
}

export type PushPayload = { title: string; body: string; url: string; tag?: string };

// Kullanıcının tüm cihazlarına gönderir; süresi dolmuş/iptal edilmiş cihaz
// kayıtlarını (404/410) siler. En az bir cihaza gittiyse true döner.
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<boolean> {
  if (!pushConfigured()) return false;
  configure();

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  let delivered = false;
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload),
        { TTL: 6 * 60 * 60 }
      );
      delivered = true;
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => undefined);
      } else {
        console.error("Push gönderilemedi:", status ?? error);
      }
    }
  }
  return delivered;
}
