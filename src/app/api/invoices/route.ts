import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      // @ts-ignore - isActive field will be available after migration
      where: { isActive: true },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      clientAddress, 
      dueDate, 
      totalAmount, 
      items 
    } = body;

    // Generate Invoice Number (e.g., INV0001)
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const match = lastInvoice.invoiceNumber.match(/(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const invoiceNumber = `${clientName.replace(/\s+/g, '')}+Akuann_made+${nextNumber.toString().padStart(4, "0")}`;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        clientName,
        clientEmail,
        clientPhone,
        clientAddress,
        dueDate,
        totalAmount,
        balanceDue: totalAmount,
        status: "PENDING",
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            rate: item.rate,
            quantity: item.quantity,
            amount: item.amount,
          })),
        },
      },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Invoice creation error:", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
