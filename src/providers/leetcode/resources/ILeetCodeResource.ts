// src/providers/leetcode/resources/ILeetCodeResource.ts


/**
 * Defines the common interface for all LeetCode resources that will be exposed via MCP.
 * Each resource must provide a name, a URI template, a description, and a method to fetch its content.
 */
export interface ILeetCodeResource {
  /**
   * The unique name of the resource, used for registration with the MCP server.
   * (e.g., 'problem-categories', 'problem-detail').
   */
  readonly name: string;

  /**
   * The URI template for the resource. This can be a simple string or a ResourceTemplate instance
   * if the URI includes dynamic variables.
   */
  readonly uriTemplate: string;

  /**
   * A concise, human-readable description of the resource's purpose.
   * This is critical for LLMs and other consumers to understand what data the resource provides.
   */
  readonly description: string;

  /**
   * The MIME type of the content served by this resource (e.g., 'application/json', 'text/plain').
   */
  readonly mimeType: string;

  /**
   * Executes the logic to retrieve the resource's content.
   * This method performs the actual work, interacting with the LeetCodeService or static data.
   *
   * @param uri The full URI of the requested resource.
   * @param variables Any dynamic variables extracted from the URI template (if applicable).
   * @param extra Additional metadata provided by the MCP server during the resource request.
   * @returns A Promise that resolves with the raw data result of the resource's operation. This data
   * will be wrapped in the MCP `contents` format by the base class.
   */
  fetchContent(
    uri: URL,
    variables: Record<string, string>,
    extra: any,
  ): Promise<any>;
}
