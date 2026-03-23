/**
 * 기존 제품 분석을 바탕으로 차별화 포인트를 제안
 */

import type { UnifiedProduct } from "./competitor-analyze.js";

export interface DifferentiationSuggestion {
  area: string;
  opportunity: string;
  competitionInArea: "low" | "medium" | "high";
}

export interface DifferentiationAnalysis {
  commonTraits: string[];
  gaps: DifferentiationSuggestion[];
  recommendedStrategy: string;
}

/**
 * 차별화 전략 분석 — 규칙 기반
 *
 * 기존 제품들의 패턴을 분석하여 비어있는 틈새를 찾음
 */
export function analyzeDifferentiation(
  products: UnifiedProduct[],
  idea: string,
  category: string | null
): DifferentiationAnalysis {
  // 기존 제품들의 공통 특성 추출
  const commonTraits = extractCommonTraits(products);

  // 일반적인 차별화 갭 + 카테고리별 갭
  const gaps = findGaps(products, idea, category);

  // 추천 전략
  const recommendedStrategy = generateStrategy(gaps, products.length);

  return {
    commonTraits,
    gaps,
    recommendedStrategy,
  };
}

function extractCommonTraits(products: UnifiedProduct[]): string[] {
  const traits: string[] = [];

  // 언어/지역 분석
  const descriptions = products.map((p) => p.description.toLowerCase()).join(" ");

  const hasKorean = /[가-힣]/.test(descriptions);
  const hasEnglish = /[a-z]{3,}/.test(descriptions);

  if (hasEnglish && !hasKorean) {
    traits.push("대부분 영어 서비스 중심");
  }

  // 플랫폼 분석
  if (descriptions.includes("web") || descriptions.includes("app")) {
    traits.push("웹앱 형태가 주류");
  }

  // 가격 모델
  if (
    descriptions.includes("free") ||
    descriptions.includes("freemium") ||
    descriptions.includes("무료")
  ) {
    traits.push("프리미엄 모델이 일반적");
  }

  // GitHub 프로젝트가 많으면
  const ghCount = products.filter((p) => p.source === "github").length;
  if (ghCount > products.length / 2) {
    traits.push("오픈소스 솔루션이 다수 존재");
  }

  if (traits.length === 0) {
    traits.push("아직 뚜렷한 시장 패턴이 형성되지 않음");
  }

  return traits;
}

function findGaps(
  products: UnifiedProduct[],
  idea: string,
  category: string | null
): DifferentiationSuggestion[] {
  const gaps: DifferentiationSuggestion[] = [];
  const descriptions = products.map((p) => p.description.toLowerCase()).join(" ");

  // 1. 한국어/한국 시장 특화
  const hasKoreanProduct = products.some(
    (p) => /[가-힣]/.test(p.description) || p.description.includes("korea")
  );
  if (!hasKoreanProduct) {
    gaps.push({
      area: "한국 시장 특화",
      opportunity: "기존 서비스가 영어 중심 — 한국어 UI, 한국 결제 연동, 한국 사용자 맞춤",
      competitionInArea: "low",
    });
  }

  // 2. 모바일 앱
  const hasMobile =
    descriptions.includes("mobile") ||
    descriptions.includes("ios") ||
    descriptions.includes("android");
  if (!hasMobile) {
    gaps.push({
      area: "모바일 앱",
      opportunity: "대부분 웹 기반 — 네이티브 모바일 앱으로 차별화 가능",
      competitionInArea: "low",
    });
  }

  // 3. 브라우저 확장
  const hasExtension =
    descriptions.includes("extension") ||
    descriptions.includes("확장") ||
    descriptions.includes("chrome");
  if (!hasExtension) {
    gaps.push({
      area: "브라우저 확장 프로그램",
      opportunity: "별도 앱이 아닌 브라우저 확장으로 접근성을 높일 수 있음",
      competitionInArea: "low",
    });
  }

  // 4. 가격 전략
  const hasFree =
    descriptions.includes("free") || descriptions.includes("무료");
  if (!hasFree) {
    gaps.push({
      area: "무료/저가 전략",
      opportunity: "기존 제품이 유료 중심이면 무료 티어로 진입 가능",
      competitionInArea: "medium",
    });
  }

  // 5. 특정 직군 타겟
  gaps.push({
    area: "특정 직군/니치 타겟",
    opportunity:
      "범용 도구가 많으면, 특정 직군(프리랜서, 스타트업, 크리에이터 등)에 특화하여 차별화",
    competitionInArea: "low",
  });

  // 6. API/연동
  const hasApi =
    descriptions.includes("api") || descriptions.includes("integrat");
  if (!hasApi) {
    gaps.push({
      area: "API 및 외부 서비스 연동",
      opportunity: "Zapier, Slack, 노션 등과 연동하여 기존 워크플로우에 끼워넣기",
      competitionInArea: "medium",
    });
  }

  return gaps;
}

function generateStrategy(
  gaps: DifferentiationSuggestion[],
  competitorCount: number
): string {
  const lowCompGaps = gaps.filter((g) => g.competitionInArea === "low");

  if (competitorCount === 0) {
    return "경쟁 제품이 발견되지 않았습니다. 시장이 존재하는지 수요 검증을 먼저 진행하세요. 소규모 MVP로 빠르게 테스트하는 것을 추천합니다.";
  }

  if (lowCompGaps.length > 0) {
    const topGap = lowCompGaps[0];
    return `"${topGap.area}" 영역이 가장 경쟁이 적습니다. ${topGap.opportunity}. 이 방향으로 MVP를 빠르게 만들어보세요.`;
  }

  return "경쟁이 전반적으로 있는 분야입니다. 기존 제품의 약점(UX, 가격, 속도)을 파고들거나, 매우 좁은 니치를 타겟하세요.";
}
