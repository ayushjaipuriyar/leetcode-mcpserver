// src/providers/leetcode/tools/get_user_profile.ts

import z from 'zod';
import { logger } from '../../../../utils/logger';
import { LeetCodeService } from '../../service';
import { BaseLeetCodeTool } from '../BaseLeetCodeTool';

const log = logger('Tool: GetUserProfile');

/**
 * LeetCode tool to retrieve profile information about a specific user.
 */
export class GetUserProfileTool extends BaseLeetCodeTool {
  public readonly name = 'get_user_profile';
  public readonly description =
    'Retrieves profile information about a LeetCode user, including user stats, solved problems, and profile details.';
  public readonly inputSchema = z.object({
    username: z
      .string()
      .describe('LeetCode username to retrieve profile information for'),
  });

  constructor(leetcodeService: LeetCodeService) {
    super(leetcodeService);
  }

  /**
   * Executes the retrieval of a user's profile.
   * @param args Contains `username`.
   * @returns A promise resolving to the user's profile data.
   */
  public async execute(args: { username: string }): Promise<any> {
    log.info(
      `Executing get_user_profile tool logic for username: ${args.username}`,
    );
    return await this.leetcodeService.fetchUserProfile(args.username);
  }
}
