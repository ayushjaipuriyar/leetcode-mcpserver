// src/providers/leetcode/tools/index.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../utils/logger.js'; // Adjust path relative to this file
import { LeetCodeService } from '../service.js'; // Adjust path relative to this file
import { BaseLeetCodeTool } from './BaseLeetCodeTool.js';
import { GetUserContestRankingTool } from './contest/getUserContestRanking.js';
import { GetProblemTool } from './problem/getProblem.js';
import { GetDailyChallengeTool } from './problem/getsDailyChallenge.js';
import { SearchProblemsTool } from './problem/searchProblem.js';
import { GetProblemSolutionTool } from './solution/getProblemSolution.js';
import { ListProblemSolutionsTool } from './solution/listProblemSolution.js';
import { GetAllSubmissionsTool } from './user/getAllSubmission.js';
import { GetProblemProgressTool } from './user/getProblemProgress.js';
import { GetProblemSubmissionReportTool } from './user/getProblemSubmissionReport.js';
import { GetRecentACSubmissionsTool } from './user/getRecentAcSubmission.js';
import { GetRecentSubmissionsTool } from './user/getRecentSubmission.js';
import { GetUserProfileTool } from './user/getUserProfile.js';
import { GetUserStatusTool } from './user/getUserStatus.js';

// Export the base interface and abstract class for consistency and typing
export { BaseLeetCodeTool } from './BaseLeetCodeTool.js';
export { ILeetCodeTool } from './ILeetCodeTool.js';

// --- Central Registration Function ---

const log = logger('LeetCodeToolsBarrel');

/**
 * Instantiates and registers all defined LeetCode tools with the provided MCP server.
 * This is the central function to set up all LeetCode-related capabilities exposed via MCP.
 *
 * @param server The MCP server instance to register tools with.
 * @param leetcodeService The initialized LeetCodeService instance required by the tools.
 */
export function registerLeetCodeToolsWithServer(
  server: McpServer,
  leetcodeService: LeetCodeService,
): void {
  log.info(
    'Starting centralized registration of all LeetCode tools with MCP server.',
  );

  // Instantiate all concrete tool classes.
  // The array is explicitly typed to BaseLeetCodeTool[] to ensure type safety.
  const tools: BaseLeetCodeTool[] = [
    // Problem Tools
    new GetDailyChallengeTool(leetcodeService),
    new GetProblemTool(leetcodeService),
    new SearchProblemsTool(leetcodeService),

    // Contest Tools
    new GetUserContestRankingTool(leetcodeService),

    // Solution Tools
    new GetProblemSolutionTool(leetcodeService),
    new ListProblemSolutionsTool(leetcodeService),

    // User Tools
    new GetAllSubmissionsTool(leetcodeService),
    new GetProblemProgressTool(leetcodeService),
    new GetProblemSubmissionReportTool(leetcodeService),
    new GetRecentACSubmissionsTool(leetcodeService),
    new GetRecentSubmissionsTool(leetcodeService),
    new GetUserProfileTool(leetcodeService),
    new GetUserStatusTool(leetcodeService),

    // Add instances of any other LeetCode tool classes you create here
  ];

  // Loop through instantiated tools and register each one with the MCP server
  tools.forEach((tool: BaseLeetCodeTool) => {
    tool.register(server); // Call the registration method defined on BaseLeetCodeTool
  });

  log.info('All LeetCode tools successfully registered with MCP server.');
}
