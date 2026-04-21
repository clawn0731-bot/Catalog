"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import {
  Search,
  LayoutList,
  Grid3X3,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Package,
  Cpu,
  Wrench,
  Database,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";

import { useFilters } from "@/hooks/use-filters";
import { CatalogDetailDrawer } from "@/components/catalog/catalog-detail-drawer";
import { CatalogCard } from "@/components/catalog/catalog-card";
import type { CatalogItemListItem, StatsData } from "@/types";
import {
  cn,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
  STATUS_LABELS,
  formatNumber,
} from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-amber-100 text-amber-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const ALL_VALUE = "__all__";

type CatalogResponse = {
  items: CatalogItemListItem[];
  total: number;
  page: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Data fetchers
// ---------------------------------------------------------------------------

async function fetchCatalog(params: URLSearchParams): Promise<CatalogResponse> {
  const res = await fetch(`/api/catalog?${params.toString()}`);
  if (!res.ok) throw new Error("카탈로그 데이터를 불러오지 못했습니다");
  return res.json();
}

async function fetchStats(): Promise<StatsData> {
  const res = await fetch("/api/stats");
  if (!res.ok) throw new Error("통계를 불러오지 못했습니다");
  return res.json();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DataPageWrapper() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">로딩 중...</div>}>
      <DataPage />
    </Suspense>
  );
}

function DataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // -- Drawer state --
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // -- View mode --
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // -- Derive filter/page state from URL --
  const filterState = useMemo(
    () => ({
      category: searchParams.get("category") ?? undefined,
      industry: searchParams.get("industry") ?? undefined,
      techDomain: searchParams.get("techDomain") ?? undefined,
      deliveryType: searchParams.get("deliveryType") ?? undefined,
      deliveryModel: searchParams.get("deliveryModel") ?? undefined,
      organization: searchParams.get("organization") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("search") ?? undefined,
    }),
    [searchParams],
  );

  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const pageSize = parseInt(searchParams.get("limit") ?? "20", 10);
  const sortField = searchParams.get("sort") ?? "createdAt";
  const sortOrder = searchParams.get("order") ?? "desc";

  // -- URL updates --
  const updateParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = true) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (resetPage && !("page" in updates)) {
        params.delete("page");
      }
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const resetFilters = useCallback(() => {
    router.push(pathname, { scroll: false });
  }, [router, pathname]);

  // -- Filter options --
  const filterOptions = useFilters();

  // -- Stats --
  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    staleTime: 60_000,
  });

  // -- Catalog data --
  const apiParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(pageSize));
    p.set("sort", sortField);
    p.set("order", sortOrder);
    if (filterState.category) p.set("category", filterState.category);
    if (filterState.industry) p.set("industry", filterState.industry);
    if (filterState.techDomain) p.set("techDomain", filterState.techDomain);
    if (filterState.deliveryType)
      p.set("deliveryType", filterState.deliveryType);
    if (filterState.deliveryModel)
      p.set("deliveryModel", filterState.deliveryModel);
    if (filterState.organization)
      p.set("organization", filterState.organization);
    if (filterState.status) p.set("status", filterState.status);
    if (filterState.search) p.set("search", filterState.search);
    return p;
  }, [page, pageSize, sortField, sortOrder, filterState]);

  const { data, isLoading } = useQuery({
    queryKey: ["catalog", apiParams.toString()],
    queryFn: () => fetchCatalog(apiParams),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // -- Sorting state (synced from URL) --
  const sorting: SortingState = useMemo(
    () => [{ id: sortField, desc: sortOrder === "desc" }],
    [sortField, sortOrder],
  );

  const handleSortingChange = useCallback(
    (updaterOrValue: SortingState | ((old: SortingState) => SortingState)) => {
      const next =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sorting)
          : updaterOrValue;
      if (next.length > 0) {
        updateParams(
          {
            sort: next[0].id,
            order: next[0].desc ? "desc" : "asc",
            page: String(page),
          },
          false,
        );
      }
    },
    [sorting, updateParams, page],
  );

  // -- Columns --
  const columns: ColumnDef<CatalogItemListItem>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "항목명",
        cell: ({ row }) => (
          <span className="font-medium text-sm">{row.original.name}</span>
        ),
        size: 200,
      },
      {
        accessorKey: "category",
        header: "카테고리",
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            className={cn(
              "text-[10px]",
              CATEGORY_COLORS[row.original.category] ?? "",
            )}
          >
            {CATEGORY_LABELS[row.original.category] ?? row.original.category}
          </Badge>
        ),
        size: 100,
      },
      {
        id: "industry",
        accessorFn: (row) => row.targetIndustry.name,
        header: "산업",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.targetIndustry.name}</span>
        ),
        size: 120,
      },
      {
        id: "techDomains",
        header: "기술 도메인",
        enableSorting: false,
        cell: ({ row }) => {
          const domains = [
            ...new Set(row.original.techStacks.map((ts) => ts.techDomain)),
          ];
          return (
            <div className="flex flex-wrap gap-1">
              {domains.slice(0, 2).map((d) => (
                <Badge
                  key={d}
                  variant="outline"
                  className="text-[10px] font-normal"
                >
                  {d}
                </Badge>
              ))}
              {domains.length > 2 && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  +{domains.length - 2}
                </Badge>
              )}
            </div>
          );
        },
        size: 180,
      },
      {
        accessorKey: "deliveryType",
        header: "전달 유형",
        cell: ({ row }) => (
          <span className="text-sm">
            {DELIVERY_TYPE_LABELS[row.original.deliveryType] ??
              row.original.deliveryType}
          </span>
        ),
        size: 100,
      },
      {
        accessorKey: "deliveryModel",
        header: "전달 모델",
        cell: ({ row }) => (
          <span className="text-sm">
            {DELIVERY_MODEL_LABELS[row.original.deliveryModel] ??
              row.original.deliveryModel}
          </span>
        ),
        size: 120,
      },
      {
        accessorKey: "status",
        header: "상태",
        cell: ({ row }) => (
          <Badge
            className={cn(
              "text-[10px]",
              STATUS_COLORS[row.original.status] ?? "",
            )}
          >
            {STATUS_LABELS[row.original.status] ?? row.original.status}
          </Badge>
        ),
        size: 80,
      },
      {
        id: "useCases",
        header: "Use Cases",
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-center block">
            {row.original._count.useCases}
          </span>
        ),
        size: 80,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedItemId(row.original.id);
              setDrawerOpen(true);
            }}
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
        ),
        size: 50,
      },
    ],
    [],
  );

  // -- Table instance --
  const table = useReactTable({
    data: items,
    columns,
    state: { sorting },
    onSortingChange: handleSortingChange,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    pageCount: totalPages,
  });

  // -- Derived pagination --
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const hasActiveFilters = Object.values(filterState).some(Boolean);

  // -- Search debounce handler --
  const [searchInput, setSearchInput] = useState(filterState.search ?? "");

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      updateParams({ search: searchInput || undefined });
    }
  };

  // -- Select helper --
  function selectValue(val: string | undefined) {
    return val ?? ALL_VALUE;
  }

  function fromSelectValue(val: string) {
    return val === ALL_VALUE ? undefined : val;
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">데이터 통합</h1>
        <p className="text-sm text-muted-foreground mt-1">
          전체 AX 카탈로그 항목을 검색하고 관리합니다
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="전체 항목"
          value={stats?.totalItems ?? 0}
          icon={<Database className="h-4 w-4" />}
          color="text-slate-600 bg-slate-100"
        />
        <SummaryCard
          label="제품"
          value={stats?.productCount ?? 0}
          icon={<Package className="h-4 w-4" />}
          color="text-blue-600 bg-blue-100"
        />
        <SummaryCard
          label="기술"
          value={stats?.technologyCount ?? 0}
          icon={<Cpu className="h-4 w-4" />}
          color="text-purple-600 bg-purple-100"
        />
        <SummaryCard
          label="서비스"
          value={stats?.serviceCount ?? 0}
          icon={<Wrench className="h-4 w-4" />}
          color="text-emerald-600 bg-emerald-100"
        />
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="검색어 입력..."
                className="pl-9 h-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                onBlur={() =>
                  updateParams({ search: searchInput || undefined })
                }
              />
            </div>

            {/* Category */}
            <Select
              value={selectValue(filterState.category)}
              onValueChange={(v) =>
                updateParams({ category: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="카테고리" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 카테고리</SelectItem>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Industry */}
            <Select
              value={selectValue(filterState.industry)}
              onValueChange={(v) =>
                updateParams({ industry: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="산업" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 산업</SelectItem>
                {filterOptions.industries.map((ind) => (
                  <SelectItem key={ind.id} value={ind.name}>
                    {ind.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tech Domain */}
            <Select
              value={selectValue(filterState.techDomain)}
              onValueChange={(v) =>
                updateParams({ techDomain: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="기술 도메인" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 도메인</SelectItem>
                {filterOptions.techDomains.map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delivery Type */}
            <Select
              value={selectValue(filterState.deliveryType)}
              onValueChange={(v) =>
                updateParams({ deliveryType: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="전달 유형" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 유형</SelectItem>
                {Object.entries(DELIVERY_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Delivery Model */}
            <Select
              value={selectValue(filterState.deliveryModel)}
              onValueChange={(v) =>
                updateParams({ deliveryModel: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="전달 모델" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 모델</SelectItem>
                {Object.entries(DELIVERY_MODEL_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Organization */}
            <Select
              value={selectValue(filterState.organization)}
              onValueChange={(v) =>
                updateParams({ organization: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="조직" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 조직</SelectItem>
                {filterOptions.organizations.map((org) => (
                  <SelectItem key={org.id} value={org.name}>
                    {org.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select
              value={selectValue(filterState.status)}
              onValueChange={(v) =>
                updateParams({ status: fromSelectValue(v) })
              }
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="상태" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE}>전체 상태</SelectItem>
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={resetFilters}
              >
                필터 초기화
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toolbar: view toggle + result count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading
            ? "불러오는 중..."
            : `총 ${formatNumber(total)}개 항목`}
        </p>
        <div className="flex items-center gap-1 border rounded-lg p-0.5">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("table")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            className="h-7 px-2"
            onClick={() => setViewMode("card")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Results area */}
      {isLoading ? (
        <TableSkeleton />
      ) : items.length === 0 ? (
        <EmptyState hasFilters={hasActiveFilters} onReset={resetFilters} />
      ) : viewMode === "table" ? (
        <Card>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            canSort && "cursor-pointer select-none",
                          )}
                          style={{ width: header.getSize() }}
                          onClick={
                            canSort
                              ? header.column.getToggleSortingHandler()
                              : undefined
                          }
                        >
                          <div className="flex items-center gap-1">
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            {canSort &&
                              (sorted === "asc" ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : sorted === "desc" ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3 opacity-40" />
                              ))}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedItemId(row.original.id);
                      setDrawerOpen(true);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <CatalogCard
              key={item.id}
              item={item}
              onClick={() => {
                setSelectedItemId(item.id);
                setDrawerOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formatNumber(rangeStart)} ~ {formatNumber(rangeEnd)} /{" "}
            {formatNumber(total)}개 항목
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pageSize)}
              onValueChange={(v) =>
                updateParams({ limit: v, page: undefined })
              }
            >
              <SelectTrigger className="w-[80px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}개
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page <= 1}
                onClick={() =>
                  updateParams({ page: String(page - 1) }, false)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm px-2 min-w-[60px] text-center">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                disabled={page >= totalPages}
                onClick={() =>
                  updateParams({ page: String(page + 1) }, false)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Detail drawer */}
      <CatalogDetailDrawer
        itemId={selectedItemId}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedItemId(null);
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", color)}>{icon}</div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{formatNumber(value)}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card>
      <div className="p-4 space-y-3 animate-pulse">
        <div className="h-8 bg-muted rounded w-full" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/60 rounded w-full" />
        ))}
      </div>
    </Card>
  );
}

function EmptyState({
  hasFilters,
  onReset,
}: {
  hasFilters: boolean;
  onReset: () => void;
}) {
  return (
    <Card>
      <CardContent className="py-16 flex flex-col items-center gap-3">
        <Database className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          {hasFilters
            ? "필터 조건에 맞는 항목이 없습니다"
            : "등록된 카탈로그 항목이 없습니다"}
        </p>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={onReset}>
            필터 초기화
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
