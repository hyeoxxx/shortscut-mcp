import { describe, it, expect } from "vitest";
import { unifyResults, analyzeCompetition } from "../competitor-analyze.js";
import type { WebSearchResult } from "../../sources/web-search.js";
import type { ProductHuntResult } from "../../sources/product-hunt.js";
import type { GitHubResult } from "../../sources/github-search.js";

const mockPH: ProductHuntResult[] = [
  {
    title: "InvoiceBot",
    tagline: "AI invoice generation",
    url: "https://producthunt.com/posts/invoicebot",
    votesCount: 500,
    source: "producthunt",
  },
];

const mockGH: GitHubResult[] = [
  {
    title: "invoice-ninja/invoiceninja",
    description: "Open source invoicing",
    url: "https://github.com/invoiceninja/invoiceninja",
    stars: 8200,
    language: "PHP",
    source: "github",
  },
];

const mockWeb: WebSearchResult[] = [
  {
    title: "FreshBooks",
    url: "https://freshbooks.com",
    snippet: "Cloud accounting and invoicing",
    source: "web",
  },
  {
    // 중복 - PH와 같은 URL
    title: "InvoiceBot",
    url: "https://producthunt.com/posts/invoicebot",
    snippet: "Same product from web",
    source: "web",
  },
];

describe("unifyResults", () => {
  it("여러 소스의 결과를 통합한다", () => {
    const products = unifyResults(mockWeb, mockPH, mockGH);
    expect(products.length).toBeGreaterThanOrEqual(2);
  });

  it("URL 기반으로 중복을 제거한다", () => {
    const products = unifyResults(mockWeb, mockPH, mockGH);
    const urls = products.map((p) => p.url);
    const uniqueUrls = new Set(urls);
    expect(urls.length).toBe(uniqueUrls.size);
  });

  it("인기도 내림차순으로 정렬한다", () => {
    const products = unifyResults(mockWeb, mockPH, mockGH);
    for (let i = 0; i < products.length - 1; i++) {
      expect(products[i].popularity).toBeGreaterThanOrEqual(
        products[i + 1].popularity
      );
    }
  });

  it("Product Hunt 결과의 popularity를 votesCount 기반으로 계산한다", () => {
    const products = unifyResults([], mockPH, []);
    expect(products[0].popularity).toBe(Math.min(100, Math.round(500 / 10)));
    expect(products[0].extra?.votes).toBe(500);
  });

  it("GitHub 결과의 popularity를 stars 기반으로 계산한다", () => {
    const products = unifyResults([], [], mockGH);
    expect(products[0].popularity).toBe(Math.min(100, Math.round(8200 / 50)));
    expect(products[0].extra?.stars).toBe(8200);
    expect(products[0].extra?.language).toBe("PHP");
  });

  it("웹 결과의 popularity는 0이다", () => {
    const products = unifyResults(mockWeb, [], []);
    for (const p of products) {
      expect(p.popularity).toBe(0);
    }
  });

  it("모든 소스가 빈 경우 빈 배열을 반환한다", () => {
    const products = unifyResults([], [], []);
    expect(products).toEqual([]);
  });
});

describe("analyzeCompetition", () => {
  it("제품이 없으면 경쟁 점수 1을 반환한다", () => {
    const result = analyzeCompetition([], "test idea");
    expect(result.competitionScore).toBe(1);
    expect(result.competitionLevel).toBe("low");
    expect(result.totalFound).toBe(0);
  });

  it("제품 2개 이하 + 인기 제품이 있으면 경쟁 점수 3을 반환한다", () => {
    // mockPH: votesCount 500 → popularity 50 (≥50이므로 +1)
    // 1개 → score 2, 인기 제품 보정 +1 = 3
    const products = unifyResults([], mockPH, []);
    const result = analyzeCompetition(products, "test idea");
    expect(result.competitionScore).toBe(3);
    expect(result.competitionLevel).toBe("medium");
  });

  it("인기 제품이 있으면 경쟁 점수를 1 올린다", () => {
    // stars 8200 → popularity 100 (>= 50)
    const products = unifyResults([], [], mockGH);
    const result = analyzeCompetition(products, "test idea");
    // 1개 → score 2, 인기 제품 있으므로 +1 = 3
    expect(result.competitionScore).toBe(3);
  });

  it("결과를 최대 10개로 제한한다", () => {
    const manyWeb: WebSearchResult[] = Array.from({ length: 15 }, (_, i) => ({
      title: `Product ${i}`,
      url: `https://example.com/${i}`,
      snippet: `Description ${i}`,
      source: "web" as const,
    }));
    const products = unifyResults(manyWeb, [], []);
    const result = analyzeCompetition(products, "test idea");
    expect(result.products.length).toBeLessThanOrEqual(10);
    expect(result.totalFound).toBe(15);
  });

  it("경쟁 레벨을 올바르게 분류한다", () => {
    // score 4+ → high
    const manyProducts = Array.from({ length: 8 }, (_, i) => ({
      name: `Product ${i}`,
      description: "desc",
      url: `https://example.com/${i}`,
      source: "web" as const,
      popularity: 0,
    }));
    const result = analyzeCompetition(manyProducts, "test idea");
    expect(result.competitionLevel).toBe("high");
  });

  it("요약 메시지를 생성한다", () => {
    const products = unifyResults(mockWeb, mockPH, mockGH);
    const result = analyzeCompetition(products, "AI invoice");
    expect(result.summary).toBeTruthy();
    expect(result.summary.length).toBeGreaterThan(0);
  });
});
