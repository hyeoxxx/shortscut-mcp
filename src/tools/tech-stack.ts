/**
 * tech_stack_suggest — 기술 스택 추천 도구
 *
 * 아이디어 + 현재 프로젝트 상태를 분석하여
 * 적합한 기술 스택을 추천
 */

import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { extractKeywordsAndCategory } from "../analysis/keyword-extract.js";
import { detectProject } from "../utils/project-detect.js";

interface StackRecommendation {
  stack: string;
  reason: string;
}

// 카테고리별 추천 스택
const CATEGORY_STACKS: Record<string, StackRecommendation[]> = {
  생산성: [
    { stack: "Next.js + Supabase", reason: "빠른 풀스택 개발, 실시간 기능 지원" },
    { stack: "Tailwind CSS", reason: "빠른 UI 개발" },
    { stack: "Vercel", reason: "무료 배포, 서버리스 함수 지원" },
  ],
  마케팅: [
    { stack: "Next.js + Supabase", reason: "SEO 최적화 SSR, 빠른 개발" },
    { stack: "Resend", reason: "이메일 발송 (뉴스레터, 알림)" },
    { stack: "Stripe", reason: "구독 결제" },
  ],
  교육: [
    { stack: "Next.js + Supabase", reason: "인증, DB, 스토리지 올인원" },
    { stack: "MDX", reason: "콘텐츠 관리" },
    { stack: "Vercel", reason: "정적 + 동적 혼합 배포" },
  ],
  커머스: [
    { stack: "Next.js + Supabase", reason: "풀스택, 인증, 결제 연동 용이" },
    { stack: "Stripe 또는 토스페이먼츠", reason: "결제 처리" },
    { stack: "Cloudflare R2", reason: "상품 이미지 저장 (저렴)" },
  ],
  개발도구: [
    { stack: "TypeScript + Hono", reason: "경량 API 서버" },
    { stack: "Turborepo", reason: "모노레포 관리" },
    { stack: "Fly.io 또는 Railway", reason: "백엔드 배포" },
  ],
  디자인: [
    { stack: "Next.js + Tailwind CSS", reason: "디자인 중심 프론트엔드" },
    { stack: "Framer Motion", reason: "애니메이션" },
    { stack: "Cloudflare R2", reason: "이미지/에셋 저장" },
  ],
  "금융/핀테크": [
    { stack: "Next.js + Supabase", reason: "보안 인증, Row Level Security" },
    { stack: "Stripe 또는 토스페이먼츠", reason: "결제 연동" },
    { stack: "Chart.js 또는 Recharts", reason: "데이터 시각화" },
  ],
  "AI/자동화": [
    { stack: "Next.js + Vercel AI SDK", reason: "AI 스트리밍 응답 지원" },
    { stack: "Claude API 또는 OpenAI API", reason: "LLM 연동" },
    { stack: "Supabase + pgvector", reason: "임베딩 벡터 저장/검색" },
  ],
  커뮤니케이션: [
    { stack: "Next.js + Supabase Realtime", reason: "실시간 메시징" },
    { stack: "Socket.io 또는 Ably", reason: "WebSocket 통신" },
    { stack: "Vercel", reason: "Edge Functions로 빠른 응답" },
  ],
  "건강/피트니스": [
    { stack: "React Native + Expo", reason: "모바일 앱 (건강 앱은 모바일 필수)" },
    { stack: "Supabase", reason: "사용자 데이터 저장" },
    { stack: "Chart.js", reason: "건강 데이터 시각화" },
  ],
};

// 기본 추천 (카테고리 매칭 안 될 때)
const DEFAULT_STACKS: StackRecommendation[] = [
  { stack: "Next.js", reason: "가장 많은 바이브코더가 사용하는 프레임워크" },
  { stack: "Supabase", reason: "DB + 인증 + 스토리지 올인원. 무료 티어 넉넉" },
  { stack: "Tailwind CSS", reason: "빠른 UI 개발, AI 코딩 도구와 궁합이 좋음" },
  { stack: "Vercel", reason: "Next.js 공식 배포 플랫폼. 무료 배포" },
  { stack: "TypeScript", reason: "타입 안전성. AI가 더 정확한 코드를 생성" },
];

export function registerTechStackSuggest(server: McpServer): void {
  server.tool(
    "tech_stack_suggest",
    "아이디어에 적합한 기술 스택을 추천합니다. 현재 프로젝트가 있으면 자동 감지하여 참고합니다.",
    {
      idea: z
        .string()
        .describe("만들고 싶은 서비스 아이디어"),
      category: z
        .string()
        .optional()
        .describe("카테고리 (생산성, 마케팅, 교육, 커머스, 개발도구, 디자인, 금융/핀테크, AI/자동화 등)"),
      projectDir: z
        .string()
        .optional()
        .describe("현재 프로젝트 디렉토리 경로 (자동 감지용)"),
    },
    async ({ idea, category, projectDir }) => {
      // 1. 카테고리 결정
      const extracted = extractKeywordsAndCategory(idea);
      const effectiveCategory = category || extracted.category;

      // 2. 카테고리별 추천 스택 가져오기
      const recommended =
        effectiveCategory && CATEGORY_STACKS[effectiveCategory]
          ? CATEGORY_STACKS[effectiveCategory]
          : DEFAULT_STACKS;

      // 3. 현재 프로젝트 감지 (경로가 주어진 경우)
      let detectedStack: string[] = [];
      let detectedAiTools: string[] = [];

      if (projectDir) {
        try {
          const projectInfo = await detectProject(projectDir);
          detectedStack = projectInfo.techStack;
          detectedAiTools = projectInfo.aiTools;
        } catch {
          // 감지 실패 시 무시
        }
      }

      // 4. 포맷팅
      const lines: string[] = [];
      lines.push("## 🛠 기술 스택 추천");
      lines.push("");

      if (effectiveCategory) {
        lines.push(`**카테고리:** ${effectiveCategory}`);
        lines.push("");
      }

      if (detectedStack.length > 0) {
        lines.push("### 현재 프로젝트에서 감지된 스택");
        lines.push(detectedStack.map((s) => `\`${s}\``).join(" · "));
        lines.push("");
      }

      if (detectedAiTools.length > 0) {
        lines.push("### 감지된 AI 도구");
        lines.push(detectedAiTools.join(" · "));
        lines.push("");
      }

      lines.push("### 추천 스택");
      for (const r of recommended) {
        lines.push(`- **${r.stack}** — ${r.reason}`);
      }
      lines.push("");

      // 예상 비용
      lines.push("### 💰 예상 월 운영 비용");
      lines.push("- **무료 티어 활용 시:** ₩0 (Vercel Free + Supabase Free)");
      lines.push("- **소규모 유료:** ₩20,000~50,000 (Pro 플랜 전환 시)");
      lines.push("- **스케일업:** ₩100,000+ (트래픽/사용량에 따라)");

      return {
        content: [{ type: "text" as const, text: lines.join("\n") }],
      };
    }
  );
}
