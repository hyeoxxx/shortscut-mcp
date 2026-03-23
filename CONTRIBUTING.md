# Contributing to ShortsCut MCP

Thanks for your interest in contributing! This guide will help you get started.

[한국어 기여 가이드](CONTRIBUTING.ko.md)

## Types of Contributions

### 1. Add a New Data Source (Easiest)

Add a new file in `src/sources/`. Each file = one source.

**Example: `src/sources/indie-hackers.ts`**

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
  // Always wrap in try-catch, return empty array on error
  try {
    // ... your search logic
    return results;
  } catch {
    return [];
  }
}
```

**Rules:**
- One file per source
- API keys via environment variables (`process.env.XXX_API_KEY`)
- Return empty array if API key is missing (not an error)
- Include `source` field in results

### 2. Add a New Tool

Add a new file in `src/tools/`.

**Example: `src/tools/pricing-suggest.ts`**

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerPricingSuggest(server: McpServer): void {
  server.tool(
    "pricing_suggest",
    "Tool description here",
    {
      idea: z.string().describe("Parameter description"),
    },
    async ({ idea }) => {
      // Your logic here
      return {
        content: [{ type: "text" as const, text: "Result" }],
      };
    }
  );
}
```

Then register in `src/index.ts`:

```typescript
import { registerPricingSuggest } from "./tools/pricing-suggest.js";
registerPricingSuggest(server);
```

### 3. Improve Search Accuracy

Edit files in `src/analysis/`:

- `keyword-extract.ts` — keyword extraction, category matching
- `competitor-analyze.ts` — competition analysis logic
- `differentiation.ts` — differentiation suggestion logic

### 4. Add Localization Support

The keyword extractor in `src/analysis/keyword-extract.ts` currently supports Korean and English. To add another language:

1. Add category keywords in the new language to `CATEGORY_KEYWORDS`
2. Add stop words to `STOP_WORDS`
3. Test with sample ideas in that language

## Development Setup

```bash
# 1. Clone
git clone https://github.com/your-username/shortscut-mcp.git
cd shortscut-mcp

# 2. Install dependencies
npm install

# 3. Build
npm run build

# 4. Watch mode (auto-rebuild on changes)
npm run dev
```

## Local Testing

Test your local build with Claude Code:

```json
{
  "mcpServers": {
    "shortscut-dev": {
      "command": "node",
      "args": ["/absolute/path/to/shortscut-mcp/dist/index.js"]
    }
  }
}
```

## Pull Request Guide

1. Check existing issues or create a new one
2. Fork and create a branch (`feature/new-data-source`, etc.)
3. Make your changes
4. Ensure `npm run build` passes
5. Open a PR — explain what you changed and why

## Code Style

- TypeScript strict mode
- Return empty results on error (never throw — crashing the MCP server breaks the user's workflow)
- Comments in English preferred (Korean OK in analysis logic)
- API keys must use environment variables (never hardcode)

## Questions?

Open an issue — we're happy to help!
