import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import type { CatalogItemListItem } from "@/types";
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  cn,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export default async function InputPage() {
  const rawItems = await prisma.catalogItem.findMany({
    include: {
      targetIndustry: true,
      owningOrg: true,
      techStacks: true,
      _count: { select: { useCases: true, favorites: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });
  const items = rawItems as unknown as CatalogItemListItem[];

  const productItems = items.filter((i: CatalogItemListItem) => i.category === "PRODUCT");
  const technologyItems = items.filter((i: CatalogItemListItem) => i.category === "TECHNOLOGY");
  const serviceItems = items.filter((i: CatalogItemListItem) => i.category === "SERVICE");

  function renderGrid(filtered: typeof items) {
    if (filtered.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">등록된 항목이 없습니다</p>
          <p className="mt-1 text-sm">새 항목을 추가하여 시작하세요.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <Link key={item.id} href={`/input/${item.id}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={cn("border-0", CATEGORY_COLORS[item.category])}>
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                  <Badge
                    variant={item.status === "PUBLISHED" ? "default" : "secondary"}
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-1 text-base">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {item.valueProposition}
                </p>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                <time dateTime={String(item.updatedAt)}>
                  {new Date(item.updatedAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">카탈로그 입력</h1>
          <p className="text-muted-foreground">
            카탈로그 항목을 등록하고 관리합니다.
          </p>
        </div>
        <Button asChild>
          <Link href="/input/new">
            <Plus className="mr-2 h-4 w-4" />
            새 항목 추가
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">전체 ({items.length})</TabsTrigger>
          <TabsTrigger value="PRODUCT">
            제품 ({productItems.length})
          </TabsTrigger>
          <TabsTrigger value="TECHNOLOGY">
            기술 ({technologyItems.length})
          </TabsTrigger>
          <TabsTrigger value="SERVICE">
            서비스 ({serviceItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderGrid(items)}</TabsContent>
        <TabsContent value="PRODUCT">{renderGrid(productItems)}</TabsContent>
        <TabsContent value="TECHNOLOGY">
          {renderGrid(technologyItems)}
        </TabsContent>
        <TabsContent value="SERVICE">{renderGrid(serviceItems)}</TabsContent>
      </Tabs>
    </div>
  );
}
