// src/providers/leetcode/tools/get_problem_progress.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Added McpServer import
import z from 'zod';
import { logger } from '../../../../utils/logger.js'; // Added .js
import { LeetCodeService } from '../../service.js'; // Added .js
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Added .js

const log = logger('Tool: GetProblemProgress');

/**
 * LeetCode tool to retrieve the current user's problem-solving progress.
 * This tool requires authentication.
 */
export class GetProblemProgressTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem_progress';
  public readonly description =
    "Retrieves the current user's problem-solving status with filtering options, including detailed solution history for attempted or solved questions (requires authentication).";

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
        offset: z
          .number()
          .default(0)
          .describe('The number of questions to skip for pagination purposes'),
        limit: z
          .number()
          .default(100)
          .describe(
            'The maximum number of questions to return in a single request',
          ),
        questionStatus: z
          .enum(['ATTEMPTED', 'SOLVED'])
          .optional()
          .describe(
            "Filter by question status: 'ATTEMPTED' for questions that have been tried but not necessarily solved, 'SOLVED' for questions that have been successfully completed",
          ),
        difficulty: z
          .array(z.string())
          .optional()
          .describe(
            "Filter by difficulty levels as an array (e.g., ['EASY', 'MEDIUM', 'HARD']); if not provided, questions of all difficulty levels will be returned",
          ),
      },
      async (args) => {
        // 'args' contains all validated input parameters
        log.info(
          `Fetching problem progress with filters: ${JSON.stringify(args)}`, // Clarified log message
        );
        try {
          const progressQuestions =
            await this.leetcodeService.fetchUserProgressQuestionList(args);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  filters: args, // Return the applied filters for context
                  questions: progressQuestions,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(`Error fetching problem progress: ${error.message}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch user problem progress',
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
