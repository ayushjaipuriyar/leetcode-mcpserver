import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerLeetCodeResourcesWithServer } from './providers/leetcode/resources/index.js';
import { LeetCodeService } from './providers/leetcode/service.js';
import { registerLeetCodeToolsWithServer } from './providers/leetcode/tools/index.js';
import { logger } from './utils/logger.js';

const log = logger('init');

function parseSessionArg(): string {
  const sessionArg = process.argv.find((arg) => arg.startsWith('--session='));
  if (!sessionArg) {
    log.error('Missing required argument: --session=<SESSION_KEY>');
    process.exit(1);
  }
  const session = sessionArg.split('=')[1];
  if (!session) {
    log.error('Session key cannot be empty. Usage: --session=<SESSION_KEY>');
    process.exit(1);
  }
  return session;
}

async function startServer() {
  const sessionCookie = parseSessionArg();
  const transport = new StdioServerTransport();
  const leetcodeService = await LeetCodeService.create(sessionCookie);

  const server = new McpServer({
    name: 'LeetCode MCP Server',
    version: '1.0.0',
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
