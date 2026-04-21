import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FULL_INCLUDE = {
  targetIndustry: true,
  owningOrg: true,
  author: true,
  useCases: { include: { industry: true } },
  techStacks: true,
  favorites: true,
};

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: FULL_INCLUDE,
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET /api/catalog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch catalog item" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.catalogItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

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
      useCases,
      techStacks,
    } = body;

    // Delete-and-recreate strategy for nested relations (simpler than diffing for MVP)
    if (useCases !== undefined) {
      await prisma.useCase.deleteMany({ where: { catalogItemId: id } });
    }
    if (techStacks !== undefined) {
      await prisma.techStackEntry.deleteMany({ where: { catalogItemId: id } });
    }

    const item = await prisma.catalogItem.update({
      where: { id },
      data: {
        ...(category !== undefined && { category }),
        ...(name !== undefined && { name }),
        ...(valueProposition !== undefined && { valueProposition }),
        ...(keyFeatures !== undefined && { keyFeatures }),
        ...(differentiation !== undefined && { differentiation }),
        ...(deliveryType !== undefined && { deliveryType }),
        ...(deliveryModel !== undefined && { deliveryModel }),
        ...(status !== undefined && { status }),
        ...(targetIndustryId !== undefined && { targetIndustryId }),
        ...(owningOrgId !== undefined && { owningOrgId }),
        ...(useCases?.length && {
          useCases: {
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
          },
        }),
        ...(techStacks?.length && {
          techStacks: {
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
          },
        }),
      },
      include: FULL_INCLUDE,
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("PUT /api/catalog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update catalog item" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const existing = await prisma.catalogItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await prisma.catalogItem.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/catalog/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete catalog item" },
      { status: 500 },
    );
  }
}
