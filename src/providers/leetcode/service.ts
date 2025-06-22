// leetcode/leetcode-service.ts

import { Credential, LeetCode } from 'leetcode-query';
import { logger } from '../../utils/logger';
import { SEARCH_PROBLEMS_QUERY } from './queries/searchProblem';
import { SOLUTION_ARTICLE_DETAIL_QUERY } from './queries/solutionArticleDetail';
import { SOLUTION_ARTICLES_QUERY } from './queries/solutionArticles';

const LOGGER_CONTEXT = 'LeetCodeService';
const log = logger(LOGGER_CONTEXT);

/**
 * Service class for interacting exclusively with the LeetCode Global API.
 * This class handles credential initialization, manages the LeetCode API client,
 * and provides all methods for fetching data and interacting with the LeetCode platform.
 */
export class LeetCodeService {
  private readonly credential: Credential;
  private readonly leetCodeApi: LeetCode;
  private initialized: boolean = false; // Track initialization status

  /**
   * Private constructor to enforce the use of the static `create` factory method.
   * This ensures that the service is always fully initialized before being used.
   *
   * @param sessionCookie The LeetCode session cookie.
   */
  private constructor(sessionCookie: string) {
    if (!sessionCookie || sessionCookie.trim() === '') {
      log.error(
        'Private constructor received an empty or invalid session cookie. This should be caught by create method.',
      );
      throw new Error('Session cookie cannot be empty.'); // Should ideally not be hit if `create` validates
    }
    this.credential = new Credential();
    // The LeetCode API instance is created here, but its credential will be initialized
    // in the async init method.
    this.leetCodeApi = new LeetCode(this.credential);
  }

