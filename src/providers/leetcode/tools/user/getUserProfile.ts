// src/providers/leetcode/tools/get_user_profile.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Added McpServer import
import z from 'zod';
import { logger } from '../../../../utils/logger.js'; // Added .js
import { LeetCodeService } from '../../service.js'; // Added .js
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Added .js

const log = logger('Tool: GetUserProfile');

/**
 * LeetCode tool to retrieve profile information about a specific user.
 */
export class GetUserProfileTool extends BaseLeetCodeTool {
  public readonly name = 'get_user_profile';
  public readonly description =
    'Retrieves profile information about a LeetCode user, including user stats, solved problems, and profile details.';

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
          .describe('LeetCode username to retrieve profile information for'),
      },
      async ({ username }) => {
        // Destructure username from args
        log.info(`Fetching user profile for username: ${username}`); // Clarified log message
        try {
          const data = await this.leetcodeService.fetchUserProfile(username);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  username,
                  profile: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error fetching profile for ${username}: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch user profile',
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
