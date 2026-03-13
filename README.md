# refinekit

Leave visual feedback directly on any web page. Click an element, type what should change, and refinekit saves your notes as structured annotations that AI coding tools can read and act on.

## Install

### With Claude Code (recommended)

If you're using [Claude Code](https://claude.com/claude-code), tell it:

> Add refinekit to my HTML files

Claude Code will add the script tag to your HTML files for you. You can also use the built-in skill:

```
/refinekit
```

### Manually

Add this line to your HTML file, just before the closing `</body>` tag:

```html
<script src="https://unpkg.com/refinekit/dist/refiner.js"></script>
```

Open the file in your browser and the refinekit toolbar will appear in the bottom-right corner.

## How to use it

1. Click the **pen icon** in the bottom-right corner to expand the toolbar
2. Click any element on the page — a heading, a button, an image, anything
3. Type what should change (e.g. "Make this font bigger" or "Change this color to blue")
4. Click **Add** (or press `Cmd+Enter` on Mac / `Ctrl+Enter` on Windows)
5. A numbered marker appears on the element — repeat for as many elements as you'd like
6. Click the **copy icon** in the toolbar to copy all your annotations

Paste the copied annotations into [Claude Code](https://claude.com/claude-code) or any AI coding tool. It will know exactly which elements to change and what to do.

### What gets copied

```
# Design Annotations — My Page Title

## 1.
Element: body > main > h2
Issue: Make this font bigger and bolder

## 2.
Element: #hero > .cta-button
Issue: Change this color to blue and add more padding
```

## Toolbar guide

| Button | What it does |
|--------|-------------|
| Pen / X | Show or hide the toolbar |
| Number badge | Shows how many annotations you've added |
| Copy | Copy all annotations to clipboard |
| Trash | Remove all annotations |
| Gear | Open settings |

### Settings

- **Marker Colour** — change the color of the numbered markers
- **Clear on copy** — automatically remove annotations after copying them
- **Block page interactions** — prevents you from accidentally clicking links or buttons while annotating (on by default)

## Using refinekit with Claude Code

[Claude Code](https://claude.com/claude-code) is an AI coding tool that can read your refinekit annotations and make the changes for you.

### Autonomous design critique

Want Claude to review your page's design on its own? Type:

```
/refiner-self-driving
```

Claude opens your page in a browser and drives through it like a design reviewer — clicking elements, adding expert feedback on typography, spacing, colors, and layout. You watch it work in real time.

### Real-time sync with MCP

By default, you copy annotations and paste them into Claude Code. But you can skip the copy-paste entirely by running the refinekit MCP server:

```bash
npx refinekit-mcp server
```

Once running, annotations flow directly to Claude Code as you add them. The settings panel will show "MCP Connected" to confirm the link is active.

To make this permanent in Claude Code:

```bash
npx refinekit-mcp init
```

### Two-session workflow

The most powerful setup uses two Claude Code sessions at once:

1. **Session 1** runs `/refiner-self-driving` — it reviews your page and adds design annotations
2. **Session 2** watches for those annotations and fixes the code to address each one

You watch Session 1 critique the design while Session 2 implements the fixes — fully hands-free.

---

## Advanced

Everything below is for developers who want more control over refinekit.

### npm install

```bash
npm install refinekit
```

```js
import { Refiner } from 'refinekit';

const refiner = new Refiner();
```

### Configuration

#### Script tag attributes

```html
<script
  src="https://unpkg.com/refinekit/dist/refiner.js"
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

#### Constructor options

```js
const refiner = new Refiner({
  enabled: true,
  position: 'right',
  mcpEnabled: true,
  mcpPort: 4848,
});
```

### JavaScript API

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

### MCP server details

#### MCP tools

| Tool | Description |
|------|-------------|
| `refiner_list_sessions` | List all annotation sessions |
| `refiner_get_all_pending` | Get all unresolved annotations |
| `refiner_resolve` | Mark an annotation as resolved with a summary |
| `refiner_dismiss` | Dismiss an annotation with a reason |
| `refiner_watch_annotations` | Block until a new annotation arrives (for continuous watching) |

#### HTTP API

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

#### Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REFINER_PORT` | `4848` | HTTP server port |
| `REFINER_STORE` | SQLite at `~/.refiner/store.db` | Set to `memory` for in-memory storage |

#### Verify setup

```bash
npx refinekit-mcp doctor
```

### Installing Claude Code skills manually

```bash
# From the refiner project directory
ln -sf "$(pwd)/skills/refinekit" ~/.claude/skills/refinekit
ln -sf "$(pwd)/skills/refiner-self-driving" ~/.claude/skills/refiner-self-driving
```

Restart Claude Code after installing.

### Development

```bash
git clone https://github.com/llewellynathan/refiner.git
cd refiner
npm install
npm run build     # one-off build
npm run watch     # rebuild on changes
```

Open `examples/test.html` in a browser to test.

#### MCP server development

```bash
cd mcp
npm install
npm run build     # one-off build
npm run dev       # rebuild on changes
```

## License

MIT
