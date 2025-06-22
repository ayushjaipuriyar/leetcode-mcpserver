// src/providers/leetcode/tools/ILeetCodeTool.ts

/**
 * Defines the common interface for all LeetCode tools that will be exposed via MCP.
 * Each tool must provide a name, description, an input schema, and an execute method.
 */
export interface ILeetCodeTool {
  /**
   * The unique name of the tool, used for registration with the MCP server.
   * (e.g., 'get_daily_challenge', 'search_problems').
   */
  readonly name: string;

  /**
   * A concise, human-readable description of the tool's purpose.
   * This is critical for LLMs and other consumers to understand when to use the tool.
   */
  readonly description: string;

  register(server: any): void;
}
