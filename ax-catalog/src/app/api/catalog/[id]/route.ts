import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FULL_INCLUDE = {
  targetIndustry: true,
  owningOrg: true,
  author: true,
  useCases: { include: { industry: true } },
  techStacks: true,
  favorites: true,
};

export async function GET() {
  const items = await prisma.catalogItem.findMany();
  return NextResponse.json(items);
}
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { id } = params;

    const existing = await prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
      );
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

    if (useCases !== undefined) {
      await prisma.useCase.deleteMany({
        where: { catalogItemId: id },
      });
    }

    if (techStacks !== undefined) {
      await prisma.techStackEntry.deleteMany({
        where: { catalogItemId: id },
      });
    }

    const updated = await prisma.catalogItem.update({
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
            create: useCases.map((uc: any) => ({
              customerName: uc.customerName,
              projectName: uc.projectName,
              projectOverview: uc.projectOverview,
              projectSize: uc.projectSize,
              duration: uc.duration,
              industryId: uc.industryId,
            })),
          },
        }),

        ...(techStacks?.length && {
          techStacks: {
            create: techStacks.map((ts: any) => ({
              techDomain: ts.techDomain,
              techCategory: ts.techCategory,
              techAsset: ts.techAsset,
            })),
          },
        }),
      },
      include: FULL_INCLUDE,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/catalog/[id] error:", error);
    return NextResponse.json(
        { error: "Failed to update catalog item" },
        { status: 500 }
    );
  }
}

export async function DELETE(
    _request: NextRequest,
    { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existing = await prisma.catalogItem.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
          { error: "Item not found" },
          { status: 404 }
      );
    }

    await prisma.catalogItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/catalog/[id] error:", error);
    return NextResponse.json(
        { error: "Failed to delete catalog item" },
        { status: 500 }
    );
  }
}