  /**
   * Static async factory method to create and fully initialize a LeetCodeService instance.
   * This is the recommended and safest way to obtain a ready-to-use service.
   *
   * @param sessionCookie The LeetCode session cookie.
   * @returns A promise that resolves to a fully initialized LeetCodeService instance.
   * @throws {Error} If the session cookie is invalid, initialization fails, or API client setup encounters an issue.
   */
  public static async create(sessionCookie: string): Promise<LeetCodeService> {
    log.info(`Attempting to create and initialize ${LOGGER_CONTEXT}.`);

    if (!sessionCookie || sessionCookie.trim() === '') {
      log.error(
        '`create` method received an empty or invalid session cookie. Authentication will not be possible.',
      );
      // You might choose to throw here or proceed in unauthenticated mode,
      // depending on your application's requirements. Throwing is generally safer.
      throw new Error(
        'Session cookie cannot be empty for LeetCodeService initialization.',
      );
    }

    const service = new LeetCodeService(sessionCookie);
    try {
      await service.init(sessionCookie); // Initialize the internal credential
      log.info(`${LOGGER_CONTEXT} initialized successfully.`);
      return service;
    } catch (error) {
      log.error(
        `Failed to initialize ${LOGGER_CONTEXT}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(
        `Failed to initialize LeetCodeService: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Internal method to initialize the LeetCode credential.
   * Called by the static `create` method. It's idempotent.
   *
   * @param sessionCookie The LeetCode session cookie.
   */
  private async init(sessionCookie: string): Promise<void> {
    if (this.initialized) {
      log.warn(
        'Attempted to re-initialize LeetCodeService credential. Skipping subsequent initialization.',
      );
      return;
    }

    try {
      log.debug('Initializing LeetCode credential...');
      await this.credential.init(sessionCookie); // Initialize the credential using the session cookie
      this.initialized = true;
      log.debug('LeetCode credential initialized successfully.');
    } catch (error) {
      this.initialized = false; // Ensure `initialized` is false on failure
      log.error(
        `Error during LeetCode credential initialization: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new Error(
        `Failed to initialize LeetCode credential: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Checks if the service is authenticated (i.e., if the credential is valid).
   * @returns {boolean} True if authenticated, false otherwise.
   */
  public isAuthenticated(): boolean {
    return (
      this.initialized && // Must be initialized first
      !!this.credential &&
      !!this.credential.csrf && // Check for actual credential values
      !!this.credential.session
    );
  }

  // --- LeetCode API Methods (from LeetCodeGlobalService) ---

  public async fetchUserSubmissionDetail(id: number): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Authentication required to fetch user submission detail',
      );
    }
    log.debug(`Fetching user submission detail for ID: ${id}`);
    return await this.leetCodeApi.submission(id);
  }

  public async fetchUserStatus(): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required to fetch user status');
    }
    log.debug('Fetching user status.');
    return await this.leetCodeApi.whoami().then((res) => {
      return {
        isSignedIn: res?.isSignedIn ?? false,
        username: res?.username ?? '',
        avatar: res?.avatar ?? '',
        isAdmin: res?.isAdmin ?? false,
      };
    });
  }

  public async fetchUserAllSubmissions(options: {
    offset: number;
    limit: number;
    questionSlug?: string;
    lastKey?: string;
    lang?: string;
    status?: string;
  }): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required to fetch user submissions');
    }
    log.debug(
      `Fetching all user submissions with options: ${JSON.stringify(options)}`,
    );
    const submissions = await this.leetCodeApi.submissions({
      offset: options.offset ?? 0,
      limit: options.limit ?? 20,
      slug: options.questionSlug,
    });
    return { submissions };
  }

  public async fetchUserRecentSubmissions(
    username: string,
    limit?: number,
  ): Promise<any> {
    log.debug(
      `Fetching recent submissions for user: ${username}, limit: ${limit}`,
    );
    return await this.leetCodeApi.recent_submissions(username, limit);
  }

  public async fetchUserRecentACSubmissions(
    username: string,
    limit?: number,
  ): Promise<any> {
    log.debug(
      `Fetching recent AC submissions for user: ${username}, limit: ${limit}`,
    );
    return await this.leetCodeApi.graphql({
      query: `
                query ($username: String!, $limit: Int) {
                    recentAcSubmissionList(username: $username, limit: $limit) {
                        id
                        title
                        titleSlug
                        time
                        timestamp
                        statusDisplay
                        lang
                    }
                }
            `,
      variables: {
        username,
        limit,
      },
    });
  }

  public async fetchUserProfile(username: string): Promise<any> {
    log.debug(`Fetching user profile for: ${username}`);
    const profile = await this.leetCodeApi.user(username);
    if (profile && profile.matchedUser) {
      const { matchedUser } = profile;

      return {
        username: matchedUser.username,
        realName: matchedUser.profile.realName,
        userAvatar: matchedUser.profile.userAvatar,
        countryName: matchedUser.profile.countryName,
        githubUrl: matchedUser.githubUrl,
        company: matchedUser.profile.company,
        school: matchedUser.profile.school,
        ranking: matchedUser.profile.ranking,
        totalSubmissionNum: matchedUser.submitStats?.totalSubmissionNum,
      };
    }
    return profile;
  }

  public async fetchUserContestRanking(
    username: string,
    attended: boolean = true,
  ): Promise<any> {
    log.debug(
      `Fetching user contest ranking for: ${username}, attended: ${attended}`,
    );
    const contestInfo = await this.leetCodeApi.user_contest_info(username);
    if (contestInfo.userContestRankingHistory && attended) {
      contestInfo.userContestRankingHistory =
        contestInfo.userContestRankingHistory.filter((contest: any) => {
          return contest && contest.attended;
        });
    }
    return contestInfo;
  }

  public async fetchDailyChallenge(): Promise<any> {
    log.debug('Fetching daily challenge.');
    const dailyChallenge = await this.leetCodeApi.daily();
    return dailyChallenge;
  }

  public async fetchProblem(titleSlug: string): Promise<any> {
    log.debug(`Fetching problem for slug: ${titleSlug}`);
    const problem = await this.leetCodeApi.problem(titleSlug);
    return problem;
  }

  public async fetchProblemSimplified(titleSlug: string): Promise<any> {
    log.debug(`Fetching simplified problem for slug: ${titleSlug}`);
    const problem = await this.fetchProblem(titleSlug); // Re-use fetchProblem
    if (!problem) {
      throw new Error(`Problem ${titleSlug} not found`);
    }

    const filteredTopicTags =
      problem.topicTags?.map((tag: any) => tag.slug) || [];
    const filteredCodeSnippets =
      problem.codeSnippets?.filter((snippet: any) =>
        ['cpp', 'python3', 'java'].includes(snippet.langSlug),
      ) || [];

    let parsedSimilarQuestions: any[] = [];
    if (problem.similarQuestions) {
      try {
        const allQuestions = JSON.parse(problem.similarQuestions);
        parsedSimilarQuestions = allQuestions
          .slice(0, 3) // Limiting similar questions to 3 for conciseness
          .map((q: any) => ({
            titleSlug: q.titleSlug,
            difficulty: q.difficulty,
          }));
      } catch (e) {
        log.error('Error parsing similarQuestions: %s', e);
      }
    }

    return {
      titleSlug,
      questionId: problem.questionId,
      title: problem.title,
      content: problem.content,
      difficulty: problem.difficulty,
      topicTags: filteredTopicTags,
      codeSnippets: filteredCodeSnippets,
      exampleTestcases: problem.exampleTestcases,
      hints: problem.hints,
      similarQuestions: parsedSimilarQuestions,
    };
  }

  public async searchProblems(
    category?: string,
    tags?: string[],
    difficulty?: string,
    limit: number = 10,
    offset: number = 0,
    searchKeywords?: string,
  ): Promise<any> {
    log.debug(
      `Searching problems with category: ${category}, tags: ${tags}, difficulty: ${difficulty}, limit: ${limit}, offset: ${offset}, keywords: ${searchKeywords}`,
    );
    const filters: any = {};
    if (difficulty) {
      filters.difficulty = difficulty.toUpperCase();
    }
    if (tags && tags.length > 0) {
      filters.tags = tags;
    }
    if (searchKeywords) {
      filters.searchKeywords = searchKeywords;
    }

    const response = await this.leetCodeApi.graphql({
      query: SEARCH_PROBLEMS_QUERY,
      variables: {
        categorySlug: category,
        limit,
        skip: offset,
        filters,
      },
    });

    const questionList = response.data?.problemsetQuestionList;
    if (!questionList) {
      return {
        total: 0,
        questions: [],
      };
    }
    return {
      total: questionList.total,
      questions: questionList.questions.map((question: any) => ({
        title: question.title,
        titleSlug: question.titleSlug,
        difficulty: question.difficulty,
        acRate: question.acRate,
        topicTags: question.topicTags.map((tag: any) => tag.slug),
      })),
    };
  }

  public async fetchUserProgressQuestionList(options?: {
    offset?: number;
    limit?: number;
    questionStatus?: string;
    difficulty?: string[];
  }): Promise<any> {
    if (!this.isAuthenticated()) {
      throw new Error(
        'Authentication required to fetch user progress question list',
      );
    }
    log.debug(
      `Fetching user progress question list with options: ${JSON.stringify(options)}`,
    );
    const filters = {
      skip: options?.offset || 0,
      limit: options?.limit || 20,
      questionStatus: options?.questionStatus as any,
      difficulty: options?.difficulty as any[],
    };

    return await this.leetCodeApi.user_progress_questions(filters);
  }

  public async fetchQuestionSolutionArticles(
    questionSlug: string,
    options?: any,
  ): Promise<any> {
    log.debug(
      `Fetching solution articles for problem: ${questionSlug}, options: ${JSON.stringify(options)}`,
    );
    const variables: any = {
      questionSlug,
      first: options?.limit || 5,
      skip: options?.skip || 0,
      orderBy: options?.orderBy || 'HOT',
      userInput: options?.userInput,
      tagSlugs: options?.tagSlugs ?? [],
    };

    return await this.leetCodeApi
      .graphql({
        query: SOLUTION_ARTICLES_QUERY,
        variables,
      })
      .then((res) => {
        const ugcArticleSolutionArticles = res.data?.ugcArticleSolutionArticles;
        if (!ugcArticleSolutionArticles) {
          return {
            totalNum: 0,
            hasNextPage: false,
            articles: [],
          };
        }
        const data = {
          totalNum: ugcArticleSolutionArticles?.totalNum || 0,
          hasNextPage:
            ugcArticleSolutionArticles?.pageInfo?.hasNextPage || false,
          articles:
            ugcArticleSolutionArticles?.edges
              ?.map((edge: any) => {
                if (edge?.node && edge.node.topicId && edge.node.slug) {
                  edge.node.articleUrl = `https://leetcode.com/problems/${questionSlug}/solutions/${edge.node.topicId}/${edge.node.slug}`;
                }
                return edge.node;
              })
              .filter((node: any) => node && node.canSee) || [],
        };

        return data;
      });
  }

  public async fetchSolutionArticleDetail(topicId: string): Promise<any> {
    log.debug(`Fetching solution article detail for topicId: ${topicId}`);
    return await this.leetCodeApi
      .graphql({
        query: SOLUTION_ARTICLE_DETAIL_QUERY,
        variables: {
          topicId,
        },
      })
      .then((response) => {
        return response.data?.ugcArticleSolutionArticle;
      });
  }
}
// --- How to use it ---
// import { LeetCodeService } from './path/to/LeetCodeService';
// import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
// import { registerAllLeetCodeTools } from './path/to/providers/leetcode/tool-registries/index.js'; // Adjust path
//
// async function main() {
//   const sessionCookie = process.env.LEETCODE_SESSION_COOKIE || 'your_leetcode_session_cookie';
//
//   try {
//     // Create and initialize the single LeetCodeService instance
//     const leetCodeService = await LeetCodeService.create(sessionCookie);
//     console.log('LeetCodeService is ready. Authenticated:', leetCodeService.isAuthenticated());
//
//     // Example usage:
//     const daily = await leetCodeService.fetchDailyChallenge();
//     console.log('Daily Challenge:', daily.title);
//
//     // If integrating with MCP:
//     const mcpServer = new McpServer();
//     // Pass the single LeetCodeService instance to your tool registration function
//     registerAllLeetCodeTools(mcpServer, leetCodeService);
//     console.log('All MCP tools registered.');
//
//     mcpServer.startStdio(); // Or other MCP server start methods
//     console.log('MCP Server started.');
//
//   } catch (error) {
//     console.error('Application failed to start due to LeetCodeService error:', error);
//   }
// }
//
// main();
