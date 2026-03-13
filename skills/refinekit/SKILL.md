---
name: refinekit
description: Add refinekit visual annotation overlay to a plain HTML/CSS project for design critique
---

# refinekit Setup

Add the refinekit annotation toolbar to this project.

## Usage

- `/refinekit index.html` — install on a specific file
- `/refinekit` — prompted to choose which file(s)

## Steps

1. **Determine target files**
   - If the user provided a filename argument (e.g. `/refinekit index.html`), use that file only
   - Otherwise, find all `.html` files in root, `src/`, and `public/`
   - If this is a React/Next.js project, suggest using Agentation instead
   - List the HTML files found and ask the user which ones to install on — let them pick one, several, or all
   - If no HTML files found, ask the user to provide a path

2. **Check if already installed**
   - For each target file, search for `refinekit` or `refiner.js` script tags
   - Skip any file that already has it and tell the user

3. **Add the script tag**

   Add this before the closing `</body>` tag in each target file:
   ```html
   <script src="https://unpkg.com/refinekit/dist/refiner.js"></script>
   ```

4. **Confirm setup**
   - Tell the user to open the file in a browser
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
