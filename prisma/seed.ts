import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await hash("admin123", 12);
  const user = await prisma.user.upsert({
    where: { email: "admin@10massage.com" },
    update: {},
    create: {
      email: "admin@10massage.com",
      name: "系統管理員",
      password,
      role: "ADMIN",
    },
  });
  console.log({ user });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  }); 