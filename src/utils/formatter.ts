/**
 * MCP 도구 결과를 사람이 읽기 좋은 텍스트로 변환
 */

import type { UnifiedProduct } from "../analysis/competitor-analyze.js";
import type { DifferentiationSuggestion } from "../analysis/differentiation.js";

/**
 * 유사 제품 검색 결과를 포맷팅
 */
export function formatSearchResults(
  products: UnifiedProduct[],
  totalFound: number,
  competitionScore: number,
  summary: string,
  gaps?: DifferentiationSuggestion[]
): string {
  const lines: string[] = [];

  // 헤더
  lines.push(`## 🔍 유사 제품 검색 결과`);
  lines.push("");
  lines.push(
    `**${totalFound}개 발견** | 경쟁 강도: ${"★".repeat(competitionScore)}${"☆".repeat(5 - competitionScore)}`
  );
  lines.push("");

  // 제품 목록
  if (products.length > 0) {
    // 소스별 그룹
    const phProducts = products.filter((p) => p.source === "producthunt");
    const ghProducts = products.filter((p) => p.source === "github");
    const webProducts = products.filter((p) => p.source === "web");

    if (phProducts.length > 0) {
      lines.push(`### Product Hunt (${phProducts.length}개)`);
      for (const p of phProducts) {
        lines.push(
          `- **${p.name}** — ${p.description} (▲ ${p.extra?.votes || 0})`
        );
        lines.push(`  ${p.url}`);
      }
      lines.push("");
    }

    if (ghProducts.length > 0) {
      lines.push(`### GitHub (${ghProducts.length}개)`);
      for (const p of ghProducts) {
        lines.push(
          `- **${p.name}** — ${p.description} (⭐ ${p.extra?.stars || 0}${p.extra?.language ? ` · ${p.extra.language}` : ""})`
        );
        lines.push(`  ${p.url}`);
      }
      lines.push("");
    }

    if (webProducts.length > 0) {
      lines.push(`### 웹 검색 (${webProducts.length}개)`);
      for (const p of webProducts) {
        lines.push(`- **${p.name}** — ${p.description}`);
        lines.push(`  ${p.url}`);
      }
      lines.push("");
    }
  } else {
    lines.push("유사한 제품을 찾지 못했습니다.");
    lines.push("");
  }

  // 차별화 제안
  if (gaps && gaps.length > 0) {
    lines.push(`### 💡 차별화 가능 영역`);
    for (const gap of gaps) {
      const comp =
        gap.competitionInArea === "low"
          ? "🟢 낮음"
          : gap.competitionInArea === "medium"
            ? "🟡 중간"
            : "🔴 높음";
      lines.push(`- **${gap.area}** (경쟁: ${comp})`);
      lines.push(`  ${gap.opportunity}`);
    }
    lines.push("");
  }

  // 요약
  lines.push(`### 📋 요약`);
  lines.push(summary);

  return lines.join("\n");
}

/**
 * 기술 스택 추천 결과를 포맷팅
 */
export function formatTechStackResult(
  recommended: Array<{ stack: string; reason: string }>,
  detectedStack: string[],
  detectedAiTools: string[]
): string {
  const lines: string[] = [];

  lines.push(`## 🛠 기술 스택 추천`);
  lines.push("");

  if (detectedStack.length > 0) {
    lines.push(`### 현재 프로젝트에서 감지된 스택`);
    lines.push(detectedStack.map((s) => `\`${s}\``).join(" · "));
    lines.push("");
  }

  if (detectedAiTools.length > 0) {
    lines.push(`### 감지된 AI 도구`);
    lines.push(detectedAiTools.join(" · "));
    lines.push("");
  }

  lines.push(`### 추천 스택`);
  for (const r of recommended) {
    lines.push(`- **${r.stack}** — ${r.reason}`);
  }

  return lines.join("\n");
}
