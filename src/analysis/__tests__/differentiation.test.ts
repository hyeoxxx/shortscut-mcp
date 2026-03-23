import { describe, it, expect } from "vitest";
import { analyzeDifferentiation } from "../differentiation.js";
import type { UnifiedProduct } from "../competitor-analyze.js";

function makeProduct(overrides: Partial<UnifiedProduct> = {}): UnifiedProduct {
  return {
    name: "TestProduct",
    description: "A web-based English SaaS tool",
    url: "https://example.com",
    source: "web",
    popularity: 10,
    ...overrides,
  };
}

describe("analyzeDifferentiation", () => {
  describe("commonTraits 추출", () => {
    it("영어 서비스 중심 특성을 감지한다", () => {
      const products = [
        makeProduct({ description: "English SaaS management tool" }),
        makeProduct({ description: "Another english productivity app" }),
      ];
      const result = analyzeDifferentiation(products, "test", null);
      expect(result.commonTraits).toContain("대부분 영어 서비스 중심");
    });

    it("오픈소스 다수 존재를 감지한다", () => {
      const products = [
        makeProduct({ source: "github" }),
        makeProduct({ source: "github" }),
        makeProduct({ source: "web" }),
      ];
      const result = analyzeDifferentiation(products, "test", null);
      expect(result.commonTraits).toContain("오픈소스 솔루션이 다수 존재");
    });

    it("제품이 없으면 패턴 미형성 메시지를 반환한다", () => {
      const result = analyzeDifferentiation([], "test", null);
      expect(result.commonTraits).toContain(
        "아직 뚜렷한 시장 패턴이 형성되지 않음"
      );
    });
  });

  describe("gaps 분석", () => {
    it("한국 시장 갭을 감지한다", () => {
      const products = [makeProduct({ description: "English only tool" })];
      const result = analyzeDifferentiation(products, "test", null);
      const koreanGap = result.gaps.find((g) => g.area === "한국 시장 특화");
      expect(koreanGap).toBeDefined();
      expect(koreanGap!.competitionInArea).toBe("low");
    });

    it("한국어 제품이 있으면 한국 시장 갭을 제외한다", () => {
      const products = [
        makeProduct({ description: "한국어 서비스입니다" }),
      ];
      const result = analyzeDifferentiation(products, "test", null);
      const koreanGap = result.gaps.find((g) => g.area === "한국 시장 특화");
      expect(koreanGap).toBeUndefined();
    });

    it("모바일 앱 갭을 감지한다", () => {
      const products = [makeProduct({ description: "web dashboard tool" })];
      const result = analyzeDifferentiation(products, "test", null);
      const mobileGap = result.gaps.find((g) => g.area === "모바일 앱");
      expect(mobileGap).toBeDefined();
    });

    it("모바일 제품이 있으면 모바일 갭을 제외한다", () => {
      const products = [
        makeProduct({ description: "mobile ios android app" }),
      ];
      const result = analyzeDifferentiation(products, "test", null);
      const mobileGap = result.gaps.find((g) => g.area === "모바일 앱");
      expect(mobileGap).toBeUndefined();
    });

    it("브라우저 확장 갭을 감지한다", () => {
      const products = [makeProduct({ description: "web app" })];
      const result = analyzeDifferentiation(products, "test", null);
      const extGap = result.gaps.find(
        (g) => g.area === "브라우저 확장 프로그램"
      );
      expect(extGap).toBeDefined();
    });

    it("항상 니치 타겟 갭을 포함한다", () => {
      const products = [makeProduct()];
      const result = analyzeDifferentiation(products, "test", null);
      const nicheGap = result.gaps.find(
        (g) => g.area === "특정 직군/니치 타겟"
      );
      expect(nicheGap).toBeDefined();
    });
  });

  describe("추천 전략", () => {
    it("경쟁 제품이 없으면 수요 검증을 권장한다", () => {
      const result = analyzeDifferentiation([], "test idea", null);
      expect(result.recommendedStrategy).toContain("수요 검증");
    });

    it("low 경쟁 갭이 있으면 해당 영역을 추천한다", () => {
      const products = [makeProduct({ description: "English web tool" })];
      const result = analyzeDifferentiation(products, "test", null);
      expect(result.recommendedStrategy).toContain("영역");
    });

    it("전략 메시지가 항상 존재한다", () => {
      const products = [makeProduct()];
      const result = analyzeDifferentiation(products, "test", null);
      expect(result.recommendedStrategy).toBeTruthy();
      expect(result.recommendedStrategy.length).toBeGreaterThan(0);
    });
  });
});
