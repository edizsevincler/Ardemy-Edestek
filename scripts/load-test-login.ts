import { readFileSync } from "fs";
import path from "path";

const BASE_URL = "https://ardemy-edestek.vercel.app";
const CONCURRENCY = 43;

type Account = { name: string; username: string; password: string };

function loadAccounts(): Account[] {
  const raw = readFileSync(
    path.join(process.cwd(), "ogrenci-hesaplari.txt"),
    "utf-8"
  );
  const lines = raw.trim().split("\n").slice(1); // skip header
  return lines.map((line) => {
    const [name, username, password] = line.split("\t");
    return { name, username, password };
  });
}

function parseCookies(res: Response): string {
  const raw = res.headers.getSetCookie?.() ?? [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

async function loginAttempt(account: Account) {
  const start = Date.now();
  try {
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfCookie = parseCookies(csrfRes);
    const { csrfToken } = await csrfRes.json();

    const loginRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookie,
      },
      body: new URLSearchParams({
        username: account.username,
        password: account.password,
        csrfToken,
        json: "true",
      }),
      redirect: "manual",
    });

    const sessionCookie = parseCookies(loginRes);
    const ok =
      loginRes.status < 400 &&
      /authjs\.session-token|next-auth\.session-token/.test(sessionCookie);

    return {
      username: account.username,
      ok,
      status: loginRes.status,
      ms: Date.now() - start,
    };
  } catch (error) {
    return {
      username: account.username,
      ok: false,
      status: 0,
      ms: Date.now() - start,
      error: String(error),
    };
  }
}

async function main() {
  const accounts = loadAccounts().slice(0, CONCURRENCY);
  console.log(
    `${accounts.length} gerçek öğrenci hesabıyla AYNI ANDA canlı siteye giriş deneniyor: ${BASE_URL}`
  );

  const overallStart = Date.now();
  const results = await Promise.all(accounts.map(loginAttempt));
  const overallMs = Date.now() - overallStart;

  const successCount = results.filter((r) => r.ok).length;
  const failCount = results.length - successCount;
  const avgMs = Math.round(
    results.reduce((sum, r) => sum + r.ms, 0) / results.length
  );
  const maxMs = Math.max(...results.map((r) => r.ms));

  console.log("\n--- SONUÇ ---");
  console.log(`Toplam süre (hepsi paralel): ${overallMs}ms`);
  console.log(`Başarılı giriş: ${successCount}/${results.length}`);
  console.log(`Başarısız: ${failCount}`);
  console.log(`Ortalama istek süresi: ${avgMs}ms`);
  console.log(`En yavaş istek: ${maxMs}ms`);

  if (failCount > 0) {
    console.log("\nBaşarısız olanlar:");
    for (const r of results.filter((r) => !r.ok)) {
      console.log(`  ${r.username}: status=${r.status} ${r.error ?? ""}`);
    }
  }
}

main();
