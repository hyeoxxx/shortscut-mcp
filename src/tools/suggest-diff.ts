/**
 * suggest_differentiation — 차별화 전략 제안 도구
 *
 * 아이디어와 경쟁 제품 정보를 입력하면
 * 차별화 가능 영역과 추천 전략을 반환
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { extractKeywordsAndCategory } from "../analysis/keyword-extract.js";
import { searchWeb } from "../sources/web-search.js";
import { searchProductHunt } from "../sources/product-hunt.js";
import { searchGitHub } from "../sources/github-search.js";
import { unifyResults } from "../analysis/competitor-analyze.js";
import { analyzeDifferentiation } from "../analysis/differentiation.js";

export function registerSuggestDifferentiation(server: McpServer): void {
  server.tool(
    "suggest_differentiation",
    "아이디어에 대한 차별화 전략을 분석합니다. 기존 제품의 공통점과 비어있는 틈새를 찾아 추천합니다.",
    {
      idea: z
        .string()
        .describe("The service idea to analyze. IMPORTANT: Always translate to English before passing."),
      competitors: z
        .array(z.string())
        .optional()
        .describe("이미 알고 있는 경쟁 제품 이름 목록 (없으면 자동 검색)"),
    },
    async ({ idea, competitors }) => {
      const extracted = extractKeywordsAndCategory(idea);
      const query = extracted.searchQueries.english || extracted.searchQueries.korean;

      // 경쟁 제품 정보 수집
      let products;
      if (competitors && competitors.length > 0) {
        // 알려진 경쟁사가 있으면 그것에 대해 검색
        const competitorQuery = competitors.join(" OR ");
        const [webResults, phResults, ghResults] = await Promise.all([
          searchWeb(competitorQuery, 5),
          searchProductHunt(competitorQuery, 3),
          searchGitHub(competitorQuery, 3),
        ]);
        products = unifyResults(webResults, phResults, ghResults);
      } else {
        // 없으면 아이디어 기반 검색
        const [webResults, phResults, ghResults] = await Promise.all([
          searchWeb(`${query} SaaS tool`, 5),
          searchProductHunt(query, 3),
          searchGitHub(query, 3),
        ]);
        products = unifyResults(webResults, phResults, ghResults);
      }

      // 차별화 분석
      const analysis = analyzeDifferentiation(
        products,
        idea,
        extracted.category
      );

      // 포맷팅
      const lines: string[] = [];
      lines.push("## 💡 차별화 전략 분석");
      lines.push("");

      if (analysis.commonTraits.length > 0) {
        lines.push("### 기존 제품들의 공통점");
        for (const trait of analysis.commonTraits) {
          lines.push(`- ${trait}`);
        }
        lines.push("");
      }

      if (analysis.gaps.length > 0) {
        lines.push("### 비어있는 틈새");
        lines.push("");
        lines.push("| 영역 | 경쟁 | 기회 |");
        lines.push("|------|------|------|");
        for (const gap of analysis.gaps) {
          const comp =
            gap.competitionInArea === "low"
              ? "🟢 낮음"
              : gap.competitionInArea === "medium"
                ? "🟡 중간"
                : "🔴 높음";
          lines.push(`| ${gap.area} | ${comp} | ${gap.opportunity} |`);
        }
        lines.push("");
      }

      lines.push("### 🎯 추천 전략");
      lines.push(analysis.recommendedStrategy);

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    }
  );
}
