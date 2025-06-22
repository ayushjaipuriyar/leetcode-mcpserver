// src/providers/leetcode/tools/list_problem_solutions.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Import McpServer
import z from 'zod';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js';

const log = logger('Tool: ListProblemSolutions');

/**
 * LeetCode tool to retrieve a list of community solutions for a specific problem (Global-specific).
 */
export class ListProblemSolutionsTool extends BaseLeetCodeTool {
  public readonly name = 'list_problem_solutions';
  public readonly description =
    "Retrieves a list of community solutions for a specific LeetCode problem, including only metadata like topicId. To view the full content of a solution, use the 'get_problem_solution' tool with the topicId returned by this tool.";

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
        questionSlug: z
          .string()
          .describe(
            "The URL slug/identifier of the problem to retrieve solutions for (e.g., 'two-sum', 'add-two-numbers'). This is the same string that appears in the LeetCode problem URL after '/problems/'",
          ),
        limit: z
          .number()
          .optional()
          .default(10)
          .describe(
            'Maximum number of solutions to return per request. Used for pagination and controlling response size. Default is 10 if not specified. Must be a positive integer.',
          ),
        skip: z
          .number()
          .optional()
          .default(0)
          .describe(
            "Number of solutions to skip before starting to collect results. Used in conjunction with 'limit' for implementing pagination. Default is 0. Must be a non-negative integer.",
          ),
        orderBy: z
          .enum(['HOT', 'MOST_RECENT', 'MOST_VOTES'])
          .optional()
          .default('HOT')
          .describe(
            "Sorting criteria for the returned solutions. 'HOT' prioritizes trending solutions, 'MOST_VOTES' sorts by upvotes, and 'MOST_RECENT' sorts by newest publication date.",
          ),
        userInput: z
          .string()
          .optional()
          .describe(
            'Search term to filter solutions by title, content, or author name. Case insensitive.',
          ),
        tagSlugs: z
          .array(z.string())
          .optional()
          .default([])
          .describe(
            "Array of tag identifiers to filter solutions by programming languages or problem tags (e.g., 'python', 'dynamic-programming').",
          ),
      },
      async (args) => {
        // 'args' contains all validated input parameters
        const {
          questionSlug,
          limit = 10,
          skip = 0,
          orderBy = 'HOT',
          userInput,
          tagSlugs = [],
        } = args;

        log.info(
          `Fetching solutions for questionSlug=${questionSlug} with options: ${JSON.stringify({ limit, skip, orderBy, userInput, tagSlugs })}`,
        ); // More detailed log

        try {
          const options = {
            limit,
            skip,
            orderBy,
            userInput,
            tagSlugs,
          };

          const data = await this.leetcodeService.fetchQuestionSolutionArticles(
            questionSlug,
            options,
          );

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  questionSlug,
                  solutionArticles: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error('Error while fetching LeetCode solutions:', error);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch solutions',
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
