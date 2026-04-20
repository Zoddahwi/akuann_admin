import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const gown = await prisma.gown.create({
      data: {
        name: data.name,
        description: data.description,
        price: parseFloat(data.price),
        images: data.images || [],
        category: data.category,
        subcategory: data.subcategory,
        isCustomizable: data.isCustomizable || false,
        rating: 5.0,
        reviewsCount: 0,
      },
    });
    return NextResponse.json(gown);
  } catch (error) {
    console.error("Error creating gown:", error);
    return NextResponse.json({ error: "Failed to create gown" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9");
    const category = searchParams.get("category");
    const skip = (page - 1) * limit;

    const where = category && category !== "All" ? { category } : {};

    const [gowns, total] = await Promise.all([
      prisma.gown.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.gown.count({ where }),
    ]);

    return NextResponse.json({
      gowns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error("Failed to fetch gowns:", error);
    return NextResponse.json({ error: "Failed to fetch gowns" }, { status: 500 });
  }
}
