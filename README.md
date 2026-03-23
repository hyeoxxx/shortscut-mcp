# ShortsCut MCP

> Check before you build. A similar SaaS might already exist.

An MCP server for vibe coders. Validate your idea, analyze competitors, and get tech stack recommendations — all inside your AI coding tool (Claude Code, Cursor, etc.).

[한국어 README](README.ko.md)

## Why?

```
You:  "Build me an AI receipt organizer app"
AI:   "Sure, let me start coding..." → starts building immediately 😱

With ShortsCut MCP:
AI:   "I found 5 similar services. Here are differentiation opportunities..."
```

Before you vibe-code a SaaS, **check if someone already built it**.

## Installation

### Claude Code

```bash
claude mcp add shortscut -- npx -y shortscut-mcp
```

Or add to your config file:

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

Settings → MCP Servers:

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

### Environment Variables (Optional)

Add API keys for better search results. **Works without them too.**

```bash
# Web search (pick one)
TAVILY_API_KEY=tvly-...        # Tavily (recommended, https://tavily.com)
SERPAPI_KEY=...                 # SerpAPI (https://serpapi.com)

# Additional sources
PRODUCTHUNT_TOKEN=...          # Product Hunt API
GITHUB_TOKEN=ghp_...           # GitHub (relaxes rate limits)
```

## Tools

### `search_similar`

Search for existing products similar to your idea. Returns competitor analysis and differentiation suggestions.

```
Input: "AI invoice generator for freelancers"

Output:
  🔍 5 similar products found | Competition: ★★★☆☆

  Product Hunt (2)
  - InvoiceBot — AI invoice generation (▲ 89)
  - FreelancePay — Freelancer payment management (▲ 45)

  GitHub (1)
  - invoice-ninja — Open source invoicing (⭐ 8.2k · PHP)

  💡 Differentiation opportunities
  - Localization (🟢 Low) — No Korean/Japanese market tools
  - Mobile app (🟢 Low) — Most are web-only
  - Browser extension (🟢 Low) — No extension-based solution
```

### `suggest_differentiation`

Analyze differentiation strategies against competitors.

```
Input: idea="AI copywriting", competitors=["CopyGenius", "WriteFlow"]

Output:
  Common traits: English-focused, web app, subscription model
  Gaps: non-English markets, short-form social content, browser extension
  Recommended: "Short-form social media copy generator (browser extension)"
```

### `tech_stack_suggest`

Get tech stack recommendations based on your idea. Auto-detects your current project setup.

```
Input: idea="AI invoice tool", category="fintech"

Output:
  Recommended stack:
  - Next.js + Supabase — Auth, Row Level Security
  - Stripe or local payment gateway
  - Chart.js or Recharts — Data visualization

  Estimated monthly cost: $0 (free tier)
```

## Data Sources

| Source | API Key Required | Description |
|--------|-----------------|-------------|
| Web Search | Tavily or SerpAPI | General web search for similar SaaS |
| Product Hunt | Yes | Search launched products |
| GitHub | Optional (rate limits) | Search open source projects |

Without any API keys, basic analysis (keyword extraction, category matching, differentiation suggestions) still works.

**Want to add a new data source?** → [CONTRIBUTING.md](CONTRIBUTING.md)

## Contributing

This is an open source project. We especially welcome:

- 🔌 **New data sources** — Indie Hackers, AlternativeTo, SaaS directories, regional platforms
- 🔧 **Search accuracy improvements** — keyword extraction, category matching algorithms
- 🌍 **Localization** — better support for non-English searches (Japanese, Chinese, etc.)
- 🛠 **New tools** — demand estimation, pricing strategy suggestions, etc.

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
