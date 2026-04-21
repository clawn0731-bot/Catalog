import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type TechSelect = { techDomain: string; techCategory: string; techAsset: string };

export async function GET() {
  try {
    const [industries, organizations, rawTechStacks] = await Promise.all([
      prisma.industry.findMany({ orderBy: { name: "asc" } }),
      prisma.organization.findMany({ orderBy: { name: "asc" } }),
      prisma.techStackEntry.findMany({
        select: { techDomain: true, techCategory: true, techAsset: true },
        distinct: ["techDomain", "techCategory", "techAsset"],
        orderBy: [{ techDomain: "asc" }, { techCategory: "asc" }, { techAsset: "asc" }],
      }),
    ]);

    const techStacks: TechSelect[] = rawTechStacks;
    const techDomains = Array.from(new Set(techStacks.map((ts: TechSelect) => ts.techDomain))).sort();
    const techCategories = Array.from(new Set(techStacks.map((ts: TechSelect) => ts.techCategory))).sort();
    const techAssets = Array.from(new Set(techStacks.map((ts: TechSelect) => ts.techAsset))).sort();

    return NextResponse.json({
      industries,
      organizations,
      techDomains,
      techCategories,
      techAssets,
      techStacks,
    });
  } catch (error) {
    console.error("GET /api/filters error:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 },
    );
  }
}
