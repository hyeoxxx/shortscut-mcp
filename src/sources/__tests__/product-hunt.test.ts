import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { searchProductHunt } from "../product-hunt.js";

describe("searchProductHunt", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("토큰이 없으면 빈 배열을 반환한다", async () => {
    delete process.env.PRODUCTHUNT_TOKEN;
    const result = await searchProductHunt("test");
    expect(result).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("Product Hunt API를 호출하고 결과를 반환한다", async () => {
    process.env.PRODUCTHUNT_TOKEN = "test-token";

    const mockResponse = {
      data: {
        posts: {
          edges: [
            {
              node: {
                name: "InvoiceBot",
                tagline: "AI invoice tool",
                url: "https://producthunt.com/posts/invoicebot",
                votesCount: 120,
              },
            },
            {
              node: {
                name: "BillGen",
                tagline: "Auto billing",
                url: "https://producthunt.com/posts/billgen",
                votesCount: 45,
              },
            },
          ],
        },
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await searchProductHunt("invoice", 5);

    expect(fetch).toHaveBeenCalledOnce();
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      title: "InvoiceBot",
      tagline: "AI invoice tool",
      url: "https://producthunt.com/posts/invoicebot",
      votesCount: 120,
      source: "producthunt",
    });
  });

  it("Authorization 헤더에 토큰을 포함한다", async () => {
    process.env.PRODUCTHUNT_TOKEN = "my-secret-token";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { posts: { edges: [] } } }),
    } as Response);

    await searchProductHunt("test");

    const callOptions = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(callOptions.headers).toHaveProperty(
      "Authorization",
      "Bearer my-secret-token"
    );
  });

  it("API 실패 시 빈 배열을 반환한다", async () => {
    process.env.PRODUCTHUNT_TOKEN = "test-token";

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const result = await searchProductHunt("test");
    expect(result).toEqual([]);
  });

  it("네트워크 에러 시 빈 배열을 반환한다", async () => {
    process.env.PRODUCTHUNT_TOKEN = "test-token";

    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    const result = await searchProductHunt("test");
    expect(result).toEqual([]);
  });
});
