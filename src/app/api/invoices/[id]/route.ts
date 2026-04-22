import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    // @ts-ignore - isActive field will be available after migration
    if (!invoice.isActive) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(invoice);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.invoice.update({
      where: { id },
      data: { isActive: false },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { clientName, clientEmail, clientPhone, clientAddress, dueDate, totalAmount, items } = body;

    // We can update the invoice and replace all items in a transaction using Prisma
    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Delete all existing items
      await tx.invoiceItem.deleteMany({
        where: { invoiceId: id }
      });

      // 2. Update invoice and recreate items
      return await tx.invoice.update({
        where: { id },
        data: {
          clientName,
          clientEmail,
          clientPhone,
          clientAddress,
          dueDate,
          totalAmount,
          balanceDue: totalAmount, // Assuming balance due always resets to total amount when edited, or should we deduct paid? If status is PAID, balance is 0. If PENDING, it's total.
          items: {
            create: items.map((item: any) => ({
              description: item.description,
              rate: item.rate,
              quantity: item.quantity,
              amount: item.amount,
            }))
          }
        },
        include: { items: true }
      });
    });
    
    // If invoice is already PAID, ensure balance is 0
    if (invoice.status === 'PAID') {
      await prisma.invoice.update({
        where: { id },
        data: { balanceDue: 0 }
      });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}
