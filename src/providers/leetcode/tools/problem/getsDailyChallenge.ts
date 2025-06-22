// src/providers/leetcode/tools/getsDailyChallenge.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js';

const log = logger('Tool: GetDailyChallenge');

/**
 * LeetCode tool to fetch today's Daily Challenge problem.
 */
export class GetDailyChallengeTool extends BaseLeetCodeTool {
  public readonly name = 'get_daily_challenge';
  public readonly description =
    "Retrieves today's LeetCode Daily Challenge problem with complete details, including problem description, constraints, and examples.";

  // Removed inputSchema as a direct class property.
  // The schema is now defined inline within the register method for consistency.

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Registers this tool with the MCP server.
   * @param server - The MCP server instance
   */
  public register(server: McpServer): void {
    // Renamed from registerWithServer to simply register
    server.tool(
      this.name,
      this.description,
      {}, // No input parameters needed for this tool
      async () => {
        log.info("Fetching today's Daily Challenge problem."); // Clarified log message
        try {
          const data = await this.leetcodeService.fetchDailyChallenge();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  date: new Date().toISOString().split('T')[0],
                  problem: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error fetching daily challenge: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch daily challenge',
                  message: error.message,
                }),
              },
            ],
          };
        }
      },
    );
  }
}
