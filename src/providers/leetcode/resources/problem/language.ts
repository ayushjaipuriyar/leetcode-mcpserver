import { McpServer } from '@modelcontextprotocol/sdk/server/mcp';
import { PROGRAMMING_LANGS } from '../../../../utils/constants';
import { logger } from '../../../../utils/logger';

const log = logger('Resource: ProblemLanguages');

/**
 * LeetCode resource providing a complete list of all supported programming languages.
 */
export class ProblemLanguagesResource {
  constructor(
    private readonly server: McpServer,
  ) {
    this.server.resource(
      'problem-langs',
      'langs://problems/all',
      {
        description:
          'A complete list of all programming languages officially supported by LeetCode for code submission and problem solving. Returns an array of all available programming languages on the platform.',
        mimeType: 'application/json',
      },
      async (uri, extra) => {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: JSON.stringify(PROGRAMMING_LANGS),
              mimeType: 'application/json',
            },
          ],
        };
      },
    );
  }
}
