# ShortsCut MCP 기여 가이드

기여해주셔서 감사합니다! 이 문서는 기여 방법을 안내합니다.

[English Contributing Guide](CONTRIBUTING.md)

## 기여 유형별 가이드

### 1. 새 데이터 소스 추가 (가장 쉬움)

`src/sources/` 디렉토리에 새 파일을 추가하면 됩니다.

**예시: `src/sources/indie-hackers.ts`**

```typescript
export interface IndieHackersResult {
  title: string;
  description: string;
  url: string;
  revenue: number;
  source: "indiehackers";
}

export async function searchIndieHackers(
  query: string,
  maxResults: number = 5
): Promise<IndieHackersResult[]> {
  // 반드시 try-catch로 감싸서 에러 시 빈 배열 반환
  try {
    // ...
    return results;
  } catch {
    return [];
  }
}
```

**규칙:**
- 파일 하나에 소스 하나
- API 키는 환경변수로 (`process.env.XXX_API_KEY`)
- API 키 없으면 빈 배열 반환 (에러 아님)
- 결과에 `source` 필드 필수

### 2. 새 도구 추가

`src/tools/` 디렉토리에 새 파일을 추가합니다.

**예시: `src/tools/pricing-suggest.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPricingSuggest(server: McpServer): void {
  server.tool(
    "pricing_suggest",
    "도구 설명",
    {
      idea: z.string().describe("파라미터 설명"),
    },
    async ({ idea }) => {
      // 로직 구현
      return {
        content: [{ type: "text" as const, text: "결과" }],
      };
    }
  );
}
```

그리고 `src/index.ts`에서 등록:

```typescript
import { registerPricingSuggest } from "./tools/pricing-suggest.js";
registerPricingSuggest(server);
```

### 3. 검색 정확도 개선

`src/analysis/` 디렉토리의 파일을 수정합니다.

- `keyword-extract.ts` — 키워드 추출, 카테고리 매칭
- `competitor-analyze.ts` — 경쟁 분석 로직
- `differentiation.ts` — 차별화 제안 로직

## 개발 환경 설정

```bash
# 1. 클론
git clone https://github.com/your-username/shortscut-mcp.git
cd shortscut-mcp

# 2. 의존성 설치
npm install

# 3. 빌드
npm run build

# 4. 개발 모드 (파일 변경 시 자동 빌드)
npm run dev
```

## 로컬 테스트

Claude Code에서 로컬 빌드를 테스트하려면:

```json
{
  "mcpServers": {
    "shortscut-dev": {
      "command": "node",
      "args": ["/path/to/shortscut-mcp/dist/index.js"]
    }
  }
}
```

## PR 가이드

1. 이슈를 먼저 확인하거나 새로 생성
2. 포크 후 브랜치 생성 (`feature/새-데이터-소스` 등)
3. 변경사항 커밋
4. PR 생성 — 무엇을 왜 변경했는지 설명
5. 빌드가 통과하는지 확인 (`npm run build`)

## 코드 스타일

- TypeScript strict 모드
- 에러 시 빈 결과 반환 (절대 throw하지 않음 — MCP 서버가 죽으면 안 됨)
- 주석은 영어 권장 (분석 로직에는 한국어 OK)
- API 키는 반드시 환경변수로
