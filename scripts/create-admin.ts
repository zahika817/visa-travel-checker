import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, AdminRole } from "@prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL missing");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = "admin@example.com";
  const password = "ChangeThisPassword123!";

  const existing = await prisma.adminUser.findUnique({
    where: {
      email,
    },
  });

  if (existing) {
    console.log("Admin already exists:", existing.email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      name: "Super Admin",
      email,
      passwordHash,
      role: AdminRole.SUPER_ADMIN,
      active: true,
    },
  });

  console.log("Admin created:");
  console.log({
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
