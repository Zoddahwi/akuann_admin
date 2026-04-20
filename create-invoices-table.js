const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Creating Invoice tables...');
  
  try {
    // Create Enum if not exists
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
          CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');
        END IF;
      END $$;
    `);
    console.log('Enum InvoiceStatus checked/created.');

    // Create Invoice table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Invoice" (
          "id" TEXT NOT NULL,
          "invoiceNumber" TEXT NOT NULL,
          "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "dueDate" TEXT,
          "clientName" TEXT NOT NULL,
          "clientEmail" TEXT,
          "clientPhone" TEXT,
          "clientAddress" TEXT,
          "totalAmount" DOUBLE PRECISION NOT NULL,
          "balanceDue" DOUBLE PRECISION NOT NULL,
          "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,

          CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Table Invoice checked/created.');

    // Create InvoiceItem table
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "InvoiceItem" (
          "id" TEXT NOT NULL,
          "invoiceId" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "rate" DOUBLE PRECISION NOT NULL,
          "quantity" INTEGER NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,

          CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('Table InvoiceItem checked/created.');

    // Indexes
    await prisma.$executeRawUnsafe('CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber")');
    await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS "Invoice_invoiceNumber_idx" ON "Invoice"("invoiceNumber")');
    console.log('Indexes checked/created.');

    // Foreign Key
    await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceItem_invoiceId_fkey') THEN
          ALTER TABLE "InvoiceItem" ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" 
          FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$;
    `);
    console.log('Foreign key checked/created.');

    console.log('Successfully initialized Invoice tables!');
  } catch (err) {
    console.error('Error creating tables:', err);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
