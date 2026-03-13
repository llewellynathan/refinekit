import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { Store } from './store.js';

export class RefinerMcpServer {
  private mcp: McpServer;

  constructor(private store: Store) {
    this.mcp = new McpServer({
      name: 'refiner-mcp',
      version: '0.1.0',
    });

    this.registerTools();
  }

  private registerTools(): void {
    // List sessions
    this.mcp.tool(
      'refiner_list_sessions',
      'List all annotation sessions. Each session represents a page that has been annotated.',
      {},
      async () => {
        const sessions = this.store.listSessions();
        return {
          content: [{
            type: 'text' as const,
            text: JSON.stringify(sessions, null, 2),
          }],
        };
      }
    );

    // Get all pending annotations
    this.mcp.tool(
      'refiner_get_all_pending',
      'Get all unresolved annotations across all sessions. Returns annotations with their CSS selectors, critique text, and metadata.',
      {},
      async () => {
        const pending = this.store.getPending();
        return {
          content: [{
            type: 'text' as const,
            text: pending.length === 0
              ? 'No pending annotations.'
              : JSON.stringify(pending, null, 2),
          }],
        };
      }
    );

    // Resolve an annotation
    this.mcp.tool(
      'refiner_resolve',
      'Mark an annotation as resolved after addressing the feedback. Provide a summary of what was changed.',
      {
        annotationId: z.string().describe('The annotation ID to resolve'),
        summary: z.string().describe('Brief summary of what was changed to address the annotation'),
      },
      async ({ annotationId, summary }) => {
        const annotation = this.store.resolve(annotationId, summary);
        if (!annotation) {
          return {
            content: [{ type: 'text' as const, text: `Annotation ${annotationId} not found.` }],
            isError: true,
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: `Resolved: ${annotation.targetSelector}\nSummary: ${summary}`,
          }],
        };
      }
    );

    // Dismiss an annotation
    this.mcp.tool(
      'refiner_dismiss',
      'Dismiss an annotation without addressing it. Provide a reason for dismissal.',
      {
        annotationId: z.string().describe('The annotation ID to dismiss'),
        reason: z.string().describe('Reason for dismissing the annotation'),
      },
      async ({ annotationId, reason }) => {
        const annotation = this.store.dismiss(annotationId, reason);
        if (!annotation) {
          return {
            content: [{ type: 'text' as const, text: `Annotation ${annotationId} not found.` }],
            isError: true,
          };
        }
        return {
          content: [{
            type: 'text' as const,
            text: `Dismissed: ${annotation.targetSelector}\nReason: ${reason}`,
          }],
        };
      }
    );

    // Watch for new annotations (long-poll)
    this.mcp.tool(
      'refiner_watch_annotations',
      'Block until a new annotation is added, then return it. Use this in a loop to continuously watch for design feedback. Times out after 30 seconds if no annotations arrive.',
      {},
      async () => {
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            this.store.offEvent(handler);
            resolve({
              content: [{ type: 'text' as const, text: 'No new annotations in 30 seconds. Call again to keep watching.' }],
            });
          }, 30_000);

          const handler = (event: string, data: unknown) => {
            if (event === 'annotation:added') {
              clearTimeout(timeout);
              this.store.offEvent(handler);
              resolve({
                content: [{
                  type: 'text' as const,
                  text: JSON.stringify(data, null, 2),
                }],
              });
            }
          };

          this.store.onEvent(handler);
        });
      }
    );
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.mcp.connect(transport);
    console.error('Refiner MCP server started on stdio');
  }
}
