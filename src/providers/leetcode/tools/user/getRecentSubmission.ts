// src/providers/leetcode/tools/get_recent_submissions.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetRecentSubmissions');

/**
 * LeetCode tool to retrieve a user's recent submissions (Global-specific).
 */
export class GetRecentSubmissionsTool extends BaseLeetCodeTool {
  public readonly name = 'get_recent_submissions';
  public readonly description =
    "Retrieves a user's recent submissions on LeetCode Global, including both accepted and failed submissions with detailed metadata.";
  public readonly inputSchema = z.object({
    username: z
      .string()
      .describe('LeetCode username to retrieve recent submissions for'),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe(
        'Maximum number of submissions to return (optional, defaults to 10)',
      ),
  });

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of recent submissions.
   * @param args Contains `username` and `limit`.
   * @returns A promise resolving to the recent submissions data.
   */
  public async execute(args: {
    username: string;
    limit?: number;
  }): Promise<any> {
    log.info(
      `Executing get_recent_submissions tool logic for username: ${args.username}, limit: ${args.limit}`,
    );
    return await this.leetcodeService.fetchUserRecentSubmissions(
      args.username,
      args.limit,
    );
  }
}
