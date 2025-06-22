// src/providers/leetcode/resources/problemSolution.ts

import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';

const log = logger('Resource: ProblemSolution');

/**
 * LeetCode resource providing the complete content and metadata of a specific problem solution (Global-specific).
 * This resource is accessed via a `topicId`.
 */
export class ProblemSolutionResource {
  constructor(
    private readonly server: McpServer,
    private readonly leetcodeService: LeetCodeService,
  ) {
    log.debug('ProblemSolutionResource: Initializing resource');
    this.server.resource(
      'problem-solution',
      new ResourceTemplate('solution://{topicId}', {
        list: undefined,
      }),
      {
        description:
          "Provides the complete content and metadata of a specific problem solution, including the full article text, author information, and related navigation links. The topicId parameter in the URI identifies the specific solution. This ID can be obtained from the 'topicId' field in the response of the 'list_problem_solutions' tool.",
        mimeType: 'application/json',
      },
      async (uri, variables, extra) => {
        const topicId = variables.topicId as string;
        try {
          const solutionDetail =
            await this.leetcodeService.fetchSolutionArticleDetail(topicId);
          return {
            contents: [
              {
                uri: uri.toString(),
                text: JSON.stringify({
                  topicId,
                  solution: solutionDetail,
                }),
                mimeType: 'application/json',
              },
            ],
          };
        } catch (error: any) {
          return {
            contents: [
              {
                uri: uri.toString(),
                text: JSON.stringify({
                  error: 'Failed to fetch solution',
                  message: error.message,
                }),
                mimeType: 'application/json',
              },
            ],
          };
        }
      },
    );
  }
}
