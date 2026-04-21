"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  cn,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
  STATUS_LABELS,
} from "@/lib/utils";
import type { CatalogItemListItem } from "@/types";
import { Briefcase, Heart, Layers } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

type CatalogCardProps = {
  item: CatalogItemListItem;
  onClick: () => void;
};

export function CatalogCard({ item, onClick }: CatalogCardProps) {
  const domains = [...new Set(item.techStacks.map((ts) => ts.techDomain))];

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-snug line-clamp-1">
            {item.name}
          </h3>
          <Badge
            className={cn(
              "shrink-0 text-[10px]",
              STATUS_COLORS[item.status] ?? "",
            )}
          >
            {STATUS_LABELS[item.status] ?? item.status}
          </Badge>
        </div>
        <Badge
          className={cn(
            "w-fit text-[10px]",
            CATEGORY_COLORS[item.category] ?? "",
          )}
        >
          {CATEGORY_LABELS[item.category] ?? item.category}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {item.valueProposition}
        </p>

        {domains.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {domains.slice(0, 3).map((d) => (
              <Badge
                key={d}
                variant="outline"
                className="text-[10px] font-normal"
              >
                {d}
              </Badge>
            ))}
            {domains.length > 3 && (
              <Badge variant="outline" className="text-[10px] font-normal">
                +{domains.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t">
          <span className="truncate">{item.targetIndustry.name}</span>
          <span className="shrink-0">
            {DELIVERY_TYPE_LABELS[item.deliveryType] ?? item.deliveryType}
          </span>
          <span className="shrink-0">
            {DELIVERY_MODEL_LABELS[item.deliveryModel] ?? item.deliveryModel}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" />
            {item._count.useCases}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            {item._count.favorites}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Layers className="h-3 w-3" />
            {item.owningOrg.name}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
