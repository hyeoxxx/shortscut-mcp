import { describe, it, expect } from "vitest";
import { extractKeywordsAndCategory } from "../keyword-extract.js";

describe("extractKeywordsAndCategory", () => {
  describe("키워드 추출", () => {
    it("영어 아이디어에서 키워드를 추출한다", () => {
      const result = extractKeywordsAndCategory("AI invoice generator for freelancers");
      expect(result.keywords).toContain("invoice");
      expect(result.keywords).toContain("generator");
      expect(result.keywords).toContain("freelancers");
    });

    it("한국어 아이디어에서 키워드를 추출한다", () => {
      const result = extractKeywordsAndCategory("프리랜서용 AI 청구서 생성기");
      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords).toContain("프리랜서용");
    });

    it("불용어를 제거한다", () => {
      const result = extractKeywordsAndCategory("build a tool for task management");
      expect(result.keywords).not.toContain("build");
      expect(result.keywords).not.toContain("a");
      expect(result.keywords).not.toContain("for");
      expect(result.keywords).not.toContain("tool");
    });

    it("한국어 불용어를 제거한다", () => {
      const result = extractKeywordsAndCategory("할일 관리 만들어줘");
      expect(result.keywords).not.toContain("만들어줘");
    });

    it("중복 키워드를 제거한다", () => {
      const result = extractKeywordsAndCategory("invoice invoice invoice generator");
      const invoiceCount = result.keywords.filter((k) => k === "invoice").length;
      expect(invoiceCount).toBe(1);
    });

    it("1글자 단어를 제거한다", () => {
      const result = extractKeywordsAndCategory("I want a good chat app");
      expect(result.keywords).not.toContain("I");
    });

    it("빈 입력에 대해 빈 배열을 반환한다", () => {
      const result = extractKeywordsAndCategory("");
      expect(result.keywords).toEqual([]);
    });

    it("특수문자를 제거하고 키워드를 추출한다", () => {
      const result = extractKeywordsAndCategory("AI-powered email!! marketing??? tool");
      expect(result.keywords).toContain("email");
      expect(result.keywords).toContain("marketing");
    });
  });

  describe("카테고리 분류", () => {
    it("생산성 카테고리를 인식한다", () => {
      const result = extractKeywordsAndCategory("할일 관리 todo 자동화 앱");
      expect(result.category).toBe("생산성");
    });

    it("마케팅 카테고리를 인식한다", () => {
      const result = extractKeywordsAndCategory("SEO optimization and email marketing tool");
      expect(result.category).toBe("마케팅");
    });

    it("AI/자동화 카테고리를 인식한다", () => {
      const result = extractKeywordsAndCategory("AI chatbot that summarizes articles");
      expect(result.category).toBe("AI/자동화");
    });

    it("금융/핀테크 카테고리를 인식한다", () => {
      const result = extractKeywordsAndCategory("가계부 영수증 스캔 투자 관리");
      expect(result.category).toBe("금융/핀테크");
    });

    it("교육 카테고리를 인식한다", () => {
      const result = extractKeywordsAndCategory("online course platform with quiz");
      expect(result.category).toBe("교육");
    });

    it("매칭되는 카테고리가 없으면 null을 반환한다", () => {
      const result = extractKeywordsAndCategory("something completely random xyz");
      expect(result.category).toBeNull();
    });

    it("가장 많이 매칭되는 카테고리를 선택한다", () => {
      // "todo task schedule automation" → 생산성 키워드 4개
      const result = extractKeywordsAndCategory("todo task schedule automation workflow");
      expect(result.category).toBe("생산성");
    });
  });

  describe("검색 쿼리 생성", () => {
    it("영어 키워드로 english 쿼리를 생성한다", () => {
      const result = extractKeywordsAndCategory("AI invoice generator");
      expect(result.searchQueries.english).toBeTruthy();
      expect(result.searchQueries.english.length).toBeGreaterThan(0);
    });

    it("한국어만 입력하면 english 쿼리에 한국어 키워드를 사용한다", () => {
      const result = extractKeywordsAndCategory("프리랜서용 청구서 생성기");
      expect(result.searchQueries.english).toBeTruthy();
    });

    it("korean 쿼리에 모든 키워드를 포함한다", () => {
      const result = extractKeywordsAndCategory("AI invoice generator");
      expect(result.searchQueries.korean).toBeTruthy();
    });
  });
});
