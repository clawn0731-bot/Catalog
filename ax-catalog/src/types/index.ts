/**
 * Application-level types.
 * These mirror the Prisma schema but don't import generated types directly,
 * so the app can build before `prisma generate` runs.
 */

export type Industry = {
  id: string;
  name: string;
};

export type Organization = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string | null;
};

export type TechStackEntry = {
  id: string;
  techDomain: string;
  techCategory: string;
  techAsset: string;
  catalogItemId: string;
};

export type UseCase = {
  id: string;
  customerName: string;
  projectName: string;
  projectOverview: string;
  projectSize: number | null;
  duration: string | null;
  industryId: string;
  catalogItemId: string;
  industry: Industry;
};

export type CatalogItem = {
  id: string;
  category: string;
  name: string;
  valueProposition: string;
  keyFeatures: string;
  differentiation: string;
  deliveryType: string;
  deliveryModel: string;
  status: string;
  targetIndustryId: string;
  owningOrgId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
};

export type CatalogItemWithRelations = CatalogItem & {
  targetIndustry: Industry;
  owningOrg: Organization;
  author: User;
  useCases: UseCase[];
  techStacks: TechStackEntry[];
  favorites: { id: string; userId: string; catalogItemId: string }[];
};

export type CatalogItemListItem = CatalogItem & {
  targetIndustry: Industry;
  owningOrg: Organization;
  techStacks: TechStackEntry[];
  _count: { useCases: number; favorites: number };
};

export type FilterState = {
  category?: string;
  industry?: string;
  techDomain?: string;
  techCategory?: string;
  techAsset?: string;
  deliveryType?: string;
  deliveryModel?: string;
  organization?: string;
  status?: string;
  search?: string;
};

export type StatsData = {
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
  heatmapDomainIndustry: { domain: string; industry: string; count: number }[];
  heatmapDeliveryCategory: { delivery: string; category: string; count: number }[];
};
