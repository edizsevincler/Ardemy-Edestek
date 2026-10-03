import { makeT } from "@/lib/i18n/translate";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

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
  html: string
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
    `
  );
}
