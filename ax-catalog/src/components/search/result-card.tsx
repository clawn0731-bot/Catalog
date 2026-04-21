"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  cn,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
} from "@/lib/utils";
import {
  Heart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Eye,
  Briefcase,
  Factory,
  Truck,
  Settings2,
} from "lucide-react";

type ResultCardProps = {
  item: any;
  score: number;
  matchReasons: string[];
  onViewDetail: () => void;
  onToggleFavorite: () => void;
  isFavorited: boolean;
};

function scoreColor(score: number) {
  if (score >= 60) return "bg-emerald-100 text-emerald-700 border-emerald-200";
  if (score >= 30) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-gray-100 text-gray-600 border-gray-200";
}

function TruncatedText({
  text,
  maxLength = 120,
}: {
  text: string;
  maxLength?: number;
}) {
  const [open, setOpen] = useState(false);

  if (!text || text.length <= maxLength) {
    return (
      <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {open ? text : `${text.slice(0, maxLength)}…`}
      </p>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-primary hover:underline mt-1 inline-flex items-center gap-0.5"
      >
        {open ? (
          <>
            접기 <ChevronUp className="h-3 w-3" />
          </>
        ) : (
          <>
            더보기 <ChevronDown className="h-3 w-3" />
          </>
        )}
      </button>
    </div>
  );
}

export function ResultCard({
  item,
  score,
  matchReasons,
  onViewDetail,
  onToggleFavorite,
  isFavorited,
}: ResultCardProps) {
  const [featuresOpen, setFeaturesOpen] = useState(false);

  return (
    <Card className="group relative hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        {/* Score row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-bold tabular-nums",
                scoreColor(score),
              )}
            >
              {score}점
            </Badge>
            {matchReasons.map((r) => (
              <Badge
                key={r}
                variant="secondary"
                className="text-[10px] font-normal h-5 bg-slate-100 text-slate-600"
              >
                {r}
              </Badge>
            ))}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label={isFavorited ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          >
            <Heart
              className={cn(
                "h-4 w-4 transition-colors",
                isFavorited
                  ? "fill-rose-500 text-rose-500"
                  : "text-muted-foreground",
              )}
            />
          </button>
        </div>

        {/* Name + Category */}
        <div className="flex items-start gap-2 mb-2">
          <h3 className="text-base font-bold leading-tight flex-1">
            {item.name}
          </h3>
          <Badge
            className={cn(
              "text-[10px] shrink-0",
              CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-800",
            )}
          >
            {CATEGORY_LABELS[item.category] ?? item.category}
          </Badge>
        </div>

        {/* Value Proposition */}
        <p className="text-sm text-foreground/80 leading-relaxed mb-3">
          {item.valueProposition}
        </p>

        {/* Key Features (collapsible) */}
        {item.keyFeatures && (
          <div className="mb-3">
            <button
              type="button"
              onClick={() => setFeaturesOpen(!featuresOpen)}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 hover:text-foreground transition-colors"
            >
              핵심 기능
              {featuresOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
            {featuresOpen && (
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.keyFeatures}
              </p>
            )}
          </div>
        )}

        {/* Tech Stack chain badges */}
        {item.techStacks?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              적용 기술
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.techStacks.map((ts: any) => (
                <span
                  key={ts.id}
                  className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 rounded-md px-2 py-1"
                >
                  <span className="font-medium text-slate-700">
                    {ts.techDomain}
                  </span>
                  <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                  <span className="text-slate-500">{ts.techCategory}</span>
                  <ChevronRight className="h-2.5 w-2.5 text-slate-400" />
                  <span className="font-medium text-slate-900">
                    {ts.techAsset}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Differentiation */}
        {item.differentiation && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              차별화 요소
            </p>
            <TruncatedText text={item.differentiation} maxLength={100} />
          </div>
        )}

        {/* Use Cases (expanded array from detail, if present) */}
        {item.useCases?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              주요 레퍼런스
            </p>
            <div className="space-y-1">
              {item.useCases.slice(0, 2).map((uc: any) => (
                <div
                  key={uc.id}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <Briefcase className="h-3 w-3 shrink-0" />
                  <span className="font-medium text-foreground">
                    {uc.customerName}
                  </span>
                  <span>—</span>
                  <span>{uc.projectName}</span>
                </div>
              ))}
              {item.useCases.length > 2 && (
                <p className="text-[11px] text-muted-foreground pl-5">
                  외 {item.useCases.length - 2}건
                </p>
              )}
            </div>
          </div>
        )}

        {/* Fallback: use case count when only _count is available */}
        {!item.useCases?.length && item._count?.useCases > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              주요 레퍼런스
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3 w-3" />
              {item._count.useCases}건의 레퍼런스 — 상세보기에서 확인
            </p>
          </div>
        )}

        <Separator className="my-3" />

        {/* Footer: badges + action */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5 gap-1">
              <Truck className="h-2.5 w-2.5" />
              {DELIVERY_TYPE_LABELS[item.deliveryType] ?? item.deliveryType}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 gap-1">
              <Settings2 className="h-2.5 w-2.5" />
              {DELIVERY_MODEL_LABELS[item.deliveryModel] ?? item.deliveryModel}
            </Badge>
            <Badge variant="outline" className="text-[10px] h-5 gap-1">
              <Factory className="h-2.5 w-2.5" />
              {item.targetIndustry?.name}
            </Badge>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onViewDetail}
            className="h-7 text-xs gap-1"
          >
            <Eye className="h-3 w-3" />
            상세보기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
