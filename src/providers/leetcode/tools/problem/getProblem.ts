// src/providers/leetcode/tools/getProblem.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js';

const log = logger('Tool: GetProblem');

/**
 * LeetCode tool to fetch detailed information about a specific problem.
 */
export class GetProblemTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem';
  public readonly description =
    'Retrieves details about a specific LeetCode problem, including its description, examples, constraints, and related information.';

  // Removed inputSchema as a direct class property.
  // The schema is now defined inline within the register method for consistency with GetUserContestRankingTool.

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
      // 'Retrieves details about a specific LeetCode problem, including its description, examples, constraints, and related information',
      {
        titleSlug: z
          .string()
          .describe(
            "The URL slug/identifier of the problem (e.g., 'two-sum', 'add-two-numbers') as it appears in the LeetCode URL",
          ),
      },
      async ({ titleSlug }) => {
        log.info(`Fetching problem details for slug: ${titleSlug}`); // Changed log message for clarity
        try {
          const data =
            await this.leetcodeService.fetchProblemSimplified(titleSlug);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  titleSlug,
                  problem: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(
            `Error fetching problem for ${titleSlug}: ${error.message}`,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch problem details',
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
