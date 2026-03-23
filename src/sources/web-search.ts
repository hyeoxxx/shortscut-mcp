/**
 * 웹 검색 소스 — Tavily API 또는 SerpAPI를 통한 웹 검색
 *
 * 환경변수:
 *   TAVILY_API_KEY — Tavily API 키 (우선)
 *   SERPAPI_KEY — SerpAPI 키 (폴백)
 *
 * 둘 다 없으면 빈 결과 반환
 */

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  source: "web";
}

export async function searchWeb(
  query: string,
  maxResults: number = 5
): Promise<WebSearchResult[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  const serpApiKey = process.env.SERPAPI_KEY;

  if (tavilyKey) {
    return searchWithTavily(query, maxResults, tavilyKey);
  }

  if (serpApiKey) {
    return searchWithSerpApi(query, maxResults, serpApiKey);
  }

  // API 키 없으면 빈 결과
  return [];
}

async function searchWithTavily(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<WebSearchResult[]> {
  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} SaaS tool app`,
        max_results: maxResults,
        search_depth: "basic",
      }),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      results: Array<{ title: string; url: string; content: string }>;
    };

    return (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 200) || "",
      source: "web" as const,
    }));
  } catch {
    return [];
  }
}

async function searchWithSerpApi(
  query: string,
  maxResults: number,
  apiKey: string
): Promise<WebSearchResult[]> {
  try {
    const params = new URLSearchParams({
      q: `${query} SaaS tool app`,
      api_key: apiKey,
      num: String(maxResults),
    });

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    if (!response.ok) return [];

    const data = (await response.json()) as {
      organic_results: Array<{
        title: string;
        link: string;
        snippet: string;
      }>;
    };

    return (data.organic_results || []).slice(0, maxResults).map((r) => ({
      title: r.title,
      url: r.link,
      snippet: r.snippet?.slice(0, 200) || "",
      source: "web" as const,
    }));
  } catch {
    return [];
  }
}
