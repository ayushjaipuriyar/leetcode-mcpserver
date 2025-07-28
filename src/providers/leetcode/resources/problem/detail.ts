import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../../utils/logger.js';
import { LeetCodeService } from '../../service.js';

const log = logger('Resource: ProblemDetail');

/**
 * LeetCode resource providing details about a specific problem by its slug.
 */
export class ProblemDetailResource {
  constructor(
    private readonly server: McpServer,
    private readonly leetcodeService: LeetCodeService,
  ) {
    log.debug('ProblemDetailResource: Initializing resource');
    this.server.resource(
      'problem-detail',
      new ResourceTemplate('problem://{titleSlug}', {
        list: undefined,
      }),
      {
        description:
          'Provides details about a specific LeetCode problem, including its description, examples, constraints, and metadata. The titleSlug parameter in the URI identifies the specific problem.',
        mimeType: 'application/json',
      },
      async (uri, variables, extra) => {
        const titleSlug = variables.titleSlug as string;
        try {
          const problemDetail =
            await this.leetcodeService.fetchProblem(titleSlug);
          return {
            contents: [
              {
                uri: uri.toString(),
                text: JSON.stringify({
                  titleSlug,
                  problem: problemDetail,
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
                  error: 'Failed to fetch problem detail',
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
