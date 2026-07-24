"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { slugifyName, generatePassword } from "@/lib/generate";
import { revalidatePath } from "next/cache";

type CreatedAccount = { name: string; username: string; password: string };

type CreateStudentsState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success"; accounts: CreatedAccount[] };

export async function createStudents(
  _prevState: CreateStudentsState,
  formData: FormData
): Promise<CreateStudentsState> {
  const raw = String(formData.get("names") ?? "");
  const names = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return { status: "error", message: "En az bir öğrenci adı girin." };
  }

  const accounts: CreatedAccount[] = [];

  for (const name of names) {
    const baseUsername = slugifyName(name) || "ogrenci";
    let username = baseUsername;
    let suffix = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      suffix += 1;
      username = `${baseUsername}${suffix}`;
    }

    const password = generatePassword();
    const passwordHash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        username,
        passwordHash,
        role: "STUDENT",
      },
    });

    accounts.push({ name, username, password });
  }

  revalidatePath("/admin/students");

  return { status: "success", accounts };
}

// Ders sonrası hızlı ayarlama için — sınırın altına inmeyecek şekilde
// artırır/azaltır (paket modunda anlamlı, diğer modlarda kullanılmaz).
export async function adjustSessions(studentId: string, delta: number) {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) return;

  const next = Math.max(0, student.sessionsRemaining + delta);
  await prisma.user.update({
    where: { id: studentId },
    data: { sessionsRemaining: next },
  });

  revalidatePath("/admin/students");
  revalidatePath("/student");
}

type SetSessionInfoState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function setSessionInfo(
  _prevState: SetSessionInfoState,
  formData: FormData
): Promise<SetSessionInfoState> {
  const studentId = String(formData.get("studentId") ?? "");
  const sessionType = String(formData.get("sessionType") ?? "PACKAGE") as
    | "PACKAGE"
    | "UNLIMITED"
    | "PAY_PER_SESSION";
  const sessionsRemaining = Number(formData.get("sessionsRemaining") ?? 0);

  if (!studentId) {
    return { status: "error", message: "Öğrenci bulunamadı." };
  }

  await prisma.user.update({
    where: { id: studentId },
    data: {
      sessionType,
      sessionsRemaining: Number.isFinite(sessionsRemaining)
        ? Math.max(0, sessionsRemaining)
        : 0,
    },
  });

  revalidatePath("/admin/students");
  revalidatePath("/student");

  return { status: "success" };
}

// Şifremi unuttum akışı henüz yok (e-posta servisi gerektirir) — bu yüzden
// öğrenci şifresini unutursa admin bu butonla yeni bir şifre üretip verir.
export async function resetStudentPassword(studentId: string) {
  const password = generatePassword();
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id: studentId },
    data: { passwordHash },
  });

  revalidatePath("/admin/students");

  return { password };
}

// Öğrenciler de kredi biriktirip soru bankasını kullanabilir — admin bu
// butonla ödül/hediye olarak kredi ekleyebilir.
export async function giftCredits(studentId: string, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return;

  const updated = await prisma.user.update({
    where: { id: studentId },
    data: { credits: { increment: Math.round(amount) } },
  });

  revalidatePath("/admin/students");
  revalidatePath("/student");
  revalidatePath("/guest");

  return { credits: updated.credits };
}
