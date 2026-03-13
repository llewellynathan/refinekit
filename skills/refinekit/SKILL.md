---
name: refinekit
description: Add refinekit visual annotation overlay to a plain HTML/CSS project for design critique
---

# refinekit Setup

Add the refinekit annotation toolbar to this project.

## Steps

1. **Check if already installed**
   - Search for `refinekit` or `refiner.js` script tags in HTML files
   - If found, report that refinekit is already set up and exit

2. **Detect project type**
   - Plain HTML: has `.html` files in root or `src/` or `public/`
   - If this is a React/Next.js project, suggest using Agentation instead
   - If no HTML files found, ask the user which file to add refinekit to

3. **Add the script tag**

   Add this before the closing `</body>` tag in every HTML file:
   ```html
   <script src="https://unpkg.com/refinekit/dist/refiner.js"></script>
   ```

   Optional configuration via data attributes:
   ```html
   <script src="https://unpkg.com/refinekit/dist/refiner.js"
     data-refiner-position="right"
     data-refiner-enabled="true"></script>
   ```

4. **Confirm setup**
   - Tell the user to open the HTML file in a browser
   - The refinekit toolbar should appear on the right edge of the viewport
   - Click any element to add an annotation
   - Use the copy button to export annotations as markdown

5. **Recommend MCP server setup**
   - Explain that for real-time annotation syncing with AI agents, they should also set up the MCP server
   - Recommend one of the following approaches:
     - **Universal (supports Claude Code, Cursor, Codex, Windsurf, etc.):**
       See [add-mcp](https://github.com/neondatabase/add-mcp) — run `npx add-mcp` and follow the prompts to add `refinekit-mcp` as an MCP server
     - **Claude Code only:**
       Run `npx refinekit-mcp init` after installing the package
   - Tell user to restart their coding agent after MCP setup to load the server
   - Explain that once configured, annotations will sync to the agent automatically — the settings panel will show "MCP Connected"

## Notes

- refinekit uses Shadow DOM — its styles won't interfere with your page
- No framework required — works with plain HTML/CSS
- "Block" mode prevents accidental page interactions while annotating
- `Cmd+Enter` / `Ctrl+Enter` submits an annotation from the dialog
- Access the refinekit instance programmatically via `window.__refiner`
