import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchGitHub } from "../github-search.js";

describe("searchGitHub", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("GitHub API를 호출하고 결과를 반환한다", async () => {
    delete process.env.GITHUB_TOKEN;

    const mockResponse = {
      items: [
        {
          full_name: "user/invoice-app",
          description: "Open source invoice tool",
          html_url: "https://github.com/user/invoice-app",
          stargazers_count: 1500,
          language: "TypeScript",
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await searchGitHub("invoice", 5);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      title: "user/invoice-app",
      description: "Open source invoice tool",
      url: "https://github.com/user/invoice-app",
      stars: 1500,
      language: "TypeScript",
      source: "github",
    });
  });

  it("GITHUB_TOKEN이 있으면 Authorization 헤더를 포함한다", async () => {
    process.env.GITHUB_TOKEN = "ghp_testtoken123";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    await searchGitHub("test");

    const callOptions = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    const headers = callOptions.headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer ghp_testtoken123");
  });

  it("GITHUB_TOKEN이 없으면 Authorization 헤더를 포함하지 않는다", async () => {
    delete process.env.GITHUB_TOKEN;

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    await searchGitHub("test");

    const callOptions = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    const headers = callOptions.headers as Record<string, string>;
    expect(headers["Authorization"]).toBeUndefined();
  });

  it("description이 null이면 빈 문자열로 처리한다", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [
          {
            full_name: "user/repo",
            description: null,
            html_url: "https://github.com/user/repo",
            stargazers_count: 10,
            language: null,
          },
        ],
      }),
    } as Response);

    const result = await searchGitHub("test");
    expect(result[0].description).toBe("");
    expect(result[0].language).toBeNull();
  });

  it("API 실패 시 빈 배열을 반환한다", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await searchGitHub("test");
    expect(result).toEqual([]);
  });

  it("네트워크 에러 시 빈 배열을 반환한다", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const result = await searchGitHub("test");
    expect(result).toEqual([]);
  });

  it("maxResults만큼만 결과를 반환한다", async () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      full_name: `user/repo-${i}`,
      description: `Repo ${i}`,
      html_url: `https://github.com/user/repo-${i}`,
      stargazers_count: i * 100,
      language: "JavaScript",
    }));

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items }),
    } as Response);

    const result = await searchGitHub("test", 3);
    expect(result).toHaveLength(3);
  });
});
