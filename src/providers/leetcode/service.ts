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
  private readonly sessionCookie: string;
  private readonly csrfToken: string | null; // Store CSRF token as string or null for clarity
  // Use a separate credential instance to manage session and CSRF tokens
  private readonly credential: Credential;
  private readonly leetCodeApi: LeetCode;
  private initialized: boolean = false; // Track initialization status

  /**
   * Private constructor to enforce the use of the static `create` factory method.
   * This ensures that the service is always fully initialized before being used.
   *
   * @param sessionCookie The LeetCode session cookie.
   */
  private constructor(sessionCookie: string, csrfToken?: string) {
    this.sessionCookie = sessionCookie;
    this.csrfToken = csrfToken ?? null; // Store as null or undefined for clarity in downstream usage

    if (!this.sessionCookie || this.sessionCookie.trim() === '') {
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
  public static async create(
    sessionCookie: string,
    csrfToken?: string,
  ): Promise<LeetCodeService> {
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

    const service = new LeetCodeService(sessionCookie, csrfToken);
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

  /**
   * Submits code to LeetCode and polls for the result.
   *
   * IMPORTANT: This function uses unofficial LeetCode APIs and is for
   * educational purposes ONLY. Direct programmatic submission likely violates
   * LeetCode's Terms of Service and may lead to account suspension.
   * This code requires proper management of LeetCode session cookies (e.g.,
   * LEETCODE_SESSION, csrftoken) which are NOT handled by this function and
   * must be present in the browser's context or manually managed if run server-side.
   *
   * @param {string} code The solution code to submit.
   * @param {string} language The language of the code (e.g., "python3", "java", "cpp").
   * @param {string} questionId The numeric ID of the question (e.g., "1" for Two Sum).
   * @param {string} questionSlug The URL slug of the question (e.g., "two-sum").
   * @returns {Promise<object>} A promise that resolves with the final JSON response from the LeetCode API.
   */
  public async submitLeetCodeSolution(
    code: string,
    language: string,
    questionId: string,
    questionSlug: string,
  ): Promise<object> {
    if (!code || !language || !questionId || !questionSlug || !this.csrfToken) {
      console.error('Missing required parameters for submission.');
      return { error: 'Missing required parameters' };
    }

    console.log(
      `Attempting to submit solution for ${questionSlug} (ID: ${questionId})...`,
    );

    const submitUrl = `https://leetcode.com/problems/${questionSlug}/submit/`;
    const submitBody = JSON.stringify({
      lang: language,
      question_id: questionId,
      typed_code: code,
    });

    const headers = {
      'Content-Type': 'application/json',
      Cookie: `csrftoken=${this.csrfToken}; LEETCODE_SESSION=${this.sessionCookie}`,
      'x-csrftoken': this.csrfToken,
    };

    try {
      // Step 1: Submit the code
      const submitResponse = await fetch(submitUrl, {
        method: 'POST',
        headers,
        body: submitBody,
        referrer: `https://leetcode.com/problems/${questionSlug}/`,
        referrerPolicy: 'strict-origin-when-cross-origin',
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        throw new Error(
          `Submission failed with status ${submitResponse.status}: ${errorText}`,
        );
      }

      const submitJson = await submitResponse.json();
      console.log('Initial submission response:', submitJson);

      const submissionId = submitJson.submission_id;
      if (!submissionId) {
        throw new Error('Submission ID not found in the response.');
      }

      const checkUrl = `https://leetcode.com/submissions/detail/${submissionId}/check/`;

      // Step 2: Poll for submission result
      const maxAttempts = 60;
      const pollIntervalMs = 1000;
      let finalResult: any = null;

      console.log(`Polling for submission status (ID: ${submissionId})...`);

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

        const checkResponse = await fetch(checkUrl, {
          method: 'GET',
          headers,
          referrer: `https://leetcode.com/problems/${questionSlug}/`,
          referrerPolicy: 'strict-origin-when-cross-origin',
        });

        if (!checkResponse.ok) {
          const errorText = await checkResponse.text();
          throw new Error(
            `Polling failed with status ${checkResponse.status}: ${errorText}`,
          );
        }

        const checkJson = await checkResponse.json();
        console.log(`Attempt ${attempt}: State - ${checkJson.state}`);

        if (checkJson.state && checkJson.state !== 'PENDING') {
          finalResult = checkJson;
          break;
        }
      }

      if (!finalResult) {
        console.warn(
          `Polling timed out after ${maxAttempts} attempts. Submission may still be pending.`,
        );
        return {
          error: 'Polling timed out',
          submission_id: submissionId,
        };
      }

      console.log('Final submission result:', finalResult);
      return finalResult;
    } catch (error: any) {
      console.error('Error during LeetCode submission:', error);
      return {
        error: error?.message ?? 'Unknown error occurred',
      };
    }
  }
}
