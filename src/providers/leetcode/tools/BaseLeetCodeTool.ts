// src/providers/leetcode/tools/BaseLeetCodeTool.ts

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { logger } from '../../../utils/logger.js'; // Adjust path based on your tree
import { LeetCodeService } from '../service.js'; // Adjust path based on your tree
import { ILeetCodeTool } from './ILeetCodeTool.js'; // Ensure .js for module resolution

const log = logger('BaseLeetCodeTool');

/**
 * Abstract base class for all concrete LeetCode tools.
 * It provides the fundamental structure, handles the injection of the `LeetCodeService`,
 * and offers a utility method to register the tool directly with an `McpServer`.
 */
export abstract class BaseLeetCodeTool implements ILeetCodeTool {
  // These properties must be implemented by concrete subclasses
  public abstract readonly name: string;
  public abstract readonly description: string;

  /**
   * The LeetCodeService instance, which provides access to LeetCode API methods.
   * Protected to allow access in derived classes.
   */
  protected readonly leetcodeService: LeetCodeService;

  /**
   * Constructs a new instance of a base LeetCode tool.
   *
   * @param leetcodeService The initialized `LeetCodeService` instance.
   * @throws {Error} If `leetcodeService` is not provided.
   */
  constructor(leetcodeService: LeetCodeService) {
    if (!leetcodeService) {
      log.error(
        `BaseLeetCodeTool: Constructor received an invalid LeetCodeService.`,
      );
      throw new Error('A valid LeetCodeService must be provided to the tool.');
    }
    this.leetcodeService = leetcodeService;
    log.debug(`BaseLeetCodeTool: Instance created.`);
  }
  public abstract register(server: McpServer): void;
}
