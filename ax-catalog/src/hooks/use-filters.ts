"use client";

import { useQuery } from "@tanstack/react-query";

type FilterOption = {
  id: string;
  name: string;
};

type FiltersData = {
  industries: FilterOption[];
  organizations: FilterOption[];
  techDomains: string[];
  techCategories: string[];
  techAssets: string[];
};

async function fetchFilters(): Promise<FiltersData> {
  const res = await fetch("/api/filters");
  if (!res.ok) throw new Error("필터 옵션을 불러오지 못했습니다");
  return res.json();
}

export function useFilters() {
  const { data, isLoading } = useQuery({
    queryKey: ["filters"],
    queryFn: fetchFilters,
    staleTime: 5 * 60 * 1000,
  });

  return {
    industries: data?.industries ?? [],
    organizations: data?.organizations ?? [],
    techDomains: data?.techDomains ?? [],
    techCategories: data?.techCategories ?? [],
    techAssets: data?.techAssets ?? [],
    isLoading,
  };
}
