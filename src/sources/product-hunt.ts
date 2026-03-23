/**
 * Product Hunt 검색 소스
 *
 * 환경변수:
 *   PRODUCTHUNT_TOKEN — Product Hunt API 토큰
 *
 * 없으면 빈 결과 반환
 */

export interface ProductHuntResult {
  title: string;
  tagline: string;
  url: string;
  votesCount: number;
  source: "producthunt";
}

export async function searchProductHunt(
  query: string,
  maxResults: number = 5
): Promise<ProductHuntResult[]> {
  const token = process.env.PRODUCTHUNT_TOKEN;
  if (!token) return [];

  try {
    const response = await fetch("https://api.producthunt.com/v2/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: `
          query SearchPosts($query: String!) {
            posts(order: VOTES, search: $query, first: ${maxResults}) {
              edges {
                node {
                  name
                  tagline
                  url
                  votesCount
                }
              }
            }
          }
        `,
        variables: { query },
      }),
    });

    if (!response.ok) return [];

    const data = (await response.json()) as {
      data: {
        posts: {
          edges: Array<{
            node: {
              name: string;
              tagline: string;
              url: string;
              votesCount: number;
            };
          }>;
        };
      };
    };

    return (data.data?.posts?.edges || []).map((edge) => ({
      title: edge.node.name,
      tagline: edge.node.tagline,
      url: edge.node.url,
      votesCount: edge.node.votesCount,
      source: "producthunt" as const,
    }));
  } catch {
    return [];
  }
}
