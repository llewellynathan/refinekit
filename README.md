# reFiner

Leave visual feedback directly on any web page. Click an element, type what should change, and reFiner saves your notes as structured annotations that AI coding tools can read and act on.

## What it does

1. You add a single line to your HTML file
2. A small toolbar appears on your page
3. Click any element to leave a note about what should change
4. Copy all your notes and paste them into an AI coding tool like [Claude Code](https://claude.com/claude-code) — it knows exactly which elements to fix

reFiner stays out of the way. It doesn't change your page's appearance or break any styles.

## Getting started

### Step 1: Add reFiner to your page

Open your HTML file and paste this line just before the closing `</body>` tag:

```html
<script src="https://unpkg.com/re-finer/dist/refiner.js"></script>
```

Your file should look something like this:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <!-- your page content here -->

    <script src="https://unpkg.com/re-finer/dist/refiner.js"></script>
  </body>
</html>
```

### Step 2: Open your page in a browser

Open the HTML file in Chrome, Safari, Firefox, or any modern browser. You'll see a small pen icon in the bottom-right corner — that's the reFiner toolbar.

### Step 3: Start annotating

1. Click the **pen icon** to expand the toolbar
2. Click any element on the page — a heading, a button, an image, anything
3. A dialog appears. Type what should change (e.g. "Make this font bigger" or "Change this color to blue")
4. Click **Add** (or press `Cmd+Enter` on Mac / `Ctrl+Enter` on Windows)
5. A numbered marker appears on the element

Repeat for as many elements as you'd like to annotate.

### Step 4: Copy your annotations

Click the **copy icon** in the toolbar. All your annotations are copied to your clipboard as a formatted list, ready to paste into Claude Code or any AI coding assistant.

What gets copied looks like this:

```
# Design Annotations — My Page Title

## 1.
Element: body > main > h2
Issue: Make this font bigger and bolder

## 2.
Element: #hero > .cta-button
Issue: Change this color to blue and add more padding
```

The AI agent uses the element selectors to find and fix exactly the right elements in your code.

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

## Using reFiner with Claude Code

[Claude Code](https://claude.com/claude-code) is an AI coding tool that can read your reFiner annotations and make the changes for you.

### Quick setup

If you already have Claude Code installed, just type:

```
/refiner
```

Claude Code will detect your project and add reFiner for you automatically.

### Autonomous design critique

Want Claude to review your page's design on its own? Type:

```
/refiner-self-driving
```

Claude opens your page in a browser and drives through it like a design reviewer — clicking elements, adding expert feedback on typography, spacing, colors, and layout. You watch it work in real time.

### Real-time sync with MCP

By default, you copy annotations and paste them into Claude Code. But you can skip the copy-paste entirely by running the reFiner MCP server:

```bash
npx re-finer-mcp server
```

Once running, annotations flow directly to Claude Code as you add them. The settings panel in reFiner will show "MCP Connected" to confirm the link is active.

To make this permanent in Claude Code:

```bash
npx re-finer-mcp init
```

### Two-session workflow

The most powerful setup uses two Claude Code sessions at once:

1. **Session 1** runs `/refiner-self-driving` — it reviews your page and adds design annotations
2. **Session 2** watches for those annotations and fixes the code to address each one

You watch Session 1 critique the design while Session 2 implements the fixes — fully hands-free.

---

## Advanced

Everything below is for developers who want more control over reFiner.

### npm install

```bash
npm install re-finer
```

```js
import { Refiner } from 're-finer';

const refiner = new Refiner();
```

### Configuration

#### Script tag attributes

```html
<script
  src="https://unpkg.com/re-finer/dist/refiner.js"
  data-refiner-enabled="true"
  data-refiner-position="right"
  data-re-finer-mcp-enabled="true"
  data-re-finer-mcp-port="4848"
></script>
```

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-refiner-enabled` | `true` / `false` | `true` | Whether to activate on load |
| `data-refiner-position` | `left` / `right` | `right` | Which side of the viewport |
| `data-re-finer-mcp-enabled` | `true` / `false` | `true` | Auto-discover MCP server |
| `data-re-finer-mcp-port` | number | `4848` | MCP server HTTP port |

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
npx re-finer-mcp doctor
```

### Installing Claude Code skills manually

```bash
# From the refiner project directory
ln -sf "$(pwd)/skills/refiner" ~/.claude/skills/refiner
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
