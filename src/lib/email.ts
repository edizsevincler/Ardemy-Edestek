import sgMail from "@sendgrid/mail";

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

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
