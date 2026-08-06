const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Adding paystackRef column...");
    await prisma.$executeRaw`ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paystackRef" TEXT;`;
    console.log("Column added.");
    console.log("Adding unique constraint...");
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Order_paystackRef_key" ON "Order"("paystackRef");`;
    console.log("Index added.");
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
