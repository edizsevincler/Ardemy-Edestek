import { NextResponse, type NextRequest } from "next/server";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

// Hesabı silinmiş kullanıcının oturum çerezini temizler (bkz. auth.ts authorized).
// Yalnızca oturumdaki hesap gerçekten yoksa çıkış yapılır; böylece başka bir site
// bu adrese link vererek kullanıcıları keyfi olarak çıkış yaptıramaz.
export async function GET(request: NextRequest) {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    const exists = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!exists) await signOut({ redirectTo: "/login" });
  }
  return NextResponse.redirect(new URL("/login", request.nextUrl));
}
