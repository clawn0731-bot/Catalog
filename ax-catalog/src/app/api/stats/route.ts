import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type GroupByResult = { _count: number; [key: string]: unknown };

export async function GET() {
  try {
    const [
      totalItems,
      rawByCategory,
      rawByStatus,
      rawByDeliveryType,
      rawByDeliveryModel,
      industries,
      organizations,
      allItems,
    ] = await Promise.all([
      prisma.catalogItem.count(),
      prisma.catalogItem.groupBy({ by: ["category"], _count: true }),
      prisma.catalogItem.groupBy({ by: ["status"], _count: true }),
      prisma.catalogItem.groupBy({ by: ["deliveryType"], _count: true }),
      prisma.catalogItem.groupBy({ by: ["deliveryModel"], _count: true }),
      prisma.industry.findMany({
        include: { _count: { select: { catalogItems: true } } },
      }),
      prisma.organization.findMany({
        include: { _count: { select: { catalogItems: true } } },
      }),
      prisma.catalogItem.findMany({
        select: {
          category: true,
          deliveryType: true,
          targetIndustry: { select: { name: true } },
          techStacks: { select: { techDomain: true } },
        },
      }),
    ]);

    const byCategory = rawByCategory as unknown as GroupByResult[];
    const byStatus = rawByStatus as unknown as GroupByResult[];
    const byDeliveryType = rawByDeliveryType as unknown as GroupByResult[];
    const byDeliveryModel = rawByDeliveryModel as unknown as GroupByResult[];

    const categoryCount = (cat: string) =>
      byCategory.find((c: GroupByResult) => c.category === cat)?._count ?? 0;
    const statusCount = (s: string) =>
      byStatus.find((c: GroupByResult) => c.status === s)?._count ?? 0;

    const techDomainCounts = new Map<string, number>();
    const heatDI = new Map<string, number>();
    const heatDC = new Map<string, number>();

    type ItemForStats = {
      category: string;
      deliveryType: string;
      targetIndustry: { name: string };
      techStacks: { techDomain: string }[];
    };

    for (const rawItem of allItems) {
      const item = rawItem as unknown as ItemForStats;
      const dcKey = `${item.deliveryType}|${item.category}`;
      heatDC.set(dcKey, (heatDC.get(dcKey) ?? 0) + 1);

      for (const ts of item.techStacks) {
        techDomainCounts.set(ts.techDomain, (techDomainCounts.get(ts.techDomain) ?? 0) + 1);

        const diKey = `${ts.techDomain}|${item.targetIndustry.name}`;
        heatDI.set(diKey, (heatDI.get(diKey) ?? 0) + 1);
      }
    }

    type IndustryWithCount = { name: string; _count: { catalogItems: number } };
    type OrgWithCount = { name: string; _count: { catalogItems: number } };

    const stats = {
      totalItems,
      productCount: categoryCount("PRODUCT"),
      technologyCount: categoryCount("TECHNOLOGY"),
      serviceCount: categoryCount("SERVICE"),
      publishedCount: statusCount("PUBLISHED"),
      draftCount: statusCount("DRAFT"),
      byCategory: byCategory.map((c: GroupByResult) => ({ name: String(c.category), count: c._count })),
      byIndustry: (industries as unknown as IndustryWithCount[]).map((i) => ({ name: i.name, count: i._count.catalogItems })),
      byTechDomain: Array.from(techDomainCounts, ([name, count]) => ({ name, count })),
      byDeliveryType: byDeliveryType.map((d: GroupByResult) => ({ name: String(d.deliveryType), count: d._count })),
      byDeliveryModel: byDeliveryModel.map((d: GroupByResult) => ({ name: String(d.deliveryModel), count: d._count })),
      byOrganization: (organizations as unknown as OrgWithCount[]).map((o) => ({ name: o.name, count: o._count.catalogItems })),
      heatmapDomainIndustry: Array.from(heatDI, ([key, count]) => {
        const [domain, industry] = key.split("|");
        return { domain, industry, count };
      }),
      heatmapDeliveryCategory: Array.from(heatDC, ([key, count]) => {
        const [delivery, category] = key.split("|");
        return { delivery, category, count };
      }),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
