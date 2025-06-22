import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js'; // Assuming this imports the LeetCodeService class
import { BaseLeetCodeTool } from '../BaseLeetCodeTool.js';

const log = logger('Tool: SubmitLeetCodeSolution');

/**
 * Tool for submitting code to LeetCode and polling for the result.
 *
 * IMPORTANT: This tool uses unofficial LeetCode APIs and is for
 * educational purposes ONLY. Direct programmatic submission likely violates
 * LeetCode's Terms of Service and may lead to account suspension.
 * Ensure your LeetCodeService instance is properly configured with
 * `csrfToken` and `sessionCookie` for authentication.
 */
export class SubmitLeetCodeSolutionTool extends BaseLeetCodeTool {
  public readonly name = 'submit_leetcode_solution';
  public readonly description =
    'Submits solution code to a specific LeetCode problem and returns the execution result. Requires authentication.';

  /**
   * Initializes the tool with a LeetCodeService instance.
   * The LeetCodeService should be pre-configured with authentication details (CSRF token, session cookie).
   * @param leetcodeService An instance of LeetCodeService.
   */
  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Registers this tool with the MCP server, defining its input schema and execution logic.
   * @param server The MCP server instance to register the tool with.
   */
  public register(server: McpServer): void {
    server.tool(
      this.name,
      this.description,
      // Define the input schema for the submission
      {
        code: z.string().describe('The solution code to submit.'),
        language: z
          .string()
          .describe(
            "The programming language of the code (e.g., 'python3', 'java', 'cpp').",
          ),
        questionId: z
          .string()
          .describe("The numeric ID of the question (e.g., '1' for Two Sum)."),
        questionSlug: z
          .string()
          .describe(
            "The URL slug of the question (e.g., 'two-sum' for Two Sum).",
          ),
      },
      async (input) => {
        // 'input' contains all validated arguments from the schema
        const { code, language, questionId, questionSlug } = input;

        log.info(
          `Attempting to submit solution for ${questionSlug} (ID: ${questionId})...`,
        );

        try {
          // Call the submitLeetCodeSolution method from the injected LeetCodeService
          const result = await this.leetcodeService.submitLeetCodeSolution(
            code,
            language,
            questionId,
            questionSlug,
          );

          // Return the result in the MCP server's expected content format
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result),
              },
            ],
          };
        } catch (error: any) {
          log.error('Error submitting LeetCode solution', error);
          // Handle errors and return them in the expected format
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: 'Failed to submit LeetCode solution',
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
