#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerSearchSimilar } from "./tools/search-similar.js";
import { registerSuggestDifferentiation } from "./tools/suggest-diff.js";
import { registerTechStackSuggest } from "./tools/tech-stack.js";

const server = new McpServer({
  name: "shortscut-mcp",
  version: "0.1.0",
});

// Phase 1 도구 등록
registerSearchSimilar(server);
registerSuggestDifferentiation(server);
registerTechStackSuggest(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`ShortsCut MCP server error: ${error}\n`);
  process.exit(1);
});
