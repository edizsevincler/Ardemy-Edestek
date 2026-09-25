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

export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  await sendEmail(
    to,
    name,
    "Ardemy Academy - E-postanızı Onaylayın",
    `
      <p>Merhaba ${name},</p>
      <p>Ardemy Academy'de hesap oluşturdunuz. Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Bu linkin süresi 24 saattir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
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
