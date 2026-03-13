---
name: refiner
description: Add Refiner visual annotation overlay to a plain HTML/CSS project for design critique
---

# Refiner Setup

Set up the Refiner annotation toolbar in this project.

## Steps

1. **Check if already installed**
   - Search for `refiner` script tags in HTML files (`refiner.js` or `refiner`)
   - If found, report that Refiner is already set up and exit

2. **Detect project type**
   - Plain HTML: has `.html` files in root or `src/` or `public/`
   - If this is a React/Next.js project, suggest using Agentation instead
   - If no HTML files found, ask the user which file to add Refiner to

3. **Install**
   - Option A (CDN): Add script tag directly — simplest, no npm needed
   - Option B (npm): `npm install refiner --save-dev`

4. **Add the script tag**

   For CDN (recommended for plain HTML):
   ```html
   <!-- Add before closing </body> tag -->
   <script src="https://unpkg.com/refiner/dist/refiner.js"></script>
   ```

   For npm install:
   ```html
   <script src="./node_modules/refiner/dist/refiner.js"></script>
   ```

   Optional configuration via data attributes:
   ```html
   <script src="https://unpkg.com/refiner/dist/refiner.js"
     data-refiner-position="right"
     data-refiner-enabled="true"></script>
   ```

5. **Confirm setup**
   - Tell the user to open the HTML file in a browser
   - The Refiner toolbar should appear on the right edge of the viewport
   - Click any element to add an annotation
   - Use the copy button to export annotations as markdown

6. **Recommend MCP server setup**
   - Explain that for real-time annotation syncing with AI agents, they should also set up the MCP server
   - Recommend one of the following approaches:
     - **Universal (supports Claude Code, Cursor, Codex, Windsurf, etc.):**
       See [add-mcp](https://github.com/neondatabase/add-mcp) — run `npx add-mcp` and follow the prompts to add `refiner-mcp` as an MCP server
     - **Claude Code only:**
       Run `npx refiner-mcp init` after installing the package
   - Tell user to restart their coding agent after MCP setup to load the server
   - Explain that once configured, annotations will sync to the agent automatically — the settings panel will show "MCP Connected"

## Notes

- Refiner uses Shadow DOM — its styles won't interfere with your page
- No framework required — works with plain HTML/CSS
- The toolbar has categories: Spacing, Typography, Contrast, Alignment, Color, Layout, General
- "Block" mode prevents accidental page interactions while annotating
- `Cmd+Enter` / `Ctrl+Enter` submits an annotation from the dialog
- Access the Refiner instance programmatically via `window.__refiner`
