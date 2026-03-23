/**
 * search_similar — 유사 제품 검색 도구
 *
 * 자연어 아이디어를 입력하면 유사한 SaaS/도구를 검색하고
 * 경쟁 분석 + 차별화 제안을 반환
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { extractKeywordsAndCategory } from "../analysis/keyword-extract.js";
import { searchWeb } from "../sources/web-search.js";
import { searchProductHunt } from "../sources/product-hunt.js";
import { searchGitHub } from "../sources/github-search.js";
import {
  unifyResults,
  analyzeCompetition,
} from "../analysis/competitor-analyze.js";
import { analyzeDifferentiation } from "../analysis/differentiation.js";
import { formatSearchResults } from "../utils/formatter.js";

export function registerSearchSimilar(server: McpServer): void {
  server.tool(
    "search_similar",
    "아이디어를 입력하면 이미 존재하는 유사한 SaaS/도구를 검색합니다. 경쟁 분석과 차별화 포인트도 함께 제공합니다.",
    {
      idea: z
        .string()
        .describe("The service idea to search for. IMPORTANT: Always translate to English before passing. For example, 'AI 영수증 정리 앱' should be passed as 'AI receipt organizer app'."),
      category: z
        .string()
        .optional()
        .describe("카테고리 힌트 (생산성, 마케팅, 교육, 커머스, 개발도구, 디자인, 금융/핀테크, AI/자동화 등)"),
    },
    async ({ idea, category }) => {
      // 1. 키워드 추출
      const extracted = extractKeywordsAndCategory(idea);
      const effectiveCategory = category || extracted.category;

      // 2. 검색 쿼리 구성
      const koreanQuery = extracted.searchQueries.korean;
      const englishQuery = extracted.searchQueries.english || koreanQuery;

      // 3. 병렬 검색
      const [webResults, phResults, ghResults] = await Promise.all([
        searchWeb(`${englishQuery} SaaS tool`, 5),
        searchProductHunt(englishQuery, 5),
        searchGitHub(englishQuery, 5),
      ]);

      // 4. 결과 통합
      const unified = unifyResults(webResults, phResults, ghResults);

      // 5. 경쟁 분석
      const analysis = analyzeCompetition(unified, idea);

      // 6. 차별화 분석
      const diffAnalysis = analyzeDifferentiation(
        unified,
        idea,
        effectiveCategory
      );

      // 7. 포맷팅
      const text = formatSearchResults(
        analysis.products,
        analysis.totalFound,
        analysis.competitionScore,
        analysis.summary,
        diffAnalysis.gaps
      );

      return {
        content: [{ type: "text" as const, text }],
      };
    }
  );
}
