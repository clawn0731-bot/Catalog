"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  cn,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
  STATUS_LABELS,
  formatCurrency,
} from "@/lib/utils";
import type { CatalogItemWithRelations } from "@/types";
import {
  Pencil,
  Building2,
  User,
  Calendar,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import { useState } from "react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

type CatalogDetailDrawerProps = {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
};

async function fetchCatalogItem(
  id: string,
): Promise<CatalogItemWithRelations> {
  const res = await fetch(`/api/catalog/${id}`);
  if (!res.ok) throw new Error("항목을 불러오지 못했습니다");
  return res.json();
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="flex gap-2">
          <div className="h-5 bg-muted rounded w-16" />
          <div className="h-5 bg-muted rounded w-16" />
        </div>
      </div>
      <div className="h-px bg-muted" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-5/6" />
        </div>
      ))}
    </div>
  );
}

function UseCaseCard({
  uc,
}: {
  uc: CatalogItemWithRelations["useCases"][number];
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Briefcase className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="text-sm font-medium truncate">
            {uc.projectName}
          </span>
        </div>
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-90",
          )}
        />
      </button>
      {expanded && (
        <div className="space-y-2 pt-1 text-sm">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">고객: </span>
              {uc.customerName}
            </div>
            <div>
              <span className="text-muted-foreground">산업: </span>
              {uc.industry.name}
            </div>
            {uc.projectSize != null && (
              <div>
                <span className="text-muted-foreground">규모: </span>
                {formatCurrency(uc.projectSize)}
              </div>
            )}
            {uc.duration && (
              <div>
                <span className="text-muted-foreground">기간: </span>
                {uc.duration}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {uc.projectOverview}
          </p>
        </div>
      )}
    </div>
  );
}

export function CatalogDetailDrawer({
  itemId,
  open,
  onClose,
}: CatalogDetailDrawerProps) {
  const { data: item, isLoading } = useQuery({
    queryKey: ["catalog-item", itemId],
    queryFn: () => fetchCatalogItem(itemId!),
    enabled: !!itemId,
  });

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg p-0 flex flex-col"
      >
        <SheetHeader className="px-6 pt-6 pb-0">
          <SheetTitle className="sr-only">항목 상세</SheetTitle>
          <SheetDescription className="sr-only">
            카탈로그 항목의 상세 정보를 확인합니다
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {isLoading || !item ? (
            <DetailSkeleton />
          ) : (
            <div className="space-y-6 pt-2">
              {/* Header */}
              <div className="space-y-3">
                <h2 className="text-lg font-bold leading-tight">
                  {item.name}
                </h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    className={cn(
                      "text-xs",
                      CATEGORY_COLORS[item.category] ?? "",
                    )}
                  >
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </Badge>
                  <Badge
                    className={cn(
                      "text-xs",
                      STATUS_COLORS[item.status] ?? "",
                    )}
                  >
                    {STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Value Proposition */}
              <Section title="가치 제안">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.valueProposition}
                </p>
              </Section>

              {/* Key Features */}
              <Section title="핵심 기능">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.keyFeatures}
                </p>
              </Section>

              {/* Differentiation */}
              <Section title="차별화 요소">
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {item.differentiation}
                </p>
              </Section>

              <Separator />

              {/* Delivery */}
              <Section title="전달 정보">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">
                      전달 유형
                    </span>
                    <p className="font-medium">
                      {DELIVERY_TYPE_LABELS[item.deliveryType] ??
                        item.deliveryType}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">
                      전달 모델
                    </span>
                    <p className="font-medium">
                      {DELIVERY_MODEL_LABELS[item.deliveryModel] ??
                        item.deliveryModel}
                    </p>
                  </div>
                </div>
              </Section>

              {/* Tech Stacks */}
              {item.techStacks.length > 0 && (
                <Section title="기술 스택">
                  <div className="space-y-1.5">
                    {item.techStacks.map((ts) => (
                      <div
                        key={ts.id}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Badge
                          variant="outline"
                          className="text-[10px] font-normal"
                        >
                          {ts.techDomain}
                        </Badge>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {ts.techCategory}
                        </span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{ts.techAsset}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Use Cases */}
              {item.useCases.length > 0 && (
                <Section title={`Use Cases (${item.useCases.length})`}>
                  <div className="space-y-2">
                    {item.useCases.map((uc) => (
                      <UseCaseCard key={uc.id} uc={uc} />
                    ))}
                  </div>
                </Section>
              )}

              <Separator />

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground block">
                      소속 조직
                    </span>
                    <span className="font-medium">{item.owningOrg.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground block">작성자</span>
                    <span className="font-medium">{item.author.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground block">생성일</span>
                    <span className="font-medium">
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <div>
                    <span className="text-muted-foreground block">수정일</span>
                    <span className="font-medium">
                      {new Date(item.updatedAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2">
                <Button asChild className="w-full">
                  <Link href={`/input/${item.id}`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    편집
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>
      {children}
    </div>
  );
}
