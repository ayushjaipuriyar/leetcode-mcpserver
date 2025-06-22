// src/providers/leetcode/tools/get_all_submissions.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Import McpServer
import { z } from 'zod';
import { PROGRAMMING_LANGS } from '../../../../utils/constants.js'; // Ensure .js extension
import { logger } from '../../../../utils/logger.js'; // Ensure .js extension
import { LeetCodeService } from '../../service.js'; // Ensure .js extension
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Ensure .js extension

const log = logger('Tool: GetAllSubmissions');

/**
 * Tool for fetching user submissions with optional filters.
 * Works for both Global and China LeetCode based on service implementation.
 */
export class GetAllSubmissionsTool extends BaseLeetCodeTool {
  // Changed to a class
  public readonly name = 'get_all_submissions';
  public readonly description =
    'Retrieves a paginated list of user submissions for a specific problem or all problems, with filtering options. Requires authentication.';

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
      // Define the input schema directly here
      {
        limit: z
          .number()
          .default(20)
          .describe(
            'Maximum number of submissions to return per page (defaults to 20)',
          ),
        offset: z
          .number()
          .default(0)
          .describe('Number of submissions to skip for pagination'),
        questionSlug: z
          .string()
          .optional()
          .describe(
            "Slug of the problem to filter submissions (e.g., 'two-sum')",
          ),
        lang: z
          .enum(PROGRAMMING_LANGS as [string, ...string[]]) // Ensure enum type is correct for array
          .optional()
          .describe(
            "Programming language filter (e.g., 'python3', 'cpp', 'java')",
          ),
        status: z
          .enum(['AC', 'WA'])
          .optional()
          .describe(
            "Submission status filter: 'AC' for Accepted, 'WA' for Wrong Answer",
          ),
        lastKey: z
          .string()
          .optional()
          .describe(
            'Pagination token from previous response for fetching next page (LeetCode CN only)',
          ),
      },
      async (input) => {
        // 'input' contains all validated arguments
        const { limit, offset, questionSlug, lang, status, lastKey } = input;

        log.info(
          `Fetching all submissions with filters: ${JSON.stringify(input)}`,
        );

        try {
          const result = await this.leetcodeService.fetchUserAllSubmissions({
            limit,
            offset,
            questionSlug,
            lang,
            status,
            lastKey,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        } catch (error: any) {
          log.error('Error fetching submissions', error);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch user submissions',
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
