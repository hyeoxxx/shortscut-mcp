import { describe, it, expect } from "vitest";
import {
  formatSearchResults,
  formatTechStackResult,
} from "../formatter.js";
import type { UnifiedProduct } from "../../analysis/competitor-analyze.js";
import type { DifferentiationSuggestion } from "../../analysis/differentiation.js";

describe("formatSearchResults", () => {
  const phProduct: UnifiedProduct = {
    name: "InvoiceBot",
    description: "AI invoicing",
    url: "https://ph.com/invoicebot",
    source: "producthunt",
    popularity: 50,
    extra: { votes: 500 },
  };

  const ghProduct: UnifiedProduct = {
    name: "invoice-ninja",
    description: "Open source invoicing",
    url: "https://github.com/invoice-ninja",
    source: "github",
    popularity: 80,
    extra: { stars: 4000, language: "PHP" },
  };

  const webProduct: UnifiedProduct = {
    name: "FreshBooks",
    description: "Cloud invoicing",
    url: "https://freshbooks.com",
    source: "web",
    popularity: 0,
  };

  it("헤더에 발견 개수와 경쟁 점수를 표시한다", () => {
    const result = formatSearchResults([phProduct], 1, 2, "요약 메시지");
    expect(result).toContain("1개 발견");
    expect(result).toContain("★★☆☆☆");
  });

  it("Product Hunt 제품을 그룹으로 표시한다", () => {
    const result = formatSearchResults([phProduct], 1, 2, "요약");
    expect(result).toContain("Product Hunt");
    expect(result).toContain("InvoiceBot");
    expect(result).toContain("▲ 500");
  });

  it("GitHub 제품을 그룹으로 표시한다", () => {
    const result = formatSearchResults([ghProduct], 1, 3, "요약");
    expect(result).toContain("GitHub");
    expect(result).toContain("invoice-ninja");
    expect(result).toContain("⭐ 4000");
    expect(result).toContain("PHP");
  });

  it("웹 검색 제품을 그룹으로 표시한다", () => {
    const result = formatSearchResults([webProduct], 1, 1, "요약");
    expect(result).toContain("웹 검색");
    expect(result).toContain("FreshBooks");
  });

  it("제품이 없으면 '찾지 못했습니다' 메시지를 표시한다", () => {
    const result = formatSearchResults([], 0, 1, "요약");
    expect(result).toContain("찾지 못했습니다");
  });

  it("차별화 갭을 표시한다", () => {
    const gaps: DifferentiationSuggestion[] = [
      {
        area: "한국 시장 특화",
        opportunity: "한국어 UI 필요",
        competitionInArea: "low",
      },
    ];
    const result = formatSearchResults([phProduct], 1, 2, "요약", gaps);
    expect(result).toContain("차별화 가능 영역");
    expect(result).toContain("한국 시장 특화");
    expect(result).toContain("🟢 낮음");
  });

  it("경쟁 강도 medium을 표시한다", () => {
    const gaps: DifferentiationSuggestion[] = [
      {
        area: "API 연동",
        opportunity: "연동 필요",
        competitionInArea: "medium",
      },
    ];
    const result = formatSearchResults([phProduct], 1, 3, "요약", gaps);
    expect(result).toContain("🟡 중간");
  });

  it("요약 메시지를 포함한다", () => {
    const result = formatSearchResults([], 0, 1, "블루오션입니다");
    expect(result).toContain("블루오션입니다");
  });
});

describe("formatTechStackResult", () => {
  it("추천 스택을 표시한다", () => {
    const recommended = [
      { stack: "Next.js", reason: "풀스택 프레임워크" },
      { stack: "Supabase", reason: "인증 + DB" },
    ];
    const result = formatTechStackResult(recommended, [], []);
    expect(result).toContain("Next.js");
    expect(result).toContain("Supabase");
    expect(result).toContain("풀스택 프레임워크");
  });

  it("감지된 스택을 표시한다", () => {
    const result = formatTechStackResult([], ["React", "TypeScript"], []);
    expect(result).toContain("React");
    expect(result).toContain("TypeScript");
    expect(result).toContain("감지된 스택");
  });

  it("감지된 AI 도구를 표시한다", () => {
    const result = formatTechStackResult([], [], ["Cursor", "Claude Code"]);
    expect(result).toContain("Cursor");
    expect(result).toContain("Claude Code");
    expect(result).toContain("AI 도구");
  });

  it("감지된 것이 없으면 해당 섹션을 생략한다", () => {
    const result = formatTechStackResult(
      [{ stack: "Next.js", reason: "추천" }],
      [],
      []
    );
    expect(result).not.toContain("감지된 스택");
    expect(result).not.toContain("AI 도구");
  });
});
