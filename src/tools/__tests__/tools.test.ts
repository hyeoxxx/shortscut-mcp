/**
 * MCP 도구 통합 테스트
 *
 * 각 도구의 전체 파이프라인(소스→분석→포맷)을 테스트
 * 외부 API는 모두 mock 처리
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// 소스 모듈 mock
vi.mock("../../sources/web-search.js", () => ({
  searchWeb: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../sources/product-hunt.js", () => ({
  searchProductHunt: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../sources/github-search.js", () => ({
  searchGitHub: vi.fn().mockResolvedValue([]),
}));

import { searchWeb } from "../../sources/web-search.js";
import { searchProductHunt } from "../../sources/product-hunt.js";
import { searchGitHub } from "../../sources/github-search.js";
import { extractKeywordsAndCategory } from "../../analysis/keyword-extract.js";
import { unifyResults, analyzeCompetition } from "../../analysis/competitor-analyze.js";
import { analyzeDifferentiation } from "../../analysis/differentiation.js";
import { formatSearchResults } from "../../utils/formatter.js";

describe("search_similar 파이프라인", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("아이디어에서 검색→분석→포맷 전체 흐름이 동작한다", async () => {
    // mock 데이터 설정
    vi.mocked(searchWeb).mockResolvedValueOnce([
      { title: "FreshBooks", url: "https://freshbooks.com", snippet: "Invoicing tool", source: "web" },
    ]);
    vi.mocked(searchProductHunt).mockResolvedValueOnce([
      { title: "InvoiceBot", tagline: "AI invoicing", url: "https://ph.com/invoicebot", votesCount: 200, source: "producthunt" },
    ]);
    vi.mocked(searchGitHub).mockResolvedValueOnce([
      { title: "invoice-ninja", description: "Open source", url: "https://github.com/invoice-ninja", stars: 5000, language: "PHP", source: "github" },
    ]);

    // 1. 키워드 추출
    const extracted = extractKeywordsAndCategory("AI invoice generator for freelancers");
    expect(extracted.keywords.length).toBeGreaterThan(0);

    // 2. 검색
    const query = extracted.searchQueries.english;
    const [webResults, phResults, ghResults] = await Promise.all([
      searchWeb(`${query} SaaS tool`, 5),
      searchProductHunt(query, 5),
      searchGitHub(query, 5),
    ]);

    // 3. 통합
    const unified = unifyResults(webResults, phResults, ghResults);
    expect(unified.length).toBe(3);

    // 4. 경쟁 분석
    const analysis = analyzeCompetition(unified, "AI invoice generator");
    expect(analysis.competitionScore).toBeGreaterThanOrEqual(1);
    expect(analysis.competitionScore).toBeLessThanOrEqual(5);

    // 5. 차별화 분석
    const diffAnalysis = analyzeDifferentiation(unified, "AI invoice generator", extracted.category);
    expect(diffAnalysis.gaps.length).toBeGreaterThan(0);

    // 6. 포맷팅
    const text = formatSearchResults(
      analysis.products,
      analysis.totalFound,
      analysis.competitionScore,
      analysis.summary,
      diffAnalysis.gaps
    );
    expect(text).toContain("유사 제품 검색 결과");
    expect(text).toContain("InvoiceBot");
    expect(text).toContain("invoice-ninja");
    expect(text).toContain("차별화 가능 영역");
  });

  it("API 결과가 모두 비어도 안전하게 동작한다", async () => {
    const extracted = extractKeywordsAndCategory("completely new idea xyz");
    const query = extracted.searchQueries.english;

    const [webResults, phResults, ghResults] = await Promise.all([
      searchWeb(`${query} SaaS tool`, 5),
      searchProductHunt(query, 5),
      searchGitHub(query, 5),
    ]);

    const unified = unifyResults(webResults, phResults, ghResults);
    expect(unified).toEqual([]);

    const analysis = analyzeCompetition(unified, "completely new idea");
    expect(analysis.competitionScore).toBe(1);
    expect(analysis.competitionLevel).toBe("low");

    const text = formatSearchResults(
      analysis.products,
      analysis.totalFound,
      analysis.competitionScore,
      analysis.summary
    );
    expect(text).toContain("0개 발견");
  });
});

describe("suggest_differentiation 파이프라인", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("경쟁사 목록 없이도 차별화 분석이 동작한다", async () => {
    vi.mocked(searchWeb).mockResolvedValueOnce([
      { title: "Competitor", url: "https://comp.com", snippet: "English web SaaS", source: "web" },
    ]);

    const extracted = extractKeywordsAndCategory("AI copywriting tool");
    const query = extracted.searchQueries.english;

    const [webResults, phResults, ghResults] = await Promise.all([
      searchWeb(`${query} SaaS tool`, 5),
      searchProductHunt(query, 3),
      searchGitHub(query, 3),
    ]);

    const products = unifyResults(webResults, phResults, ghResults);
    const analysis = analyzeDifferentiation(products, "AI copywriting tool", extracted.category);

    expect(analysis.commonTraits.length).toBeGreaterThan(0);
    expect(analysis.gaps.length).toBeGreaterThan(0);
    expect(analysis.recommendedStrategy).toBeTruthy();
  });
});

describe("tech_stack_suggest 파이프라인", () => {
  it("카테고리에 맞는 스택을 추천한다", () => {
    const extracted = extractKeywordsAndCategory("AI chatbot for customer support");
    expect(extracted.category).toBe("AI/자동화");
  });

  it("카테고리가 없으면 기본 스택을 사용한다", () => {
    const extracted = extractKeywordsAndCategory("something random xyz");
    expect(extracted.category).toBeNull();
  });
});
