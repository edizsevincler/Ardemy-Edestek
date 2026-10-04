import { makeT } from "@/lib/i18n/translate";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { unsubscribeUrl } from "@/lib/reminders";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? "sevinclere@gmail.com";

// Brevo henüz kurulmadıysa (yerel geliştirme gibi) e-posta gerçekten
// gönderilmez, içeriği konsola yazar — böylece akış Brevo olmadan da
// baştan sona test edilebilir.
async function sendEmail(
  to: string,
  toName: string,
  subject: string,
  html: string,
  headers?: Record<string, string>
) {
  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    console.log(`[email devre dışı] ${to} — ${subject}`);
    return;
  }

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Ardemy Academy", email: SENDER_EMAIL },
      to: [{ email: to, name: toName }],
      subject,
      htmlContent: html,
      ...(headers ? { headers } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo e-posta gönderilemedi (${res.status}): ${body}`);
  }
}

// E-posta dili, alıcının User.locale değerine göre seçilir (yöneticiye giden
// bildirimler Türkçe kalır).
const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c);

// Hatırlatma/karşılama e-postalarının altındaki "abonelikten çık" bağlantısı.
// Hesap e-postaları (onay, şifre sıfırlama) buna ihtiyaç duymaz.
function unsubscribeFooter(userId: string, t: ReturnType<typeof makeT>) {
  return `<p style="color:#888;font-size:12px">${t("Bu hatırlatma e-postalarını almak istemiyorsan")} <a href="${unsubscribeUrl(userId)}">${t("abonelikten çık")}</a>.</p>`;
}

function unsubscribeHeaders(userId: string) {
  return { "List-Unsubscribe": `<${unsubscribeUrl(userId)}>` };
}

const button = (url: string, label: string) =>
  `<p><a href="${url}" style="display:inline-block;background:#4b32b3;color:#fff;text-decoration:none;padding:10px 20px;border-radius:8px;font-weight:600">${label}</a></p>`;

// E-posta onaylanınca bir kez gönderilen karşılama e-postası.
export async function sendWelcomeEmail(
  userId: string,
  to: string,
  name: string,
  locale: Locale = "tr"
) {
  const t = makeT(getDictionary(locale), locale);
  await sendEmail(
    to,
    name,
    t("Ardemy Academy'ye hoş geldin! 🎉"),
    `
      <p>${t("Merhaba {name},", { name: escapeHtml(name) })}</p>
      <p>${t("Hesabın aktif! İşte başlamak için üç küçük adım:")}</p>
      <ul>
        <li>${t("📅 Günün Sorusu'nu çöz — ücretsiz, 1 dakika sürer.")}</li>
        <li>${t("🎁 Hesabında {n} kredi seni bekliyor; bir konu veya test açmak için kullanabilirsin.", { n: SIGNUP_BONUS_CREDITS })}</li>
        <li>${t("🔥 Her gün çöz, serini uzat, rozetleri topla.")}</li>
      </ul>
      ${button(`${APP_URL}/guest`, t("Hemen başla"))}
      ${unsubscribeFooter(userId, t)}
    `,
    unsubscribeHeaders(userId)
  );
}

// Kayıt olup hiçbir şey çözmemiş kullanıcıya bir kez gönderilen davet.
export async function sendFirstTestEmail(
  userId: string,
  to: string,
  name: string,
  credits: number,
  locale: Locale = "tr"
) {
  const t = makeT(getDictionary(locale), locale);
  await sendEmail(
    to,
    name,
    t("🎯 İlk testini çözmeye ne dersin?"),
    `
      <p>${t("Merhaba {name},", { name: escapeHtml(name) })}</p>
      <p>${t("Hesabını açtın ama henüz bir soru çözmedin.")}</p>
      <p>${t("Hesabında {n} kredi seni bekliyor. İlk testini çözdüğünde “İlk Adım” rozetini kazanırsın.", { n: credits })}</p>
      ${button(`${APP_URL}/guest/questions`, t("Hemen başla"))}
      ${unsubscribeFooter(userId, t)}
    `,
    unsubscribeHeaders(userId)
  );
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string,
  locale: Locale = "tr"
) {
  const t = makeT(getDictionary(locale), locale);
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await sendEmail(
    to,
    name,
    t("Ardemy Academy - E-postanızı Onaylayın"),
    `
      <p>${t("Merhaba {name},", { name: escapeHtml(name) })}</p>
      <p>${t("Ardemy Academy'de hesap oluşturdunuz. Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:")}</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>${t("Bu linkin süresi 24 saattir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.")}</p>
    `
  );
}

// Bir kullanıcı 30 günün katı bir seriye ulaştığında eğitmene bildirim
// gönderir — ödülü (ör. 40 dk hediye ders) elden vermesi için.
export async function sendStreakRewardEmail(
  userName: string,
  streakDays: number,
  role: "ADMIN" | "STUDENT" | "GUEST"
) {
  const roleLabel = role === "STUDENT" ? "Öğrenci" : "Misafir";
  const rewardsUrl = `${APP_URL}/admin/streak-rewards`;

  await sendEmail(
    ADMIN_NOTIFICATION_EMAIL,
    "Ediz Sevinçler",
    `🔥 ${userName} ${streakDays} günlük seriyi tamamladı`,
    `
      <p>${roleLabel} <strong>${userName}</strong>, ${streakDays} günlük çalışma serisine ulaştı.</p>
      <p>Ödülü (ör. 40 dakikalık hediye ders) elden ayarlamayı unutmayın.</p>
      <p><a href="${rewardsUrl}">Admin panelinde görüntüle</a></p>
    `
  );
}

// Bir kullanıcı serisini sürdürüyor ama bugün henüz soru/test çözmediyse
// günün sonunda hatırlatma gönderir — streak'i kaybetmesin diye (kayıp
// kaçırma korkusu, alışkanlık döngüsünü tamamlar).
export async function sendStreakReminderEmail(
  userId: string,
  to: string,
  name: string,
  currentStreak: number,
  locale: Locale = "tr"
) {
  const t = makeT(getDictionary(locale), locale);
  const url = `${APP_URL}/guest/questions`;

  await sendEmail(
    to,
    name,
    t("🔥 {n} günlük serini kaybetme!", { n: currentStreak }),
    `
      <p>${t("Merhaba {name},", { name: escapeHtml(name) })}</p>
      <p>${t("<strong>{n} günlük</strong> çalışma serin devam ediyor ama bugün henüz bir soru/test çözmedin.", { n: currentStreak })}</p>
      <p>${t("Serini korumak için bugün bitmeden en az bir soru çöz:")}</p>
      <p><a href="${url}">${t("Soru bankasına git")}</a></p>
      ${unsubscribeFooter(userId, t)}
    `,
    unsubscribeHeaders(userId)
  );
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  token: string,
  locale: Locale = "tr"
) {
  const t = makeT(getDictionary(locale), locale);
  const url = `${APP_URL}/reset-password?token=${token}`;

  await sendEmail(
    to,
    name,
    t("Ardemy Academy - Şifre Sıfırlama"),
    `
      <p>${t("Merhaba {name},", { name: escapeHtml(name) })}</p>
      <p>${t("Hesabınız için şifre sıfırlama isteği aldık. Yeni şifre belirlemek için aşağıdaki linke tıklayın:")}</p>
      <p><a href="${url}">${url}</a></p>
      <p>${t("Bu linkin süresi 1 saattir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.")}</p>
    `
  );
}

// Sunucu hatası gibi acil durumlarda yöneticiye (Türkçe) uyarı e-postası.
export async function sendAdminAlertEmail(subject: string, text: string) {
  const html = `<pre style="font-family:monospace;white-space:pre-wrap">${escapeHtml(text)}</pre>`;
  await sendEmail(ADMIN_NOTIFICATION_EMAIL, "Ediz Sevinçler", subject, html);
}
