# reFiner

A visual annotation overlay for design critique on any HTML page. Click elements, leave notes, and copy them as structured markdown — ready to paste into AI agents like Claude Code.

All UI lives inside a Shadow DOM, so it won't interfere with your page's styles or layout.

## Install

### Script tag (quickest)

```html
<script src="https://unpkg.com/refiner/dist/refiner.js"></script>
```

The toolbar appears automatically in the bottom-right corner.

### npm

```bash
npm install refiner
```

```js
import { Refiner } from 'refiner';

const refiner = new Refiner();
```

### Claude Code skill

If you're using [Claude Code](https://claude.com/claude-code), run:

```
/refiner
```

This detects your project type and installs reFiner automatically.

## Usage

1. **Click any element** on the page to open the annotation dialog
2. **Describe what should change** and hit Add (or `Cmd+Enter` / `Ctrl+Enter`)
3. **Repeat** for as many elements as you like — numbered markers track each annotation
4. **Copy** all annotations to clipboard with the copy button — output is structured markdown with CSS selectors, ready for an AI coding agent

### Toolbar controls

| Icon | Action |
|------|--------|
| Pen / X | Expand or collapse the toolbar |
| Count badge | Shows the number of active annotations |
| Copy | Copy all annotations as markdown to clipboard |
| Trash | Clear all annotations |
| Gear | Open settings panel |

### Settings

- **Marker Colour** — pick from 7 saturated color swatches
- **Clear on copy** — automatically remove annotations after copying
- **Block page interactions** — prevent clicks from reaching the page underneath (enabled by default)
- **MCP status** — shows whether the MCP server is connected for real-time sync

## Configuration

### Script tag attributes

```html
<script
  src="https://unpkg.com/refiner/dist/refiner.js"
  data-refiner-enabled="true"
  data-refiner-position="right"
  data-refiner-mcp-enabled="true"
  data-refiner-mcp-port="4848"
></script>
```

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-refiner-enabled` | `true` / `false` | `true` | Whether to activate on load |
| `data-refiner-position` | `left` / `right` | `right` | Which side of the viewport |
| `data-refiner-mcp-enabled` | `true` / `false` | `true` | Auto-discover MCP server |
| `data-refiner-mcp-port` | number | `4848` | MCP server HTTP port |

### Constructor options

```js
const refiner = new Refiner({
  enabled: true,       // activate immediately
  position: 'right',   // 'left' or 'right'
  mcpEnabled: true,    // auto-discover MCP server
  mcpPort: 4848,       // MCP server HTTP port
});
```

## API

The instance is available at `window.__refiner` when loaded via script tag.

```js
const r = window.__refiner;

r.enable();              // show the toolbar and overlay
r.disable();             // hide everything
r.destroy();             // remove from DOM entirely

r.getAnnotations();      // returns Annotation[]
r.getAnnotationCount();  // returns number
r.formatForAgent();      // returns markdown string
r.copyAnnotations();     // copies markdown to clipboard
r.clearAnnotations();    // removes all annotations
```

## Clipboard output format

When you copy annotations, the clipboard contains markdown like this:

```markdown
# Design Annotations — My Page Title

## 1.
**Element:** `body > main > section:nth-child(1) > h2`
**Issue:** Change this font to Inter

## 2.
**Element:** `#hero > .cta-button`
**Issue:** Increase padding and make the corners more rounded
```

## MCP Server

The `refiner-mcp` server enables real-time annotation sync between the browser and AI agents. When running, reFiner auto-discovers it and streams annotations directly to your coding agent — no copy-paste needed.

### Setup

```bash
# Start the server
npx refiner-mcp server

# Or add it to Claude Code permanently
npx refiner-mcp init
```

The server runs on port 4848 by default. When reFiner detects it, the settings panel shows "MCP Connected".

### MCP tools

Once connected, your AI agent has access to these tools:

| Tool | Description |
|------|-------------|
| `refiner_list_sessions` | List all annotation sessions |
| `refiner_get_all_pending` | Get all unresolved annotations |
| `refiner_resolve` | Mark an annotation as resolved with a summary |
| `refiner_dismiss` | Dismiss an annotation with a reason |
| `refiner_watch_annotations` | Block until a new annotation arrives (for continuous watching) |

### HTTP API

The server also exposes a REST API for custom integrations:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/sessions` | Create a session `{ url, title }` |
| `GET` | `/sessions` | List all sessions |
| `GET` | `/sessions/:id` | Get session with annotations |
| `POST` | `/sessions/:id/annotations` | Add annotation `{ targetSelector, targetRect, text }` |
| `PATCH` | `/annotations/:id` | Resolve `{ resolved: true, summary }` or dismiss `{ dismissed: true, reason }` |
| `GET` | `/pending` | Get all pending annotations |
| `GET` | `/events` | SSE stream for real-time updates |

### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REFINER_PORT` | `4848` | HTTP server port |
| `REFINER_STORE` | SQLite at `~/.refiner/store.db` | Set to `memory` for in-memory storage |

### Verify setup

```bash
npx refiner-mcp doctor
```

## Claude Code Skills

reFiner ships with two Claude Code skills for AI-assisted design critique.

### `/refiner` — Setup

Automatically installs reFiner in your project. Detects whether you have plain HTML files, adds the script tag, and recommends MCP server setup.

### `/refiner-self-driving` — Autonomous critique

Launches a headed browser, navigates to your page, and autonomously adds design annotations — clicking elements, writing critiques, and verifying each annotation. You watch the AI drive through your page like a design reviewer.

Requires the [agent-browser](https://github.com/anthropics/agent-browser) skill.

```
/refiner-self-driving
```

The agent critiques typography, spacing, color, hierarchy, CTAs, and more — producing 5-8 specific, actionable annotations per page.

### Two-session workflow

With the MCP server running, you can run fully autonomous design review:

1. **Session 1** runs `/refiner-self-driving` — watches the page and adds critique annotations
2. **Session 2** calls `refiner_watch_annotations` in a loop — receives each annotation and edits the code to address it

The designer watches Session 1 drive through the UI while Session 2 fixes issues in the codebase.

### Installing the skills

```bash
# From the refiner project directory
ln -sf "$(pwd)/skills/refiner" ~/.claude/skills/refiner
ln -sf "$(pwd)/skills/refiner-self-driving" ~/.claude/skills/refiner-self-driving
```

Restart Claude Code after installing.

## Development

```bash
git clone https://github.com/llewellynathan/refiner.git
cd refiner
npm install
npm run build     # one-off build
npm run watch     # rebuild on changes
```

Open `examples/test.html` in a browser to test.

### MCP server development

```bash
cd mcp
npm install
npm run build     # one-off build
npm run dev       # rebuild on changes
```

## License

MIT
