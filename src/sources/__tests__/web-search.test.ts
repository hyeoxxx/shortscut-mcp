import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchWeb } from "../web-search.js";

describe("searchWeb", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("API 키가 없으면 빈 배열을 반환한다", async () => {
    delete process.env.TAVILY_API_KEY;
    delete process.env.SERPAPI_KEY;
    const result = await searchWeb("test query");
    expect(result).toEqual([]);
  });

  describe("Tavily", () => {
    beforeEach(() => {
      process.env.TAVILY_API_KEY = "test-tavily-key";
      delete process.env.SERPAPI_KEY;
    });

    it("Tavily API를 호출하고 결과를 반환한다", async () => {
      const mockResponse = {
        results: [
          { title: "Product A", url: "https://a.com", content: "Description A" },
          { title: "Product B", url: "https://b.com", content: "Description B" },
        ],
      };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchWeb("AI invoice", 2);

      expect(fetch).toHaveBeenCalledOnce();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        title: "Product A",
        url: "https://a.com",
        snippet: "Description A",
        source: "web",
      });
    });

    it("Tavily API 실패 시 빈 배열을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await searchWeb("test");
      expect(result).toEqual([]);
    });

    it("네트워크 에러 시 빈 배열을 반환한다", async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

      const result = await searchWeb("test");
      expect(result).toEqual([]);
    });

    it("snippet을 200자로 자른다", async () => {
      const longContent = "A".repeat(300);
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ title: "Test", url: "https://test.com", content: longContent }],
        }),
      } as Response);

      const result = await searchWeb("test");
      expect(result[0].snippet.length).toBe(200);
    });
  });

  describe("SerpAPI", () => {
    beforeEach(() => {
      delete process.env.TAVILY_API_KEY;
      process.env.SERPAPI_KEY = "test-serp-key";
    });

    it("SerpAPI를 호출하고 결과를 반환한다", async () => {
      const mockResponse = {
        organic_results: [
          { title: "Result 1", link: "https://r1.com", snippet: "Snippet 1" },
        ],
      };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await searchWeb("test query", 5);

      expect(fetch).toHaveBeenCalledOnce();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        title: "Result 1",
        url: "https://r1.com",
        snippet: "Snippet 1",
        source: "web",
      });
    });

    it("SerpAPI 실패 시 빈 배열을 반환한다", async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      const result = await searchWeb("test");
      expect(result).toEqual([]);
    });
  });

  it("Tavily가 SerpAPI보다 우선한다", async () => {
    process.env.TAVILY_API_KEY = "tavily-key";
    process.env.SERPAPI_KEY = "serp-key";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    await searchWeb("test");

    // Tavily URL로 호출되었는지 확인
    const callUrl = vi.mocked(fetch).mock.calls[0][0];
    expect(callUrl).toBe("https://api.tavily.com/search");
  });
});
