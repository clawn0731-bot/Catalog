import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("ko-KR").format(n);
}

export const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "제품",
  TECHNOLOGY: "기술",
  SERVICE: "서비스",
};

export const DELIVERY_TYPE_LABELS: Record<string, string> = {
  SAAS: "SaaS",
  BUILD: "Build",
  HYBRID: "Hybrid",
};

export const DELIVERY_MODEL_LABELS: Record<string, string> = {
  PROJECT_BASED: "프로젝트 기반",
  SUBSCRIPTION: "구독형",
  MANAGED: "매니지드",
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: "초안",
  PUBLISHED: "게시됨",
  ARCHIVED: "보관됨",
};

export const CATEGORY_COLORS: Record<string, string> = {
  PRODUCT: "bg-blue-100 text-blue-800",
  TECHNOLOGY: "bg-purple-100 text-purple-800",
  SERVICE: "bg-emerald-100 text-emerald-800",
};
