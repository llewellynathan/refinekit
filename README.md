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

## Usage

1. **Click any element** on the page to open the annotation dialog
2. **Describe what should change** and hit Add
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

## Configuration

### Script tag attributes

```html
<script
  src="https://unpkg.com/refiner/dist/refiner.js"
  data-refiner-enabled="true"
  data-refiner-position="right"
></script>
```

| Attribute | Values | Default | Description |
|-----------|--------|---------|-------------|
| `data-refiner-enabled` | `true` / `false` | `true` | Whether to activate on load |
| `data-refiner-position` | `left` / `right` | `right` | Which side of the viewport |

### Constructor options

```js
const refiner = new Refiner({
  enabled: true,    // activate immediately
  position: 'right' // 'left' or 'right'
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

## Development

```bash
git clone https://github.com/llewellynathan/refiner.git
cd refiner
npm install
npm run build     # one-off build
npm run watch     # rebuild on changes
```

Open `examples/test.html` in a browser to test.

## License

MIT
