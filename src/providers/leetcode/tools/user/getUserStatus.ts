// src/providers/leetcode/tools/get_user_status.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetUserStatus');

/**
 * LeetCode tool to retrieve the current user's status.
 * This tool requires authentication.
 */
export class GetUserStatusTool extends BaseLeetCodeTool {
  public readonly name = 'get_user_status';
  public readonly description =
    "Retrieves the current user's status on LeetCode, including login status, premium membership details, and user information (requires authentication).";
  public readonly inputSchema = z.object({}); // No input parameters

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of the current user's status.
   * @returns A promise resolving to the user's status data.
   */
  public async execute(): Promise<any> {
    log.info('Executing get_user_status tool logic.');
    return await this.leetcodeService.fetchUserStatus();
  }
}
