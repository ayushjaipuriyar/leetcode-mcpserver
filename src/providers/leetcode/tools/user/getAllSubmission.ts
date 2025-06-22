// src/providers/leetcode/tools/get_all_submissions.ts

import z from 'zod';
import { PROGRAMMING_LANGS } from '../../../../utils/constants';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetAllSubmissions');

/**
 * Tool for fetching user submissions with optional filters.
 * Works for both Global and China LeetCode based on service implementation.
 */
export const GetAllSubmissionsTool = BaseLeetCodeTool.create({
  name: 'get_all_submissions',
  description:
    'Retrieves a paginated list of user submissions for a specific problem or all problems, with filtering options. Requires authentication.',
  inputSchema: z.object({
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
      .describe("Slug of the problem to filter submissions (e.g., 'two-sum')"),
    lang: z
      .enum(PROGRAMMING_LANGS as [string])
      .optional()
      .describe("Programming language filter (e.g., 'python3', 'cpp', 'java')"),
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
  }),
  async run({
    input,
    services,
  }: {
    input: z.infer<typeof this.inputSchema>;
    services: { leetcode: LeetCodeService };
  }) {
    const { limit, offset, questionSlug, lang, status, lastKey } = input;

    try {
      const result = await services.leetcode.fetchUserAllSubmissions({
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
});
