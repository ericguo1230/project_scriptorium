// scripts/create-admin.js
import { PrismaClient } from "@prisma/client";
import { hash } from "argon2";

const prisma = new PrismaClient();

async function createAdminUser() {
  const hashedPassword = await hash("LeFlop23");

  const admin = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      firstName: "LeBron",
      lastName: "James",
      role: "admin",
      phoneNumber: "1234567890",
    },
  });
  console.log("Admin user created:", admin);
}

createAdminUser()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
