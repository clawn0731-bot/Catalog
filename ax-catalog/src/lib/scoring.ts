/**
 * Simple rule-based scoring for the User Workspace recommendation engine.
 * Scores are 0–100. Higher = better match to the search criteria.
 *
 * Scoring weights (tunable):
 *   Industry match     → 30 pts
 *   Tech Domain match  → 25 pts
 *   Delivery Type      → 15 pts
 *   Delivery Model     → 15 pts
 *   Text relevance     → 15 pts
 */

export type SearchCriteria = {
  industry?: string;
  techDomain?: string;
  deliveryType?: string;
  deliveryModel?: string;
  category?: string;
  query?: string;
};

export type ScoredItem = {
  id: string;
  score: number;
  matchReasons: string[];
};

type CatalogForScoring = {
  id: string;
  category: string;
  name: string;
  valueProposition: string;
  keyFeatures: string;
  differentiation: string;
  deliveryType: string;
  deliveryModel: string;
  targetIndustry: { name: string };
  techStacks: { techDomain: string; techCategory: string; techAsset: string }[];
};

export function scoreCatalogItems(
  items: CatalogForScoring[],
  criteria: SearchCriteria
): ScoredItem[] {
  return items
    .map((item) => {
      let score = 0;
      const reasons: string[] = [];

      if (criteria.industry && item.targetIndustry.name === criteria.industry) {
        score += 30;
        reasons.push("산업 일치");
      }

      if (
        criteria.techDomain &&
        item.techStacks.some((ts) => ts.techDomain === criteria.techDomain)
      ) {
        score += 25;
        reasons.push("기술 도메인 일치");
      }

      if (criteria.deliveryType && item.deliveryType === criteria.deliveryType) {
        score += 15;
        reasons.push("딜리버리 유형 일치");
      }

      if (criteria.deliveryModel && item.deliveryModel === criteria.deliveryModel) {
        score += 15;
        reasons.push("딜리버리 모델 일치");
      }

      if (criteria.category && item.category === criteria.category) {
        score += 5;
      }

      if (criteria.query) {
        const q = criteria.query.toLowerCase();
        const searchable = [
          item.name,
          item.valueProposition,
          item.keyFeatures,
          item.differentiation,
        ]
          .join(" ")
          .toLowerCase();
        if (searchable.includes(q)) {
          score += 15;
          reasons.push("키워드 매칭");
        }
      }

      // Boost published items slightly
      return { id: item.id, score, matchReasons: reasons };
    })
    .sort((a, b) => b.score - a.score);
}
