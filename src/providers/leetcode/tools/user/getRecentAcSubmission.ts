// src/providers/leetcode/tools/get_recent_ac_submissions.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Added McpServer import
import z from 'zod';
import { logger } from '../../../../utils/logger.js'; // Added .js
import { LeetCodeService } from '../../service.js'; // Added .js
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Added .js

const log = logger('Tool: GetRecentACSubmissions');

/**
 * LeetCode tool to retrieve a user's recent accepted submissions (Global-specific).
 */
export class GetRecentACSubmissionsTool extends BaseLeetCodeTool {
  public readonly name = 'get_recent_ac_submissions';
  public readonly description =
    "Retrieves a user's recent accepted (AC) submissions on LeetCode Global, focusing only on successfully completed problems.";

  // Removed inputSchema as a direct class property.
  // The schema will be defined inline within the register method for consistency.

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Registers this tool with the MCP server.
   * @param server - The MCP server instance
   */
  public register(server: McpServer): void {
    // Renamed from execute to register and added server parameter
    server.tool(
      this.name,
      this.description,
      // Define the input schema directly here for consistency
      {
        username: z
          .string()
          .describe(
            'LeetCode username to retrieve recent accepted submissions for',
          ),
        limit: z
          .number()
          .optional()
          .default(10)
          .describe(
            'Maximum number of accepted submissions to return (optional, defaults to 10)',
          ),
      },
      async ({ username, limit }) => {
        // Destructure username and limit from args
        log.info(
          `Fetching recent AC submissions for username: ${username}, limit: ${limit}`, // Clarified log message
        );
        try {
          const data = await this.leetcodeService.fetchUserRecentACSubmissions(
            username,
            limit,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  username,
                  submissions: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(
            `Error fetching recent AC submissions for ${username}: ${error.message}`,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch recent accepted submissions',
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
