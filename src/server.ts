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
  let sessionCookie: string | undefined;
  let csrfToken: string | undefined;

  for (const arg of process.argv) {
    if (arg.startsWith('--session=')) {
      sessionCookie = arg.split('=')[1];
    } else if (arg.startsWith('--csrf=')) {
      csrfToken = arg.split('=')[1];
    }
  }

  if (!sessionCookie) {
    log.error('Missing required argument: --session=<SESSION_KEY>');
    process.exit(1);
  }
  if (!sessionCookie) {
    // Check if empty string after split
    log.error('Session key cannot be empty. Usage: --session=<SESSION_KEY>');
    process.exit(1);
  }

  if (!csrfToken) {
    // Check if empty string after split
    log.error('CSRF token cannot be empty. Usage: --csrf=<CSRF_TOKEN>');
    process.exit(1);
  }

  return { sessionCookie, csrfToken };
}

async function startServer() {
  const { sessionCookie, csrfToken } = parseAuthArgs(); // Call the new function
  const transport = new StdioServerTransport();
  // Pass both to LeetCodeService if it needs both, or adjust accordingly
  const leetcodeService = await LeetCodeService.create(sessionCookie, csrfToken); // Use the static create method

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
