# ShortsCut MCP

> 만들기 전에 먼저 확인하세요. 비슷한 SaaS가 이미 있을 수 있습니다.

바이브코더를 위한 MCP 서버입니다. AI 코딩 도구(Claude Code, Cursor 등) 안에서 아이디어 검증, 경쟁 분석, 기술 스택 추천을 받을 수 있습니다.

[English README](README.md)

## 왜 필요한가

```
당신: "AI 영수증 정리 앱 만들어줘"
AI:   "네, 만들겠습니다" → 바로 코딩 시작 😱

ShortsCut MCP가 있으면:
AI:   "비슷한 서비스가 이미 5개 있습니다. 차별화 포인트를 제안합니다..."
```

바이브코딩으로 SaaS를 만들기 전에, **이미 누가 만든 게 있는지** 확인하세요.

## 설치

### Claude Code

```bash
claude mcp add shortscut -- npx -y shortscut-mcp
```

또는 설정 파일에 직접 추가:

```json
{
  "mcpServers": {
    "shortscut": {
      "command": "npx",
      "args": ["-y", "shortscut-mcp"]
    }
  }
}
```

### Cursor

Settings → MCP Servers에 추가:

```json
{
  "mcpServers": {
    "shortscut": {
      "command": "npx",
      "args": ["-y", "shortscut-mcp"]
    }
  }
}
```

### 환경변수 (선택)

검색 정확도를 높이려면 API 키를 설정하세요. **없어도 동작합니다.**

```bash
# 웹 검색 (둘 중 하나)
TAVILY_API_KEY=tvly-...        # Tavily (추천, https://tavily.com)
SERPAPI_KEY=...                 # SerpAPI (https://serpapi.com)

# 추가 소스
PRODUCTHUNT_TOKEN=...          # Product Hunt API
GITHUB_TOKEN=ghp_...           # GitHub (rate limit 완화)
```

## 도구

### `search_similar`

아이디어를 입력하면 유사한 SaaS를 검색합니다.

```
입력: "프리랜서를 위한 AI 인보이스 자동 생성 도구"

출력:
  🔍 유사 제품 5개 발견 | 경쟁 강도: ★★★☆☆

  Product Hunt (2개)
  - InvoiceBot — AI 인보이스 자동생성 (▲ 89)
  - FreelancePay — 프리랜서 결제 관리 (▲ 45)

  💡 차별화 가능 영역
  - 한국 시장 특화 (🟢 낮음) — 한국어 UI, 세금계산서 연동
  - 모바일 앱 (🟢 낮음) — 대부분 웹 기반
```

### `suggest_differentiation`

경쟁 제품 대비 차별화 전략을 분석합니다.

```
입력: idea="AI 카피라이팅", competitors=["CopyGenius", "WriteFlow"]

출력:
  기존 제품 공통점: 영어 중심, 웹앱 형태
  비어있는 틈새: 한국어 특화, SNS 숏폼 전용, 브라우저 확장
  추천 전략: "한국어 SNS 숏폼 카피 생성기"
```

### `tech_stack_suggest`

아이디어에 맞는 기술 스택을 추천합니다. 현재 프로젝트가 있으면 자동 감지합니다.

```
입력: idea="AI 인보이스 도구", category="금융/핀테크"

출력:
  추천 스택:
  - Next.js + Supabase — 보안 인증, Row Level Security
  - Stripe 또는 토스페이먼츠 — 결제 연동
  - Chart.js — 데이터 시각화

  예상 월 운영 비용: ₩0 (무료 티어)
```

## 데이터 소스

| 소스 | API 키 필요 | 설명 |
|------|-----------|------|
| 웹 검색 | Tavily 또는 SerpAPI | 일반 웹에서 유사 SaaS 검색 |
| Product Hunt | O | 등록된 제품 검색 |
| GitHub | 선택 (rate limit) | 오픈소스 프로젝트 검색 |

API 키가 없어도 기본 분석(키워드 추출, 카테고리 매칭, 차별화 제안)은 동작합니다.

**새 데이터 소스 추가는 환영합니다!** → [CONTRIBUTING.md](CONTRIBUTING.md)

## 기여하기

이 프로젝트는 오픈소스입니다. 특히 다음 기여를 환영합니다:

- 🔌 **새 데이터 소스 추가** — Indie Hackers, 디스콰이엇, 해외 SaaS 디렉토리 등
- 🔧 **검색 정확도 개선** — 키워드 추출, 카테고리 매칭 알고리즘
- 🌍 **다국어 지원** — 일본어, 영어 등 검색 지원 강화
- 🛠 **새 도구 추가** — 수요 예측, 가격 전략 제안 등

자세한 내용은 [CONTRIBUTING.md](CONTRIBUTING.md)를 참고하세요.

## 라이선스

MIT
