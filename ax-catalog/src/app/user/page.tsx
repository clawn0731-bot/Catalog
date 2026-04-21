"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  cn,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
  formatCurrency,
} from "@/lib/utils";
import {
  SearchPanel,
  type SearchFilterState,
} from "@/components/search/search-panel";
import { ResultCard } from "@/components/search/result-card";
import type { CatalogItemWithRelations } from "@/types";
import {
  Loader2,
  Inbox,
  Sparkles,
  Building2,
  User,
  Calendar,
  ChevronRight,
  Briefcase,
  ArrowUpDown,
  Factory,
} from "lucide-react";

const MOCK_USER_ID = "user-admin";

type SortKey = "score" | "name";

/* ------------------------------------------------------------------ */
/*  Data fetchers                                                      */
/* ------------------------------------------------------------------ */

async function fetchSearch(params: SearchFilterState) {
  const qs = new URLSearchParams();
  if (params.industry) qs.set("industry", params.industry);
  if (params.techDomain) qs.set("techDomain", params.techDomain);
  if (params.deliveryType) qs.set("deliveryType", params.deliveryType);
  if (params.deliveryModel) qs.set("deliveryModel", params.deliveryModel);
  if (params.category) qs.set("category", params.category);
  if (params.query) qs.set("query", params.query);

  const res = await fetch(`/api/search?${qs.toString()}`);
  if (!res.ok) throw new Error("검색에 실패했습니다");
  const data = await res.json();
  return data.items as any[];
}

async function fetchCatalogItem(
  id: string,
): Promise<CatalogItemWithRelations> {
  const res = await fetch(`/api/catalog/${id}`);
  if (!res.ok) throw new Error("항목을 불러오지 못했습니다");
  return res.json();
}

