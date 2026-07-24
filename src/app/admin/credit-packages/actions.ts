"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type CreatePackageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function createCreditPackage(
  _prevState: CreatePackageState,
  formData: FormData
): Promise<CreatePackageState> {
  const name = String(formData.get("name") ?? "").trim();
  const credits = Number(formData.get("credits") ?? 0);
  const priceTRY = Number(formData.get("priceTRY") ?? 0);

  if (!name) {
    return { status: "error", message: "Paket adı gerekli." };
  }
  if (!Number.isFinite(credits) || credits < 1) {
    return { status: "error", message: "Kredi miktarı en az 1 olmalı." };
  }
  if (!Number.isFinite(priceTRY) || priceTRY <= 0) {
    return { status: "error", message: "Geçerli bir fiyat girin." };
  }

  await prisma.creditPackage.create({
    data: { name, credits: Math.round(credits), priceTRY },
  });

  revalidatePath("/admin/credit-packages");

  return { status: "success" };
}

export async function toggleCreditPackageActive(id: string, isActive: boolean) {
  await prisma.creditPackage.update({
    where: { id },
    data: { isActive },
  });
  revalidatePath("/admin/credit-packages");
  revalidatePath("/guest/credits");
}

type EditPackageState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function editCreditPackage(
  _prevState: EditPackageState,
  formData: FormData
): Promise<EditPackageState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const credits = Number(formData.get("credits") ?? 0);
  const priceTRY = Number(formData.get("priceTRY") ?? 0);

  if (!name) {
    return { status: "error", message: "Paket adı gerekli." };
  }
  if (!Number.isFinite(credits) || credits < 1) {
    return { status: "error", message: "Kredi miktarı en az 1 olmalı." };
  }
  if (!Number.isFinite(priceTRY) || priceTRY <= 0) {
    return { status: "error", message: "Geçerli bir fiyat girin." };
  }

  await prisma.creditPackage.update({
    where: { id },
    data: { name, credits: Math.round(credits), priceTRY },
  });

  revalidatePath("/admin/credit-packages");
  revalidatePath("/guest/credits");

  return { status: "success" };
}
