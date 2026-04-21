"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "bg-blue-500",
}: KpiCardProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between p-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className="text-xs font-medium text-emerald-600">{trend}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
            color,
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}
