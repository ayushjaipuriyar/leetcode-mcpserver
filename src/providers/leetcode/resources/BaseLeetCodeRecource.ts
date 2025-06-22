// // src/providers/leetcode/resources/BaseLeetCodeResource.ts

// import {
//   McpServer
// } from '@modelcontextprotocol/sdk/server/mcp.js';
// import { logger } from '../../../utils/logger.js'; // Adjust path based on your tree
// import { LeetCodeService } from '../service.js'; // Adjust path based on your tree
// import { ILeetCodeResource } from './ILeetCodeResource.js'; // Ensure .js for module resolution

// const log = logger('BaseLeetCodeResource');

// /**
//  * Abstract base class for all concrete LeetCode resources.
//  * It provides the fundamental structure, handles the injection of the `LeetCodeService`,
//  * and offers a utility method to register the resource directly with an `McpServer`.
//  */
// export abstract class BaseLeetCodeResource implements ILeetCodeResource {
//   // These properties must be implemented by concrete subclasses
//   public abstract readonly name: string;
//   public abstract readonly uriTemplate: string ;
//   public abstract readonly description: string;
//   public abstract readonly mimeType: string;

//   /**
//    * The LeetCodeService instance, which provides access to LeetCode API methods.
//    * Protected to allow access in derived classes.
//    */
//   protected readonly leetcodeService: LeetCodeService;

//   /**
//    * Constructs a new instance of a base LeetCode resource.
//    *
//    * @param leetcodeService The initialized `LeetCodeService` instance.
//    * @throws {Error} If `leetcodeService` is not provided.
//    */
//   constructor(leetcodeService: LeetCodeService) {
//     if (!leetcodeService) {
//       log.error(
//         `BaseLeetCodeResource: Constructor received an invalid LeetCodeService.`,
//       );
//       throw new Error(
//         'A valid LeetCodeService must be provided to the resource.',
//       );
//     }
//     this.leetcodeService = leetcodeService;
//     log.debug(`BaseLeetCodeResource: Instance created.`);
//   }

//   /**
//    * Abstract method for fetching the resource's content.
//    * Each concrete resource must implement this method to define its specific logic.
//    * This method should return the raw data result, which will be wrapped for MCP response.
//    *
//    * @param uri The full URI of the requested resource.
//    * @param variables Any dynamic variables extracted from the URI template.
//    * @param extra Additional metadata.
//    * @returns A Promise resolving to the resource's raw data.
//    */
//   public abstract fetchContent(
//     uri: URL,
//     variables: Record<string, string>,
//     extra: any,
//   ): Promise<any>;

//   /**
//    * Registers this resource instance with the provided MCP server.
//    * This method uses the resource's properties (`name`, `uriTemplate`, `description`, `mimeType`)
//    * and its `fetchContent` method to define the MCP server resource.
//    * It also handles the MCP-specific output wrapping.
//    *
//    * @param server The MCP server instance to register the resource with.
//    */
//   public registerWithMcpServer(server: McpServer): void {
//     log.info(
//       `Registering MCP resource: '${this.name}' at '${this.uriTemplate}'`,
//     );
//     server.resource(
//       this.name,
//       this.uriTemplate,
//       {
//         description: this.description,
//         mimeType: this.mimeType,
//       },
//       async (uri: URL, variables: Record<string, string>, extra: any) => {
//         log.debug(
//           `MCP resource '${this.name}' called for URI: ${uri.toString()}`,
//         );
//         try {
//           // Execute the resource's core logic to fetch content
//           const data = await this.fetchContent(uri, variables, extra);
//           // Wrap the raw data in the MCP content format
//           return {
//             contents: [
//               {
//                 uri: uri.toString(),
//                 text: JSON.stringify(data, null, 2), // Pretty print JSON
//                 mimeType: this.mimeType,
//               },
//             ],
//           };
//         } catch (error) {
//           log.error(
//             `Error during content fetch for resource '${this.name}': ${error instanceof Error ? error.message : String(error)}`,
//           );
//           // Return a structured error response via MCP
//           return {
//             contents: [
//               {
//                 uri: uri.toString(),
//                 text: JSON.stringify(
//                   {
//                     error: `Resource '${this.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
//                   },
//                   null,
//                   2,
//                 ),
//                 mimeType: 'application/json', // Error response is typically JSON
//               },
//             ],
//           };
//         }
//       },
//     );
//     log.debug(
//       `Resource '${this.name}' registered successfully with MCP server.`,
//     );
//   }
// }
