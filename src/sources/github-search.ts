/**
 * GitHub 검색 소스 — 관련 레포지토리 검색
 *
 * GitHub API는 인증 없이도 사용 가능 (rate limit: 10 req/min)
 * 환경변수:
 *   GITHUB_TOKEN — 있으면 rate limit 완화 (30 req/min)
 */

export interface GitHubResult {
  title: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  source: "github";
}

export async function searchGitHub(
  query: string,
  maxResults: number = 5
): Promise<GitHubResult[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "shortscut-mcp",
    };

    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // topic 기반 + 관련성 정렬 (sort 생략 시 best match)
    // stars>10 필터로 쓰레기 레포 제거
    const params = new URLSearchParams({
      q: `${query} in:name,description stars:>10`,
      per_page: String(maxResults),
    });

    const response = await fetch(
      `https://api.github.com/search/repositories?${params.toString()}`,
      { headers }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as {
      items: Array<{
        full_name: string;
        description: string | null;
        html_url: string;
        stargazers_count: number;
        language: string | null;
      }>;
    };

    return (data.items || []).slice(0, maxResults).map((repo) => ({
      title: repo.full_name,
      description: repo.description || "",
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      source: "github" as const,
    }));
  } catch {
    return [];
  }
}
