import { Store } from './store.js';
import { HttpServer } from './http-server.js';
import { RefineKitMcpServer } from './mcp-server.js';

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'server': {
      const port = parseInt(process.env.REFINEKIT_PORT ?? '4848', 10);
      const dbPath = process.env.REFINEKIT_STORE === 'memory' ? ':memory:' : undefined;

      const store = new Store(dbPath);
      const httpServer = new HttpServer(store, port);
      const mcpServer = new RefineKitMcpServer(store);

      await httpServer.start();
      await mcpServer.start();

      const shutdown = () => {
        console.log('\nShutting down...');
        httpServer.stop().then(() => {
          store.close();
          process.exit(0);
        });
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      break;
    }

    case 'init': {
      const { execSync } = await import('node:child_process');
      console.log('Setting up RefineKit MCP server for Claude Code...\n');

      try {
        execSync('claude mcp add refinekit -- npx refinekit-mcp server', { stdio: 'inherit' });
        console.log('\nRefineKit MCP server added. Restart Claude Code to load it.');
      } catch {
        console.error('Failed to add MCP server. Make sure Claude Code CLI is installed.');
        console.log('\nManual setup: claude mcp add refinekit -- npx refinekit-mcp server');
        process.exit(1);
      }
      break;
    }

    case 'doctor': {
      console.log('Checking RefineKit MCP setup...\n');

      // Check if HTTP server is running
      try {
        const res = await fetch('http://localhost:4848/health');
        const data = await res.json() as Record<string, string>;
        if (data.status === 'ok') {
          console.log('  HTTP server: running on port 4848');
        }
      } catch {
        console.log('  HTTP server: not running');
        console.log('    Run: npx refinekit-mcp server');
      }

      // Check Claude Code MCP config
      try {
        const { execSync } = await import('node:child_process');
        const output = execSync('claude mcp list', { encoding: 'utf-8' });
        if (output.includes('refinekit')) {
          console.log('  Claude Code MCP: configured');
        } else {
          console.log('  Claude Code MCP: not configured');
          console.log('    Run: npx refinekit-mcp init');
        }
      } catch {
        console.log('  Claude Code MCP: unable to check (is Claude Code installed?)');
      }

      console.log();
      break;
    }

    default:
      console.log(`refinekit-mcp — MCP server for RefineKit annotation sync

Usage:
  refinekit-mcp server    Start the HTTP + MCP servers
  refinekit-mcp init      Set up MCP server in Claude Code
  refinekit-mcp doctor    Verify setup
  refinekit-mcp help      Show this message

Environment:
  REFINEKIT_PORT=4848     HTTP server port (default: 4848)
  REFINEKIT_STORE=memory  Use in-memory storage instead of SQLite
`);
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
