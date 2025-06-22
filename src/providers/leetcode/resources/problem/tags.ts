// src/providers/leetcode/resources/problemTags.ts

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { PROBLEM_TAGS } from "../../../../utils/constants";
import { logger } from "../../../../utils/logger";

const log = logger('Resource: ProblemTags');

/**
 * LeetCode resource providing a detailed collection of algorithmic and data structure tags.
 */
export class ProblemTagsResource {
  private server: any;

  constructor(server: McpServer) {
    this.server = server;
    this.server.resource(
      "problem-tags",
      "tags://problems/all",
      {
        description:
          "A detailed collection of algorithmic and data structure tags used by LeetCode to categorize problems. These tags represent specific algorithms (like 'dynamic-programming', 'binary-search') or data structures (such as 'array', 'queue', 'tree') that are relevant to solving each problem. Returns an array of all available problem tags for filtering and searching problems.",
        mimeType: "application/json"
      },
      async (uri: any, extra: any) => {
        return {
          contents: [
            {
              uri: uri.toString(),
              text: JSON.stringify(PROBLEM_TAGS),
              mimeType: "application/json"
            }
          ]
        };
      }
    );
  }
}
