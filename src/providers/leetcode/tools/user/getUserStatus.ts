// src/providers/leetcode/tools/get_user_status.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Added McpServer import
import { logger } from '../../../../utils/logger.js'; // Added .js
import { LeetCodeService } from '../../service.js'; // Added .js
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Added .js

const log = logger('Tool: GetUserStatus');

/**
 * LeetCode tool to retrieve the current user's status.
 * This tool requires authentication.
 */
export class GetUserStatusTool extends BaseLeetCodeTool {
  public readonly name = 'get_user_status';
  public readonly description =
    "Retrieves the current user's status on LeetCode, including login status, premium membership details, and user information (requires authentication).";

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
      {}, // Input schema defined inline; it's an empty object as there are no parameters
      async () => {
        // No arguments for this tool
        log.info('Fetching current user status.'); // Clarified log message
        try {
          const status = await this.leetcodeService.fetchUserStatus();
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  status,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error fetching user status: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch user status',
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
