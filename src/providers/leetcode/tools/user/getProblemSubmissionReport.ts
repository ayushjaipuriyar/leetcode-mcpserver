// src/providers/leetcode/tools/get_problem_submission_report.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'; // Added McpServer import
import z from 'zod';
import { logger } from '../../../../utils/logger.js'; // Added .js
import { LeetCodeService } from '../../service.js'; // Added .js
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js'; // Added .js

const log = logger('Tool: GetProblemSubmissionReport');

/**
 * LeetCode tool to retrieve detailed information about a specific submission.
 * This tool requires authentication.
 */
export class GetProblemSubmissionReportTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem_submission_report';
  public readonly description =
    'Retrieves detailed information about a specific LeetCode submission by its ID, including source code, runtime stats, and test results (requires authentication).';

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
        id: z
          .number()
          .describe(
            'The numerical submission ID to retrieve detailed information for',
          ),
      },
      async ({ id }) => {
        // Destructure id from args
        log.info(`Fetching submission report for ID: ${id}`); // Clarified log message
        try {
          const submissionDetail =
            await this.leetcodeService.fetchUserSubmissionDetail(id);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  submissionId: id,
                  detail: submissionDetail,
                }),
              },
            ],
          };
        } catch (error: any) {
          log.error(
            `Error fetching submission report for ID ${id}: ${error.message}`,
          );
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to fetch submission details',
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
