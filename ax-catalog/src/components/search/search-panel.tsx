"use client";

import { Search, RotateCcw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFilters } from "@/hooks/use-filters";
import {
  CATEGORY_LABELS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
} from "@/lib/utils";

export type SearchFilterState = {
  category?: string;
  industry?: string;
  techDomain?: string;
  deliveryType?: string;
  deliveryModel?: string;
  query?: string;
};

type SearchPanelProps = {
  filters: SearchFilterState;
  onFilterChange: (filters: SearchFilterState) => void;
  onSearch: () => void;
  onReset: () => void;
};

const ALL = "__all__";

export function SearchPanel({
  filters,
  onFilterChange,
  onSearch,
  onReset,
}: SearchPanelProps) {
  const { industries, techDomains, isLoading } = useFilters();

  const updateFilter =
    (key: keyof SearchFilterState) => (value: string) => {
      onFilterChange({
        ...filters,
        [key]: value === ALL ? undefined : value,
      });
    };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  return (
    <div className="w-80 shrink-0 border-r border-border bg-white">
      <ScrollArea className="h-full">
        <div className="p-5 space-y-5">
          <div>
            <h2 className="text-base font-bold">검색 조건</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Search Criteria
            </p>
          </div>

          <Separator />

          <div className="space-y-4">
            {/* Keyword search */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">키워드 검색</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="오퍼링명, 기술, 키워드..."
                  value={filters.query ?? ""}
                  onChange={(e) =>
                    onFilterChange({
                      ...filters,
                      query: e.target.value || undefined,
                    })
                  }
                  onKeyDown={handleKeyDown}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Industry */}
            <FilterSelect
              label="고객 산업"
              value={filters.industry}
              onChange={updateFilter("industry")}
              options={industries.map((i) => ({
                value: i.name,
                label: i.name,
              }))}
              loading={isLoading}
            />

            {/* Tech Domain */}
            <FilterSelect
              label="기술 도메인"
              value={filters.techDomain}
              onChange={updateFilter("techDomain")}
              options={techDomains.map((d) => ({ value: d, label: d }))}
              loading={isLoading}
            />

            {/* Delivery Type */}
            <FilterSelect
              label="딜리버리 유형"
              value={filters.deliveryType}
              onChange={updateFilter("deliveryType")}
              options={Object.entries(DELIVERY_TYPE_LABELS).map(
                ([k, v]) => ({ value: k, label: v })
              )}
            />

            {/* Delivery Model */}
            <FilterSelect
              label="딜리버리 모델"
              value={filters.deliveryModel}
              onChange={updateFilter("deliveryModel")}
              options={Object.entries(DELIVERY_MODEL_LABELS).map(
                ([k, v]) => ({ value: k, label: v })
              )}
            />

            {/* Category */}
            <FilterSelect
              label="카테고리"
              value={filters.category}
              onChange={updateFilter("category")}
              options={Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={onSearch} className="flex-1 h-9">
              <Search className="h-3.5 w-3.5 mr-1.5" />
              검색
            </Button>
            <Button
              onClick={onReset}
              variant="ghost"
              className="h-9 px-3"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              초기화
            </Button>
          </div>

          <Separator />

          {/* Recommendation guide */}
          <Card className="bg-blue-50/60 border-blue-200/50">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    추천 가이드
                  </p>
                  <p className="text-[11px] text-blue-700 leading-relaxed">
                    산업, 기술 도메인, 딜리버리 모델이 일치할수록 높은 추천
                    점수를 받습니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  loading,
}: {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  loading?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      <Select
        value={value ?? ALL}
        onValueChange={onChange}
        disabled={loading}
      >
        <SelectTrigger className="h-9 text-sm">
          <SelectValue placeholder="전체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>전체</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
