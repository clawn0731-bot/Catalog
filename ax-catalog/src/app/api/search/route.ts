import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scoreCatalogItems, type SearchCriteria } from "@/lib/scoring";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const criteria: SearchCriteria = {};
    const where: Record<string, unknown> = { status: "PUBLISHED" };

    const industry = searchParams.get("industry");
    if (industry) {
      criteria.industry = industry;
      where.targetIndustry = { name: industry };
    }

    const techDomain = searchParams.get("techDomain");
    if (techDomain) {
      criteria.techDomain = techDomain;
    }

    const deliveryType = searchParams.get("deliveryType");
    if (deliveryType) {
      criteria.deliveryType = deliveryType;
      where.deliveryType = deliveryType;
    }

    const deliveryModel = searchParams.get("deliveryModel");
    if (deliveryModel) {
      criteria.deliveryModel = deliveryModel;
      where.deliveryModel = deliveryModel;
    }

    const category = searchParams.get("category");
    if (category) {
      criteria.category = category;
      where.category = category;
    }

    const query = searchParams.get("query");
    if (query) {
      criteria.query = query;
    }

    const items: Array<Record<string, unknown> & { id: string; category: string; name: string; valueProposition: string; keyFeatures: string; differentiation: string; deliveryType: string; deliveryModel: string; targetIndustry: { name: string }; techStacks: { techDomain: string; techCategory: string; techAsset: string }[] }> = await prisma.catalogItem.findMany({
      where,
      include: {
        targetIndustry: true,
        owningOrg: true,
        techStacks: true,
        useCases: { include: { industry: true } },
        _count: { select: { useCases: true, favorites: true } },
      },
    });

    const scores = scoreCatalogItems(items, criteria);
    const scoreMap = new Map(scores.map((s) => [s.id, s]));

    const results = items
      .map((item: typeof items[number]) => {
        const scoreData = scoreMap.get(item.id)!;
        return { ...item, score: scoreData.score, matchReasons: scoreData.matchReasons };
      })
      .sort((a: { score: number }, b: { score: number }) => b.score - a.score);

    return NextResponse.json({ items: results });
  } catch (error) {
    console.error("GET /api/search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 },
    );
  }
}
