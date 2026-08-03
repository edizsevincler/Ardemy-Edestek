import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const ADMIN_NOTIFICATION_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL ?? "sevinclere@gmail.com";

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

// SendGrid henüz kurulmadıysa (yerel geliştirme gibi) e-posta gerçekten
// gönderilmez, linki konsola yazar — böylece akış SendGrid olmadan da
// baştan sona test edilebilir.
export async function sendVerificationEmail(
  to: string,
  name: string,
  token: string
) {
  const verifyUrl = `${APP_URL}/verify-email?token=${token}`;

  if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
    console.log(
      `[email devre dışı] ${to} için doğrulama linki: ${verifyUrl}`
    );
    return;
  }

  await sgMail.send({
    to,
    from: { email: SENDER_EMAIL, name: "Ardemy Academy" },
    subject: "Ardemy Academy - E-postanızı Onaylayın",
    html: `
      <p>Merhaba ${name},</p>
      <p>Ardemy Academy'de hesap oluşturdunuz. Hesabınızı aktifleştirmek için aşağıdaki linke tıklayın:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Bu linkin süresi 24 saattir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz.</p>
    `,
  });
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

  if (!SENDGRID_API_KEY || !SENDER_EMAIL) {
    console.log(
      `[email devre dışı] ${userName} (${roleLabel}) ${streakDays} günlük seriye ulaştı: ${rewardsUrl}`
    );
    return;
  }

  await sgMail.send({
    to: ADMIN_NOTIFICATION_EMAIL,
    from: { email: SENDER_EMAIL, name: "Ardemy Academy" },
    subject: `🔥 ${userName} ${streakDays} günlük seriyi tamamladı`,
    html: `
      <p>${roleLabel} <strong>${userName}</strong>, ${streakDays} günlük çalışma serisine ulaştı.</p>
      <p>Ödülü (ör. 40 dakikalık hediye ders) elden ayarlamayı unutmayın.</p>
      <p><a href="${rewardsUrl}">Admin panelinde görüntüle</a></p>
    `,
  });
}
