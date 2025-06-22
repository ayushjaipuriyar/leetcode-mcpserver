// src/providers/leetcode/tools/get_problem_solution.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Import McpServer
import z from 'zod';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js';

const log = logger('Tool: GetProblemSolution');

/**
 * LeetCode tool to retrieve the complete content of a specific problem solution (Global-specific).
 */
export class GetProblemSolutionTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem_solution';
  public readonly description =
    'Retrieves the complete content and metadata of a specific solution, including the full article text, author information, and related navigation links.';

  // Removed inputSchema as a direct class property; it will be defined inline in register method.

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
        topicId: z
          .string()
          .describe(
            "The unique topic ID of the solution to retrieve. This ID can be obtained from the 'topicId' field in the response of the 'list_problem_solutions' tool. Format is typically a string of numbers and letters that uniquely identifies the solution in LeetCode's database.",
          ),
      },
      async ({ topicId }) => {
        // Destructure topicId from args
        log.info(`Fetching solution detail for topicId: ${topicId}`);
        try {
          const data =
            await this.leetcodeService.fetchSolutionArticleDetail(topicId);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  topicId,
                  solution: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(
            `Error fetching solution for topicId ${topicId}: ${error.message}`,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch solution details',
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
