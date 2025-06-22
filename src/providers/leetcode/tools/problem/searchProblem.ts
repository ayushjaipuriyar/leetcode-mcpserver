// src/providers/leetcode/tools/searchProblem.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import {
  PROBLEM_CATEGORIES,
  PROBLEM_TAGS,
} from '../../../../utils/constants.js'; // Adjust path
import { logger } from '../../../../utils/logger.js'; // Adjust path
import { LeetCodeService } from '../../service.js'; // Adjust path
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Ensure .js for module resolution

const log = logger('Tool: SearchProblems');

/**
 * LeetCode tool to search for problems based on various criteria.
 */
export class SearchProblemsTool extends BaseLeetCodeTool {
  public readonly name = 'search_problems';
  public readonly description =
    'Searches for LeetCode problems based on multiple filter criteria including categories, tags, difficulty levels, and keywords, with pagination support.';

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
      {
        category: z
          .enum(PROBLEM_CATEGORIES as [string, ...string[]])
          .default('all-code-essentials')
          .describe(
            "Problem category filter (e.g., 'algorithms', 'database', 'shell') to narrow down the problem domain",
          ),
        tags: z
          .array(z.enum(PROBLEM_TAGS as [string, ...string[]]))
          .optional()
          .describe(
            "List of topic tags to filter problems by (e.g., ['array', 'dynamic-programming', 'tree'])",
          ),
        difficulty: z
          .enum(['EASY', 'MEDIUM', 'HARD'])
          .optional()
          .describe(
            'Problem difficulty level filter to show only problems of a specific difficulty',
          ),
        searchKeywords: z
          .string()
          .optional()
          .describe('Keywords to search in problem titles and descriptions'),
        limit: z
          .number()
          .optional()
          .default(10)
          .describe(
            'Maximum number of problems to return in a single request (for pagination)',
          ),
        offset: z
          .number()
          .optional()
          .describe('Number of problems to skip (for pagination)'),
      },
      async (args) => {
        // Use 'args' directly as it contains all parsed inputs
        log.info(
          `Searching problems with filters: ${JSON.stringify(args)}`, // Clarified log message
        );
        try {
          const data = await this.leetcodeService.searchProblems(
            args.category,
            args.tags,
            args.difficulty,
            args.limit,
            args.offset,
            args.searchKeywords,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  filters: {
                    category: args.category,
                    tags: args.tags,
                    difficulty: args.difficulty,
                    searchKeywords: args.searchKeywords,
                  },
                  pagination: {
                    limit: args.limit,
                    offset: args.offset,
                  },
                  problems: data,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error searching problems: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to search problems',
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
