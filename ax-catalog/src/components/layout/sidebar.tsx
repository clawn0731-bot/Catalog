"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  BarChart3,
  Search,
  PlusCircle,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  {
    label: "카탈로그 입력",
    labelEn: "Input",
    href: "/input",
    icon: PlusCircle,
  },
  {
    label: "데이터 통합",
    labelEn: "Data Integration",
    href: "/data",
    icon: Database,
  },
  {
    label: "시각화",
    labelEn: "Visualization",
    href: "/visualization",
    icon: BarChart3,
  },
  {
    label: "검색 · 추천",
    labelEn: "User Workspace",
    href: "/user",
    icon: Search,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-border h-screen sticky top-0">
      <div className="flex items-center gap-3 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight">AX Catalog</h1>
          <p className="text-[10px] text-muted-foreground">Management System</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Workspaces
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="leading-tight">{item.label}</span>
                <span className="text-[10px] opacity-60">{item.labelEn}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <Separator />
      <div className="p-3">
        <Link
          href="/input"
          className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>설정</span>
        </Link>
      </div>
    </aside>
  );
}
