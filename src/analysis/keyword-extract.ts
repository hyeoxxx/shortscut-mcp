/**
 * 아이디어에서 검색 키워드와 카테고리를 추출
 *
 * AI API 없이 동작하는 규칙 기반 추출기
 * 한국어/영어 모두 지원
 */

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  생산성: [
    "할일",
    "todo",
    "task",
    "노션",
    "notion",
    "메모",
    "note",
    "일정",
    "schedule",
    "캘린더",
    "calendar",
    "자동화",
    "automation",
    "워크플로우",
    "workflow",
  ],
  마케팅: [
    "카피",
    "copy",
    "광고",
    "ad",
    "마케팅",
    "marketing",
    "SEO",
    "seo",
    "소셜",
    "social",
    "이메일",
    "email",
    "뉴스레터",
    "newsletter",
  ],
  교육: [
    "학습",
    "learn",
    "교육",
    "education",
    "강의",
    "course",
    "퀴즈",
    "quiz",
    "튜토리얼",
    "tutorial",
    "어학",
    "language",
  ],
  커머스: [
    "쇼핑",
    "shop",
    "결제",
    "payment",
    "인보이스",
    "invoice",
    "구독",
    "subscription",
    "가격",
    "pricing",
    "커머스",
    "commerce",
  ],
  개발도구: [
    "코드",
    "code",
    "API",
    "api",
    "배포",
    "deploy",
    "모니터링",
    "monitoring",
    "로그",
    "log",
    "디버그",
    "debug",
    "테스트",
    "test",
    "CI",
    "CD",
  ],
  디자인: [
    "디자인",
    "design",
    "UI",
    "UX",
    "피그마",
    "figma",
    "이미지",
    "image",
    "아이콘",
    "icon",
    "일러스트",
    "illustrat",
  ],
  "금융/핀테크": [
    "금융",
    "finance",
    "투자",
    "invest",
    "주식",
    "stock",
    "가계부",
    "budget",
    "영수증",
    "receipt",
    "세금",
    "tax",
    "회계",
    "account",
  ],
  "AI/자동화": [
    "AI",
    "ai",
    "GPT",
    "gpt",
    "챗봇",
    "chatbot",
    "자동",
    "auto",
    "생성",
    "generat",
    "요약",
    "summar",
    "번역",
    "translat",
  ],
  커뮤니케이션: [
    "채팅",
    "chat",
    "메시지",
    "message",
    "슬랙",
    "slack",
    "회의",
    "meeting",
    "화상",
    "video",
    "협업",
    "collaborat",
  ],
  "건강/피트니스": [
    "건강",
    "health",
    "운동",
    "fitness",
    "다이어트",
    "diet",
    "수면",
    "sleep",
    "명상",
    "meditat",
    "습관",
    "habit",
  ],
};

// 불용어 (검색에서 제외할 단어)
const STOP_WORDS = new Set([
  // 한국어
  "만들어줘",
  "만들어",
  "만들기",
  "만든",
  "위한",
  "하는",
  "있는",
  "같은",
  "통한",
  "대한",
  "해주는",
  "해줘",
  "좀",
  "앱",
  "서비스",
  "도구",
  "툴",
  "플랫폼",
  "사이트",
  "웹",
  // 영어
  "the",
  "a",
  "an",
  "is",
  "are",
  "for",
  "to",
  "of",
  "and",
  "in",
  "with",
  "that",
  "this",
  "make",
  "create",
  "build",
  "app",
  "tool",
  "service",
  "platform",
  "website",
  "saas",
]);

export interface ExtractedInfo {
  keywords: string[];
  category: string | null;
  searchQueries: {
    korean: string;
    english: string;
  };
}

export function extractKeywordsAndCategory(idea: string): ExtractedInfo {
  const normalized = idea.toLowerCase().trim();

  // 카테고리 추출
  let bestCategory: string | null = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(
      (kw) => normalized.includes(kw.toLowerCase())
    ).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  // 키워드 추출: 불용어 제거 후 의미 있는 단어만
  const words = normalized
    .replace(/[^a-zA-Z0-9가-힣\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  // 중복 제거
  const keywords = [...new Set(words)];

  // 검색 쿼리 생성
  // AI가 영어로 번역해서 넘겨주므로 영어 키워드만 추출
  const searchQueries = {
    korean: keywords.join(" "),
    english: keywords
      .filter((w) => /[a-zA-Z]/.test(w))
      .join(" ") || keywords.slice(0, 3).join(" "),
  };

  return {
    keywords,
    category: bestCategory,
    searchQueries,
  };
}
