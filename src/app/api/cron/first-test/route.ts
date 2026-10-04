import { runFirstTestInvites } from "@/lib/cron-tasks";

// Elle tetiklemek için (zamanlanmış çalışma cron/daily içindedir).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("CRON_SECRET tanımlı değil", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  return Response.json(await runFirstTestInvites());
}
