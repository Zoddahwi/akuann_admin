const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Adding columns...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "Gown" ADD COLUMN IF NOT EXISTS "subcategory" TEXT;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Gown" ADD COLUMN IF NOT EXISTS "isCustomizable" BOOLEAN DEFAULT false;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Gown" ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 5.0;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Gown" ADD COLUMN IF NOT EXISTS "reviewsCount" INTEGER DEFAULT 0;`);
  console.log('Columns added successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
