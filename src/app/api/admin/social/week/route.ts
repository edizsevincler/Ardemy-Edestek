import { auth } from "@/auth";
import { buildWeekPack, isValidStart } from "@/lib/social-week-pack";

export const maxDuration = 60;

// Yönetici: ?start=YYYY-MM-DD (Pazartesi) için haftalık soru paketini zip olarak indirir.
export async function GET(request: Request) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  const start = new URL(request.url).searchParams.get("start");
  if (!isValidStart(start)) {
    return new Response("Invalid start date", { status: 400 });
  }

  try {
    const zip = await buildWeekPack(start);
    return new Response(new Uint8Array(zip), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="ardemy-haftalik-paket-${start}.zip"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("Haftalık paket oluşturulamadı:", error);
    return new Response("Paket oluşturulamadı", { status: 500 });
  }
}
