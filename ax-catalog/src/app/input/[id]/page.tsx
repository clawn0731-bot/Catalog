import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CatalogForm } from "@/components/catalog/catalog-form";
import type { TechStackEntry, UseCase } from "@/types";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InputItemPage({ params }: Props) {
  const { id } = await params;
  const isNew = id === "new";

  if (!isNew) {
    const item = await prisma.catalogItem.findUnique({
      where: { id },
      include: {
        techStacks: true,
        useCases: true,
      },
    });

    if (!item) notFound();

    const techStacks = item.techStacks as unknown as TechStackEntry[];
    const useCases = item.useCases as unknown as UseCase[];

    const initialData = {
      id: item.id,
      name: item.name,
      category: item.category as string,
      valueProposition: item.valueProposition,
      keyFeatures: item.keyFeatures,
      differentiation: item.differentiation,
      deliveryType: item.deliveryType as string,
      deliveryModel: item.deliveryModel as string,
      targetIndustryId: item.targetIndustryId,
      owningOrgId: item.owningOrgId,
      techStacks: techStacks.map((ts: TechStackEntry) => ({
        techDomain: ts.techDomain,
        techCategory: ts.techCategory,
        techAsset: ts.techAsset,
      })),
      useCases: useCases.map((uc: UseCase) => ({
        customerName: uc.customerName,
        industryId: uc.industryId,
        projectName: uc.projectName,
        projectOverview: uc.projectOverview,
        projectSize: uc.projectSize,
        duration: uc.duration,
      })),
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">항목 편집</h1>
          <p className="text-muted-foreground">
            카탈로그 항목 정보를 수정합니다.
          </p>
        </div>
        <CatalogForm initialData={initialData} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">새 항목 등록</h1>
        <p className="text-muted-foreground">
          새로운 카탈로그 항목을 등록합니다.
        </p>
      </div>
      <CatalogForm />
    </div>
  );
}
