import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        catalogItem: {
          include: {
            targetIndustry: true,
            owningOrg: true,
            techStacks: true,
            _count: { select: { useCases: true, favorites: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("GET /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, catalogItemId } = await request.json();

    if (!userId || !catalogItemId) {
      return NextResponse.json(
        { error: "userId and catalogItemId are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_catalogItemId: { userId, catalogItemId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { userId, catalogItemId } });
    return NextResponse.json({ favorited: true }, { status: 201 });
  } catch (error) {
    console.error("POST /api/favorites error:", error);
    return NextResponse.json(
      { error: "Failed to toggle favorite" },
      { status: 500 },
    );
  }
}
