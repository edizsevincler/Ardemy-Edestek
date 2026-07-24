import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Eğitmen";

  if (!username || !password) {
    throw new Error(
      "ADMIN_USERNAME ve ADMIN_PASSWORD .env dosyasında tanımlı olmalı."
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, name, role: "ADMIN" },
    create: {
      username,
      name,
      role: "ADMIN",
      passwordHash,
    },
  });

  console.log(`Admin hesabı hazır: ${admin.username}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