async function fetchFavoriteIds(userId: string): Promise<string[]> {
  const res = await fetch(`/api/favorites?userId=${userId}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.favorites as any[]).map((f: any) => f.catalogItemId);
}

async function toggleFavorite(catalogItemId: string) {
  const res = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: MOCK_USER_ID, catalogItemId }),
  });
  if (!res.ok) throw new Error("즐겨찾기 처리에 실패했습니다");
  return res.json();
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function UserWorkspacePage() {
  const qc = useQueryClient();

  const [filters, setFilters] = useState<SearchFilterState>({});
  const [activeSearch, setActiveSearch] = useState<SearchFilterState | null>(
    null,
  );
  const [sortBy, setSortBy] = useState<SortKey>("score");
  const [detailId, setDetailId] = useState<string | null>(null);

  /* Search results */
  const {
    data: results,
    isLoading: searching,
    isFetching,
  } = useQuery({
    queryKey: ["search", activeSearch],
    queryFn: () => fetchSearch(activeSearch!),
    enabled: !!activeSearch,
  });

  /* Favorites */
  const { data: favIds = [] } = useQuery({
    queryKey: ["favorites", MOCK_USER_ID],
    queryFn: () => fetchFavoriteIds(MOCK_USER_ID),
  });
  const favSet = new Set(favIds);

  const favMutation = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["favorites", MOCK_USER_ID] }),
  });

  /* Detail item */
  const { data: detailItem, isLoading: loadingDetail } = useQuery({
    queryKey: ["catalog-item", detailId],
    queryFn: () => fetchCatalogItem(detailId!),
    enabled: !!detailId,
  });

  /* Handlers */
  const handleSearch = useCallback(() => {
    setActiveSearch({ ...filters });
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters({});
    setActiveSearch(null);
  }, []);

  /* Sorted results */
  const sorted = results
    ? [...results].sort((a, b) =>
        sortBy === "name" ? a.name.localeCompare(b.name, "ko") : b.score - a.score,
      )
    : [];

  return (
    <div className="-m-4 lg:-m-6 flex h-[calc(100vh-3.5rem)]">
      {/* Left: filters */}
      <SearchPanel
        filters={filters}
        onFilterChange={setFilters}
        onSearch={handleSearch}
        onReset={handleReset}
      />

      {/* Right: results */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold">검색 결과</h2>
            {activeSearch && results && (
              <Badge variant="secondary" className="text-xs font-medium">
                {results.length}건
              </Badge>
            )}
            {isFetching && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>

          {activeSearch && sorted.length > 0 && (
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(v) => setSortBy(v as SortKey)}
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score">추천순</SelectItem>
                  <SelectItem value="name">이름순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Body */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {/* Welcome (no search yet) */}
            {!activeSearch && <WelcomeState />}

            {/* Loading */}
            {activeSearch && searching && (
              <div className="flex flex-col items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">검색 중…</p>
              </div>
            )}

            {/* Empty */}
            {activeSearch && !searching && results?.length === 0 && (
              <EmptyState />
            )}

            {/* Results */}
            {activeSearch && !searching && sorted.length > 0 && (
              <div className="space-y-4">
                {sorted.map((item) => (
                  <ResultCard
                    key={item.id}
                    item={item}
                    score={item.score}
                    matchReasons={item.matchReasons}
                    onViewDetail={() => setDetailId(item.id)}
                    onToggleFavorite={() => favMutation.mutate(item.id)}
                    isFavorited={favSet.has(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Detail sheet */}
      <Sheet
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col"
        >
          <SheetHeader className="px-6 pt-6 pb-0">
            <SheetTitle className="sr-only">오퍼링 상세</SheetTitle>
            <SheetDescription className="sr-only">
              선택한 AX 오퍼링의 상세 정보
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6 pb-6">
            {loadingDetail || !detailItem ? (
              <DetailSkeleton />
            ) : (
              <DetailContent item={detailItem} />
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function WelcomeState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <h3 className="text-lg font-bold mb-2">
        검색 조건을 선택하여 관련 AX 오퍼링을 찾아보세요
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        아래 조건을 조합하면 최적의 제안을 추천받을 수 있습니다.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
        <Inbox className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-bold mb-2">
        검색 조건에 맞는 항목이 없습니다
      </h3>
      <p className="text-sm text-muted-foreground">조건을 변경해 보세요.</p>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse pt-2">
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

function UseCaseCard({
  uc,
}: {
  uc: CatalogItemWithRelations["useCases"][number];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <button
        type="button"
        className="flex items-center justify-between w-full text-left"
        onClick={() => setOpen(!open)}
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
            open && "rotate-90",
          )}
        />
      </button>
      {open && (
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

function DetailContent({ item }: { item: CatalogItemWithRelations }) {
  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold leading-tight">{item.name}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={cn(
              "text-xs",
              CATEGORY_COLORS[item.category] ?? "",
            )}
          >
            {CATEGORY_LABELS[item.category] ?? item.category}
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

      {/* Delivery info */}
      <Section title="전달 정보">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">전달 유형</span>
            <p className="font-medium">
              {DELIVERY_TYPE_LABELS[item.deliveryType] ?? item.deliveryType}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">전달 모델</span>
            <p className="font-medium">
              {DELIVERY_MODEL_LABELS[item.deliveryModel] ?? item.deliveryModel}
            </p>
          </div>
        </div>
      </Section>

      {/* Tech Stacks */}
      {item.techStacks.length > 0 && (
        <Section title="기술 스택">
          <div className="space-y-1.5">
            {item.techStacks.map((ts) => (
              <div key={ts.id} className="flex items-center gap-1.5 text-xs">
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
        <Section title={`레퍼런스 (${item.useCases.length})`}>
          <div className="space-y-2">
            {item.useCases.map((uc) => (
              <UseCaseCard key={uc.id} uc={uc} />
            ))}
          </div>
        </Section>
      )}

      <Separator />

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <MetaCell
          icon={<Factory className="h-3.5 w-3.5 text-muted-foreground" />}
          label="대상 산업"
          value={item.targetIndustry.name}
        />
        <MetaCell
          icon={<Building2 className="h-3.5 w-3.5 text-muted-foreground" />}
          label="소속 조직"
          value={item.owningOrg.name}
        />
        <MetaCell
          icon={<User className="h-3.5 w-3.5 text-muted-foreground" />}
          label="작성자"
          value={item.author.name}
        />
        <MetaCell
          icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          label="생성일"
          value={new Date(item.createdAt).toLocaleDateString("ko-KR")}
        />
        <MetaCell
          icon={<Calendar className="h-3.5 w-3.5 text-muted-foreground" />}
          label="수정일"
          value={new Date(item.updatedAt).toLocaleDateString("ko-KR")}
        />
      </div>
    </div>
  );
}

function MetaCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <span className="text-muted-foreground block">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
    </div>
  );
}
