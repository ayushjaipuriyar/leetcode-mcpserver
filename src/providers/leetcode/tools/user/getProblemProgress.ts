// src/providers/leetcode/tools/get_problem_progress.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetProblemProgress');

/**
 * LeetCode tool to retrieve the current user's problem-solving progress.
 * This tool requires authentication.
 */
export class GetProblemProgressTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem_progress';
  public readonly description =
    "Retrieves the current user's problem-solving status with filtering options, including detailed solution history for attempted or solved questions (requires authentication).";
  public readonly inputSchema = z.object({
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
  });

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of user problem progress.
   * @param args The filter options for problem progress.
   * @returns A promise resolving to the user's problem progress data.
   */
  public async execute(args: {
    offset?: number;
    limit?: number;
    questionStatus?: 'ATTEMPTED' | 'SOLVED';
    difficulty?: string[];
  }): Promise<any> {
    log.info(
      `Executing get_problem_progress tool logic with args: ${JSON.stringify(args)}`,
    );
    return await this.leetcodeService.fetchUserProgressQuestionList(args);
  }
}
