"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  CheckCircle2,
  FileEdit,
  Building2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CATEGORY_LABELS,
  DELIVERY_TYPE_LABELS,
  DELIVERY_MODEL_LABELS,
  STATUS_LABELS,
  formatNumber,
} from "@/lib/utils";
import { KpiCard } from "@/components/charts/kpi-card";
import { ChartCard } from "@/components/charts/chart-card";
import { Heatmap } from "@/components/charts/heatmap";

type StatsData = {
  totalItems: number;
  productCount: number;
  technologyCount: number;
  serviceCount: number;
  publishedCount: number;
  draftCount: number;
  byIndustry: { name: string; count: number }[];
  byTechDomain: { name: string; count: number }[];
  byDeliveryType: { name: string; count: number }[];
  byDeliveryModel: { name: string; count: number }[];
  byOrganization: { name: string; count: number }[];
  byCategory: { name: string; count: number }[];
  heatmapDomainIndustry: {
    domain: string;
    industry: string;
    count: number;
  }[];
  heatmapDeliveryCategory: {
    delivery: string;
    category: string;
    count: number;
  }[];
};

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#6366f1",
  "#ec4899",
  "#14b8a6",
];

const CATEGORY_CHART_COLORS: Record<string, string> = {
  PRODUCT: "#3b82f6",
  TECHNOLOGY: "#8b5cf6",
  SERVICE: "#10b981",
};

const STATUS_CHART_COLORS: Record<string, string> = {
  PUBLISHED: "#10b981",
  DRAFT: "#f59e0b",
  ARCHIVED: "#94a3b8",
};

function SkeletonCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="h-8 w-16 rounded bg-muted" />
          <div className="h-2 w-32 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonChart({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-2 w-48 rounded bg-muted" />
          <div className="mt-4 h-[280px] rounded bg-muted/50" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VisualizationPage() {
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ["stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
  });

  if (isLoading || !stats) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonChart key={i} />
          ))}
        </div>
      </div>
    );
  }

  const categoryPieData = [
    {
      name: CATEGORY_LABELS.PRODUCT,
      value: stats.productCount,
      key: "PRODUCT",
    },
    {
      name: CATEGORY_LABELS.TECHNOLOGY,
      value: stats.technologyCount,
      key: "TECHNOLOGY",
    },
    {
      name: CATEGORY_LABELS.SERVICE,
      value: stats.serviceCount,
      key: "SERVICE",
    },
  ];

  const statusPieData = [
    {
      name: STATUS_LABELS.PUBLISHED,
      value: stats.publishedCount,
      key: "PUBLISHED",
    },
    { name: STATUS_LABELS.DRAFT, value: stats.draftCount, key: "DRAFT" },
    {
      name: STATUS_LABELS.ARCHIVED,
      value: Math.max(
        0,
        stats.totalItems - stats.publishedCount - stats.draftCount,
      ),
      key: "ARCHIVED",
    },
  ].filter((d) => d.value > 0);

  const industryData = stats.byIndustry
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ name: d.name, 항목수: d.count }));

  const techDomainData = stats.byTechDomain
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ name: d.name, 항목수: d.count }));

  const deliveryData = buildDeliveryChartData(stats);

  const orgData = stats.byOrganization
    .sort((a, b) => b.count - a.count)
    .map((d) => ({ name: d.name, 항목수: d.count }));

  const heatmapData = stats.heatmapDomainIndustry.map((d) => ({
    row: d.domain,
    col: d.industry,
    value: d.count,
  }));

  const total = stats.totalItems || 1;
  const ratioBar = [
    { label: "제품", pct: (stats.productCount / total) * 100, color: "bg-blue-500" },
    { label: "기술", pct: (stats.technologyCount / total) * 100, color: "bg-purple-500" },
    { label: "서비스", pct: (stats.serviceCount / total) * 100, color: "bg-emerald-500" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          시각화 대시보드
        </h1>
        <p className="text-sm text-muted-foreground">
          AX 카탈로그 현황을 한눈에 파악합니다
        </p>
      </div>

      <Separator />

      {/* KPI Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="전체 항목"
          value={formatNumber(stats.totalItems)}
          subtitle={ratioBar.map((r) => `${r.label} ${Math.round(r.pct)}%`).join(" · ")}
          icon={<LayoutDashboard className="h-5 w-5" />}
          color="bg-blue-500"
        />
        <KpiCard
          title="게시됨"
          value={formatNumber(stats.publishedCount)}
          subtitle={`전체의 ${Math.round((stats.publishedCount / total) * 100)}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          color="bg-emerald-500"
        />
        <KpiCard
          title="초안"
          value={formatNumber(stats.draftCount)}
          subtitle={`전체의 ${Math.round((stats.draftCount / total) * 100)}%`}
          icon={<FileEdit className="h-5 w-5" />}
          color="bg-yellow-500"
        />
        <KpiCard
          title="산업 분야"
          value={stats.byIndustry.length}
          subtitle="등록된 산업 분야 수"
          icon={<Building2 className="h-5 w-5" />}
          color="bg-indigo-500"
        />
      </div>

      {/* Ratio Bar under KPI */}
      <Card>
        <CardContent className="px-6 py-4">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            {ratioBar.map((r) => (
              <span key={r.label} className="flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${r.color}`} />
                {r.label} {formatNumber(
                  r.label === "제품"
                    ? stats.productCount
                    : r.label === "기술"
                      ? stats.technologyCount
                      : stats.serviceCount,
                )}
              </span>
            ))}
          </div>
          <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
            {ratioBar.map((r) => (
              <div
                key={r.label}
                className={`${r.color} transition-all`}
                style={{ width: `${r.pct}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chart Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Category Distribution - Donut */}
        <ChartCard
          title="카테고리별 분포"
          description="제품 · 기술 · 서비스 비율"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryPieData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {categoryPieData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={CATEGORY_CHART_COLORS[entry.key]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Industry Bar Chart - Horizontal */}
        <ChartCard title="산업별 항목 수" description="산업 분야별 등록 현황">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={industryData}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={100}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <Bar dataKey="항목수" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Chart Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tech Domain Bar Chart */}
        <ChartCard
          title="기술 도메인별 분포"
          description="기술 도메인 등록 현황"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={techDomainData}
              margin={{ left: 5, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <defs>
                <linearGradient id="techGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <Bar
                dataKey="항목수"
                fill="url(#techGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Delivery Type × Model */}
        <ChartCard
          title="딜리버리 유형 · 모델"
          description="유형별 딜리버리 모델 분포"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={deliveryData}
              margin={{ left: 5, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <Legend />
              <Bar
                dataKey={DELIVERY_MODEL_LABELS.PROJECT_BASED}
                stackId="a"
                fill="#3b82f6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey={DELIVERY_MODEL_LABELS.SUBSCRIPTION}
                stackId="a"
                fill="#8b5cf6"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey={DELIVERY_MODEL_LABELS.MANAGED}
                stackId="a"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Chart Row 3 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Organization Bar Chart - Horizontal */}
        <ChartCard
          title="소속 조직별 분포"
          description="조직별 등록 항목 현황"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={orgData}
              layout="vertical"
              margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="name"
                type="category"
                width={120}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <Bar dataKey="항목수" radius={[0, 4, 4, 0]}>
                {orgData.map((_, idx) => (
                  <Cell
                    key={idx}
                    fill={CHART_COLORS[idx % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Pie Chart */}
        <ChartCard
          title="게시 상태"
          description="항목 상태별 분포"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                outerRadius={110}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {statusPieData.map((entry) => (
                  <Cell
                    key={entry.key}
                    fill={STATUS_CHART_COLORS[entry.key]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [formatNumber(value), "항목"]}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Heatmap Section */}
      <ChartCard
        title="기술 도메인 × 산업 매트릭스"
        description="기술 도메인과 산업 분야 간 교차 분포를 확인합니다"
      >
        <Heatmap
          data={heatmapData}
          rowLabel="기술 도메인"
          colLabel="산업"
        />
      </ChartCard>
    </div>
  );
}

function buildDeliveryChartData(stats: StatsData) {
  const typeKeys = Object.keys(DELIVERY_TYPE_LABELS);
  const modelKeys = Object.keys(DELIVERY_MODEL_LABELS);

  const crossMap = new Map<string, number>();
  for (const item of stats.heatmapDeliveryCategory) {
    crossMap.set(`${item.delivery}__${item.category}`, item.count);
  }

  return typeKeys.map((tk) => {
    const row: Record<string, string | number> = {
      type: DELIVERY_TYPE_LABELS[tk],
    };
    for (const mk of modelKeys) {
      row[DELIVERY_MODEL_LABELS[mk]] = crossMap.get(`${tk}__${mk}`) ?? 0;
    }
    return row;
  });
}
