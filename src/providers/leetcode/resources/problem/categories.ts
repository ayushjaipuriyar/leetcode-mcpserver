// src/providers/leetcode/resources/problemCategories.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { PROBLEM_CATEGORIES } from "../../../../utils/constants";
import { logger } from "../../../../utils/logger";

const log = logger('Resource: ProblemCategories');

/**
 * LeetCode resource providing a list of all problem classification categories.
 */
export class ProblemCategoriesResource {
  constructor(
    private readonly server: McpServer,
  ) {
    log.debug('ProblemCategoriesResource: Initializing resource');
    this.server.resource(
      "problem-categories",
      "categories://problems/all",
      {
        description:
          "A list of all problem classification categories in LeetCode platform, including difficulty levels (Easy, Medium, Hard) and algorithmic domains. These categories help organize and filter coding problems for users based on their complexity and topic area. Returns an array of all available problem categories.",
        mimeType: "application/json"
      },
      async (uri, extra) => {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: JSON.stringify(PROBLEM_CATEGORIES),
              mimeType: "application/json"
            }
          ]
        };
      }
    );
  }
}
