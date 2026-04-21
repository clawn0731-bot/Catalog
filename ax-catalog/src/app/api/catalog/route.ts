import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const LIST_INCLUDE = {
  targetIndustry: true,
  owningOrg: true,
  techStacks: true,
  _count: { select: { useCases: true, favorites: true } },
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const sort = searchParams.get("sort") ?? "createdAt";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

    const where: Record<string, unknown> = {};

    const category = searchParams.get("category");
    if (category) where.category = category;

    const status = searchParams.get("status");
    if (status) where.status = status;

    const industry = searchParams.get("industry");
    if (industry) where.targetIndustry = { name: industry };

    const organization = searchParams.get("organization");
    if (organization) where.owningOrg = { name: organization };

    const deliveryType = searchParams.get("deliveryType");
    if (deliveryType) where.deliveryType = deliveryType;

    const deliveryModel = searchParams.get("deliveryModel");
    if (deliveryModel) where.deliveryModel = deliveryModel;

    const techDomain = searchParams.get("techDomain");
    const techCategory = searchParams.get("techCategory");
    const techAsset = searchParams.get("techAsset");
    if (techDomain || techCategory || techAsset) {
      const techFilter: Record<string, string> = {};
      if (techDomain) techFilter.techDomain = techDomain;
      if (techCategory) techFilter.techCategory = techCategory;
      if (techAsset) techFilter.techAsset = techAsset;
      where.techStacks = { some: techFilter };
    }

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { valueProposition: { contains: search } },
        { keyFeatures: { contains: search } },
        { differentiation: { contains: search } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.catalogItem.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.catalogItem.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("GET /api/catalog error:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      category,
      name,
      valueProposition,
      keyFeatures,
      differentiation,
      deliveryType,
      deliveryModel,
      status,
      targetIndustryId,
      owningOrgId,
      authorId,
      useCases,
      techStacks,
    } = body;

    const item = await prisma.catalogItem.create({
      data: {
        category,
        name,
        valueProposition,
        keyFeatures,
        differentiation,
        deliveryType,
        deliveryModel,
        status: status ?? "DRAFT",
        targetIndustryId,
        owningOrgId,
        authorId: authorId ?? getCurrentUser().id,
        useCases: useCases?.length
          ? {
              create: useCases.map(
                (uc: {
                  customerName: string;
                  projectName: string;
                  projectOverview: string;
                  projectSize?: number;
                  duration?: string;
                  industryId: string;
                }) => ({
                  customerName: uc.customerName,
                  projectName: uc.projectName,
                  projectOverview: uc.projectOverview,
                  projectSize: uc.projectSize,
                  duration: uc.duration,
                  industryId: uc.industryId,
                }),
              ),
            }
          : undefined,
        techStacks: techStacks?.length
          ? {
              create: techStacks.map(
                (ts: {
                  techDomain: string;
                  techCategory: string;
                  techAsset: string;
                }) => ({
                  techDomain: ts.techDomain,
                  techCategory: ts.techCategory,
                  techAsset: ts.techAsset,
                }),
              ),
            }
          : undefined,
      },
      include: {
        targetIndustry: true,
        owningOrg: true,
        author: true,
        useCases: { include: { industry: true } },
        techStacks: true,
        favorites: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/catalog error:", error);
    return NextResponse.json(
      { error: "Failed to create catalog item" },
      { status: 500 },
    );
  }
}
