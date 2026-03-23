/**
 * 검색 결과를 통합하고 경쟁 분석을 수행
 */

import type { WebSearchResult } from "../sources/web-search.js";
import type { ProductHuntResult } from "../sources/product-hunt.js";
import type { GitHubResult } from "../sources/github-search.js";

export interface UnifiedProduct {
  name: string;
  description: string;
  url: string;
  source: "web" | "producthunt" | "github";
  popularity: number; // 정규화된 인기도 (0~100)
  extra?: {
    votes?: number;
    stars?: number;
    language?: string | null;
  };
}

export interface CompetitorAnalysis {
  products: UnifiedProduct[];
  totalFound: number;
  competitionLevel: "low" | "medium" | "high";
  competitionScore: number; // 1~5
  summary: string;
}

/**
 * 여러 소스의 검색 결과를 통합 제품 목록으로 변환
 */
export function unifyResults(
  webResults: WebSearchResult[],
  phResults: ProductHuntResult[],
  ghResults: GitHubResult[]
): UnifiedProduct[] {
  const products: UnifiedProduct[] = [];

  // Product Hunt 결과 (가장 관련성 높음)
  for (const r of phResults) {
    products.push({
      name: r.title,
      description: r.tagline,
      url: r.url,
      source: "producthunt",
      popularity: Math.min(100, Math.round(r.votesCount / 10)),
      extra: { votes: r.votesCount },
    });
  }

  // GitHub 결과
  for (const r of ghResults) {
    products.push({
      name: r.title,
      description: r.description,
      url: r.url,
      source: "github",
      popularity: Math.min(100, Math.round(r.stars / 50)),
      extra: { stars: r.stars, language: r.language },
    });
  }

  // 웹 검색 결과
  for (const r of webResults) {
    // 이미 PH나 GitHub에서 찾은 것과 중복이면 건너뜀
    const isDuplicate = products.some(
      (p) =>
        p.url === r.url ||
        p.name.toLowerCase() === r.title.toLowerCase()
    );
    if (!isDuplicate) {
      products.push({
        name: r.title,
        description: r.snippet,
        url: r.url,
        source: "web",
        popularity: 0, // 웹 결과는 인기도 알 수 없음
      });
    }
  }

  // 인기도 내림차순 정렬
  products.sort((a, b) => b.popularity - a.popularity);

  return products;
}

/**
 * 통합된 제품 목록을 기반으로 경쟁 분석 수행
 */
export function analyzeCompetition(
  products: UnifiedProduct[],
  idea: string
): CompetitorAnalysis {
  const totalFound = products.length;

  // 경쟁 강도 산정
  let competitionScore: number;
  if (totalFound === 0) {
    competitionScore = 1;
  } else if (totalFound <= 2) {
    competitionScore = 2;
  } else if (totalFound <= 5) {
    competitionScore = 3;
  } else if (totalFound <= 10) {
    competitionScore = 4;
  } else {
    competitionScore = 5;
  }

  // 인기 제품이 있으면 경쟁 강도 상향
  const hasPopularProduct = products.some((p) => p.popularity >= 50);
  if (hasPopularProduct && competitionScore < 5) {
    competitionScore += 1;
  }

  const competitionLevel: "low" | "medium" | "high" =
    competitionScore <= 2 ? "low" : competitionScore <= 3 ? "medium" : "high";

  // 요약 생성
  const summary = generateSummary(
    products,
    totalFound,
    competitionLevel,
    idea
  );

  return {
    products: products.slice(0, 10), // 상위 10개만
    totalFound,
    competitionLevel,
    competitionScore,
    summary,
  };
}

function generateSummary(
  products: UnifiedProduct[],
  totalFound: number,
  level: "low" | "medium" | "high",
  idea: string
): string {
  if (totalFound === 0) {
    return `"${idea}"와 유사한 제품을 찾지 못했습니다. 블루오션일 수 있지만, 수요가 있는지 추가 검증이 필요합니다.`;
  }

  const phCount = products.filter((p) => p.source === "producthunt").length;
  const ghCount = products.filter((p) => p.source === "github").length;

  const parts: string[] = [];
  parts.push(`유사 제품 ${totalFound}개 발견.`);

  if (level === "high") {
    parts.push("경쟁이 치열한 분야입니다. 명확한 차별화가 필수입니다.");
  } else if (level === "medium") {
    parts.push("적당한 경쟁이 있습니다. 틈새를 공략하면 기회가 있습니다.");
  } else {
    parts.push("경쟁이 적은 분야입니다. 선점 기회가 있습니다.");
  }

  if (phCount > 0) {
    parts.push(`Product Hunt에 ${phCount}개 등록된 제품이 있습니다.`);
  }
  if (ghCount > 0) {
    parts.push(`GitHub에 ${ghCount}개 오픈소스 프로젝트가 있습니다.`);
  }

  return parts.join(" ");
}
