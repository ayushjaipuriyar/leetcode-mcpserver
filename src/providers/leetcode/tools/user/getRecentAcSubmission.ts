// src/providers/leetcode/tools/get_recent_ac_submissions.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetRecentACSubmissions');

/**
 * LeetCode tool to retrieve a user's recent accepted submissions (Global-specific).
 */
export class GetRecentACSubmissionsTool extends BaseLeetCodeTool {
  public readonly name = 'get_recent_ac_submissions';
  public readonly description =
    "Retrieves a user's recent accepted (AC) submissions on LeetCode Global, focusing only on successfully completed problems.";
  public readonly inputSchema = z.object({
    username: z
      .string()
      .describe(
        'LeetCode username to retrieve recent accepted submissions for',
      ),
    limit: z
      .number()
      .optional()
      .default(10)
      .describe(
        'Maximum number of accepted submissions to return (optional, defaults to 10)',
      ),
  });

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of recent accepted submissions.
   * @param args Contains `username` and `limit`.
   * @returns A promise resolving to the recent accepted submissions data.
   */
  public async execute(args: {
    username: string;
    limit?: number;
  }): Promise<any> {
    log.info(
      `Executing get_recent_ac_submissions tool logic for username: ${args.username}, limit: ${args.limit}`,
    );
    return await this.leetcodeService.fetchUserRecentACSubmissions(
      args.username,
      args.limit,
    );
  }
}
