#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerLeetCodeResourcesWithServer } from './providers/leetcode/resources/index.js';
import { LeetCodeService } from './providers/leetcode/service.js';
import { registerLeetCodeToolsWithServer } from './providers/leetcode/tools/index.js';
import { logger } from './utils/logger.js';

const log = logger('init');

/**
 * Parses command-line arguments to extract session key and CSRF token.
 *
 * Expected arguments:
 * --session=<SESSION_KEY>
 * --csrf=<CSRF_TOKEN>
 *
 * @returns {{sessionCookie: string, csrfToken: string}} An object containing the session cookie and CSRF token.
 */
function parseAuthArgs(): { sessionCookie: string; csrfToken: string } {
  let sessionCookie = process.env.LEETCODE_SESSION;
  let csrfToken = process.env.LEETCODE_CSRF;

  const args = process.argv;

  // Show help and exit
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node server.js --session <SESSION_KEY> --csrf <CSRF_TOKEN>

Options:
  --session <SESSION_KEY>   LeetCode session cookie (required)
  --csrf <CSRF_TOKEN>       CSRF token for authentication (required)
  --help, -h                Show this help message and exit
`);
    process.exit(0);
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--session' && i + 1 < args.length) {
      sessionCookie = args[i + 1];
    }
    if (args[i] === '--csrf' && i + 1 < args.length) {
      csrfToken = args[i + 1];
    }
  }

  if (!sessionCookie || sessionCookie.trim() === '') {
    console.error('Error: Missing required argument: --session <SESSION_KEY>');
    process.exit(1);
  }
  if (!csrfToken || csrfToken.trim() === '') {
    console.error(
      'Error: CSRF token cannot be empty. Usage: --csrf <CSRF_TOKEN>',
    );
    process.exit(1);
  }

  return { sessionCookie, csrfToken };
}

async function startServer() {
  const { sessionCookie, csrfToken } = parseAuthArgs(); // Call the new function
  const transport = new StdioServerTransport();
  // Pass both to LeetCodeService if it needs both, or adjust accordingly
  const leetcodeService = await LeetCodeService.create(
    sessionCookie,
    csrfToken,
  ); // Use the static create method

  const server = new McpServer({
    name: 'LeetCode MCP Server',
    version: process.env.VERSION || '1.0.0',
    description: 'A server for LeetCode problems using Model Context Protocol',
  });
  registerLeetCodeToolsWithServer(server, leetcodeService);
  registerLeetCodeResourcesWithServer(server, leetcodeService);
  await server.connect(transport);
}

startServer().catch((error) => {
  log.error('Failed to start LeetCode MCP Server: %s', error);
  process.exit(1);
});
