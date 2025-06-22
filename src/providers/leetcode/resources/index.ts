// src/providers/leetcode/resources/index.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../utils/logger.js';
import { LeetCodeService } from '../service.js'; // Adjust path relative to this file
import { ProblemCategoriesResource } from './problem/categories.js';
import { ProblemDetailResource } from './problem/detail.js';
import { ProblemLanguagesResource } from './problem/language.js';
import { ProblemTagsResource } from './problem/tags.js';
import { ProblemSolutionResource } from './solution/problemSolution.js';
// Export the base interface and abstract class for consistency and typing
export { ILeetCodeResource } from './ILeetCodeResource.js';

// Add more exports here as you create new resource files.

// --- Central Registration Function ---

const log = logger('LeetCodeResourcesBarrel');

/**
 * Instantiates and registers all defined LeetCode resources with the provided MCP server.
 * This is the central function to set up all LeetCode-related read-only capabilities exposed via MCP.
 *
 * @param server The MCP server instance to register resources with.
 * @param leetcodeService The initialized LeetCodeService instance required by the resources.
 */
export function registerLeetCodeResourcesWithServer(
  server: McpServer,
  leetcodeService: LeetCodeService,
): void {
  log.info(
    'Starting centralized registration of all LeetCode resources with MCP server.',
  );

  // Instantiate all concrete resource classes
  // const resources  = [
    // Explicitly type the array to BaseLeetCodeResource[] to ensure type safety.

    // Problem Resources
    new ProblemCategoriesResource(server),
    new ProblemTagsResource(server),
    new ProblemLanguagesResource(server),
    new ProblemDetailResource(server, leetcodeService),

    // NEW: Solution Resources
    new ProblemSolutionResource(server, leetcodeService), // Instantiate the new resource

    // Add instances of any other LeetCode resource classes you create here
  // ];

  log.info('All LeetCode resources successfully registered with MCP server.');
}
