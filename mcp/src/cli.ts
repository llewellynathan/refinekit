import { Store } from './store.js';
import { HttpServer } from './http-server.js';
import { RefinerMcpServer } from './mcp-server.js';

const command = process.argv[2];

async function main() {
  switch (command) {
    case 'server': {
      const port = parseInt(process.env.REFINER_PORT ?? '4848', 10);
      const dbPath = process.env.REFINER_STORE === 'memory' ? ':memory:' : undefined;

      const store = new Store(dbPath);
      const httpServer = new HttpServer(store, port);
      const mcpServer = new RefinerMcpServer(store);

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
      console.log('Setting up Refiner MCP server for Claude Code...\n');

      try {
        execSync('claude mcp add refiner -- npx re-finer-mcp server', { stdio: 'inherit' });
        console.log('\nRefiner MCP server added. Restart Claude Code to load it.');
      } catch {
        console.error('Failed to add MCP server. Make sure Claude Code CLI is installed.');
        console.log('\nManual setup: claude mcp add refiner -- npx re-finer-mcp server');
        process.exit(1);
      }
      break;
    }

    case 'doctor': {
      console.log('Checking Refiner MCP setup...\n');

      // Check if HTTP server is running
      try {
        const res = await fetch('http://localhost:4848/health');
        const data = await res.json() as Record<string, string>;
        if (data.status === 'ok') {
          console.log('  HTTP server: running on port 4848');
        }
      } catch {
        console.log('  HTTP server: not running');
        console.log('    Run: npx re-finer-mcp server');
      }

      // Check Claude Code MCP config
      try {
        const { execSync } = await import('node:child_process');
        const output = execSync('claude mcp list', { encoding: 'utf-8' });
        if (output.includes('refiner')) {
          console.log('  Claude Code MCP: configured');
        } else {
          console.log('  Claude Code MCP: not configured');
          console.log('    Run: npx re-finer-mcp init');
        }
      } catch {
        console.log('  Claude Code MCP: unable to check (is Claude Code installed?)');
      }

      console.log();
      break;
    }

    default:
      console.log(`re-finer-mcp — MCP server for Refiner annotation sync

Usage:
  re-finer-mcp server    Start the HTTP + MCP servers
  re-finer-mcp init      Set up MCP server in Claude Code
  re-finer-mcp doctor    Verify setup
  re-finer-mcp help      Show this message

Environment:
  REFINER_PORT=4848     HTTP server port (default: 4848)
  REFINER_STORE=memory  Use in-memory storage instead of SQLite
`);
      break;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
