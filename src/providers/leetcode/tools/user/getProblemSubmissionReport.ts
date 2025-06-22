// src/providers/leetcode/tools/get_problem_submission_report.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';


const log = logger('Tool: GetProblemSubmissionReport');

/**
 * LeetCode tool to retrieve detailed information about a specific submission.
 * This tool requires authentication.
 */
export class GetProblemSubmissionReportTool extends BaseLeetCodeTool {
  public readonly name = 'get_problem_submission_report';
  public readonly description =
    'Retrieves detailed information about a specific LeetCode submission by its ID, including source code, runtime stats, and test results (requires authentication).';
  public readonly inputSchema = z.object({
    id: z
      .number()
      .describe(
        'The numerical submission ID to retrieve detailed information for',
      ),
  });

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of submission details.
   * @param args Contains `id` of the submission.
   * @returns A promise resolving to the submission detail data.
   */
  public async execute(args: { id: number }): Promise<any> {
    log.info(
      `Executing get_problem_submission_report tool logic for ID: ${args.id}`,
    );
    return await this.leetcodeService.fetchUserSubmissionDetail(args.id);
  }
}
