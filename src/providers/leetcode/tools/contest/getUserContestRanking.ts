// src/providers/leetcode/tools/get_user_contest_ranking.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../../../../utils/logger.js'; // Adjust path based on your structure
import { LeetCodeService } from '../../service.js'; // Adjust path based on your structure
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Make sure this is using .js if you're using ES modules

const log = logger('Tool: GetUserContestRanking');

/**
 * LeetCode tool to retrieve a user's contest ranking information.
 */
export class GetUserContestRankingTool extends BaseLeetCodeTool {
  public readonly name = 'get_user_contest_ranking';
  public readonly description =
    "Retrieves a user's contest ranking information on LeetCode, including overall ranking, participation history, and performance metrics across contests.";

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Registers this tool with the MCP server.
   * @param server - The MCP server instance
   */
  public register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      {
        username: z
          .string()
          .describe(
            'LeetCode username to retrieve contest ranking information for',
          ),
        attended: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Whether to include only the contests the user has participated in (true) or all contests (false); defaults to true',
          ),
      },
      async ({ username, attended = true }) => {
        log.info(
          `Fetching contest ranking for username: ${username}, attended: ${attended}`,
        );
        try {
          const data = await this.leetcodeService.fetchUserContestRanking(
            username,
            attended,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  username,
                  contestRanking: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error fetching ranking for ${username}: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch user contest ranking',
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
