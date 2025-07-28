# LeetCode MCP Server

This project provides a server that exposes LeetCode functionalities through the Model-Context Protocol (MCP). It allows users to interact with LeetCode data and perform actions like searching problems, fetching user profiles, and submitting solutions.

## Features

- **LeetCode API Integration:** Interacts with the LeetCode API to provide a wide range of functionalities.
- **MCP Compliant:** Implements the Model-Context Protocol for standardized communication.
- **Extensible:** The project is structured to easily add new tools and resources.
- **Comprehensive Toolset:** Provides a rich set of tools for interacting with LeetCode, including:
  - Problem searching and details
  - Daily challenge fetching
  - Solution listing and submission
  - User profile and submission tracking
- **Resource-Oriented:** Exposes LeetCode data as resources, such as problem categories, tags, and languages.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://npm.io/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/leetcode-mcpserver.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd leetcode-mcpserver
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

### Running the Server

To run the server, you need to provide your LeetCode session cookie and CSRF token. You can get these from your browser's developer tools after logging into LeetCode.

You can provide the credentials as command-line arguments:

```bash
npm run start --session <YOUR_SESSION_COOKIE> --csrf <YOUR_CSRF_TOKEN>
```

Alternatively, you can set them as environment variables:

```bash
export LEETCODE_SESSION=<YOUR_SESSION_COOKIE>
export LEETCODE_CSRF=<YOUR_CSRF_TOKEN>
npm run start
```

For development, you can use the `dev` script to automatically restart the server on file changes:

```bash
npm run dev --session <YOUR_SESSION_COOKIE> --csrf <YOUR_CSRF_TOKEN>
```

## Usage

```bash
npx -y @ayushjaipuriyar/leetcode-mcpserver --csrf <YOUR_CSRF_TOKEN> --session <YOUR_LEETCODE_SESSION_COOKIE>
```

Visual Studio Code Integration
Add the following JSON configuration to your User Settings (JSON) file. Access this by pressing Ctrl/Cmd + Shift + P and searching for Preferences: Open User Settings (JSON).

Option 1: Using Environment Variables

```json
{
  "mcp": {
    "servers": {
      "leetcode": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "@ayushjaipuriyar/leetcode-mcpserver"],
        "env": {
          "LEETCODE_CSRF": "global",
          "LEETCODE_SESSION": "<YOUR_LEETCODE_SESSION_COOKIE>"
        }
      }
    }
  }
}
```

Option 2: Using Command Line Arguments

```json
{
  "mcp": {
    "servers": {
      "leetcode": {
        "type": "stdio",
        "command": "npx",
        "args": [
          "-y",
          "@ayushjaipuriyar/leetcode-mcpserver",
          "--csrf",
          "global",
          "--session",
          "<YOUR_LEETCODE_SESSION_COOKIE>"
        ]
      }
    }
  }
}
```

### Authentication

The server requires a LeetCode session cookie and CSRF token for authentication. These can be provided either as command-line arguments (`--session` and `--csrf`) or as environment variables (`LEETCODE_SESSION` and `LEETCODE_CSRF`).

### Tools

The server exposes the following tools:

- **GetDailyChallengeTool:** Fetches the daily LeetCode challenge.
- **GetProblemTool:** Fetches the details of a specific problem.
- **SearchProblemsTool:** Searches for problems based on various criteria.
- **GetUserContestRankingTool:** Fetches the contest ranking of a user.
- **GetProblemSolutionTool:** Fetches the solution for a specific problem.
- **ListProblemSolutionsTool:** Lists the available solutions for a problem.
- **SubmitLeetCodeSolutionTool:** Submits a solution to a problem.
- **GetAllSubmissionsTool:** Fetches all submissions of a user.
- **GetProblemProgressTool:** Fetches the progress of a user on a problem.
- **GetProblemSubmissionReportTool:** Fetches the submission report of a user for a problem.
- **GetRecentACSubmissionsTool:** Fetches the recent accepted submissions of a user.
- **GetRecentSubmissionsTool:** Fetches the recent submissions of a user.
- **GetUserProfileTool:** Fetches the profile of a user.
- **GetUserStatusTool:** Fetches the status of a user.

### Resources

The server exposes the following resources:

- **ProblemCategoriesResource:** Provides a list of problem categories.
- **ProblemTagsResource:** Provides a list of problem tags.
- **ProblemLanguagesResource:** Provides a list of supported programming languages.
- **ProblemDetailResource:** Provides the details of a specific problem.
- **ProblemSolutionResource:** Provides the solution for a specific problem.
