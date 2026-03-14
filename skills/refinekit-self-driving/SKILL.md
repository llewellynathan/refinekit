---
name: refinekit-self-driving
description: Autonomous design critique mode using the RefineKit annotation overlay. Use when the user asks to "critique this page," "add design annotations," "review the UI," "self-driving mode," "auto-annotate," or wants an AI agent to autonomously add design feedback annotations to a plain HTML/CSS page via the browser. Requires the RefineKit toolbar to be installed on the target page and agent-browser skill to be available.
allowed-tools: Bash(agent-browser:*)
---

# RefineKit Self-Driving Mode

Autonomously critique a web page by adding design annotations via the RefineKit overlay — in a visible headed browser so the user can watch the agent work in real time.

## Launch — Always Headed

The browser MUST be visible. Never run headless. The user watches you scan, hover, click, and annotate.

**Preflight**: Verify `agent-browser` is available before anything else:

```bash
command -v agent-browser >/dev/null || { echo "ERROR: agent-browser not found. Install the agent-browser skill first."; exit 1; }
```

**Launch**: Try opening directly first. Only close an existing session if the open command fails with a stale session error:

```bash
# Try to open. If it fails (stale session), close first then retry.
agent-browser --headed open <url> 2>&1 || { agent-browser close 2>/dev/null; agent-browser --headed open <url>; }
```

Then verify the RefineKit toolbar is present and expand it.

## Critical: Shadow DOM Access

All RefineKit UI lives inside a Shadow DOM on `#refinekit-host` with `mode: 'open'`. Every selector must go through the shadow root. Use this helper pattern in all `eval` commands:

```javascript
const sr = document.querySelector('#refinekit-host').shadowRoot;
```

**Important:** `agent-browser snapshot -i` will NOT see elements inside Shadow DOM. Use `eval` for all RefineKit UI interactions. Snapshots are only useful for identifying **page elements** (light DOM) to annotate.

## Toolbar Verification

```bash
# 1. Check RefineKit is installed on the page
agent-browser eval "document.querySelector('#refinekit-host') ? 'refinekit found' : 'NOT FOUND'"
# If "NOT FOUND": RefineKit is not installed — stop and tell the user to run /refinekit first

# 2. Check if toolbar is expanded (data-collapsed="false" means expanded)
agent-browser eval "document.querySelector('#refinekit-host').shadowRoot.querySelector('[data-refinekit-toolbar]').getAttribute('data-collapsed') === 'false' ? 'expanded' : 'collapsed'"

# 3. Expand ONLY if collapsed (clicking when already expanded collapses it)
agent-browser eval "((sr) => { const tb = sr.querySelector('[data-refinekit-toolbar]'); if (tb.getAttribute('data-collapsed') === 'false') return 'already expanded'; sr.querySelector('.toolbar-toggle-btn').click(); return 'expanding'; })(document.querySelector('#refinekit-host').shadowRoot)"

# 4. Verify: take a snapshot to confirm page is loaded
agent-browser snapshot -i
```

## How to Create Annotations

The annotation flow has two parts:
1. **Coordinate-click** on the page element (the overlay intercepts at the mouse event level)
2. **eval-based dialog interaction** (dialog is in Shadow DOM, invisible to snapshots)

```bash
# 1. Take interactive snapshot — identify target element and build a CSS selector
agent-browser snapshot -i
# Example: snapshot shows  heading "Welcome to my portfolio" [ref=e10]
# Derive a CSS selector: 'h1', or more specific: 'section:first-of-type h1'

# 2. Scroll the element into view via eval
agent-browser eval "document.querySelector('h1').scrollIntoView({block:'center'})"

# 3. Get its bounding box via eval
agent-browser eval "((r) => r.x+','+r.y+','+r.width+','+r.height)(document.querySelector('h1').getBoundingClientRect())"
# Returns: "383,245,600,40"  (parse these as x,y,width,height)

# 4. Move cursor to element center, then click
#    centerX = x + width/2,  centerY = y + height/2
agent-browser mouse move <centerX> <centerY>
agent-browser mouse down left
agent-browser mouse up left

# 5. Wait a beat for dialog to appear, then fill via eval
#    (Dialog is in Shadow DOM — snapshots won't see it)
agent-browser eval "((sr) => { const ta = sr.querySelector('.dialog-textarea'); if (!ta) return 'NO DIALOG'; ta.value = 'Your critique here'; ta.dispatchEvent(new Event('input')); return 'filled'; })(document.querySelector('#refinekit-host').shadowRoot)"

# 6. Submit by clicking the Add button via eval
agent-browser eval "document.querySelector('#refinekit-host').shadowRoot.querySelector('.dialog-btn-add').click(); 'submitted'"

# 7. Verify the annotation was added
agent-browser eval "document.querySelector('#refinekit-host').shadowRoot.querySelectorAll('[data-annotation-marker]').length"
# Should return the expected count (1 after first, 2 after second, etc.)
```

### If no dialog appears

The overlay may have been dismissed or the toolbar collapsed. Check and recover:

```bash
# Check if dialog is visible
agent-browser eval "((sr) => sr.querySelector('.refinekit-dialog')?.classList.contains('hidden') === false ? 'visible' : 'hidden')(document.querySelector('#refinekit-host').shadowRoot)"

# If hidden, check toolbar is still expanded, then retry the click
agent-browser eval "((sr) => { const tb = sr.querySelector('[data-refinekit-toolbar]'); if (tb.getAttribute('data-collapsed') === 'true') { sr.querySelector('.toolbar-toggle-btn').click(); return 're-expanded'; } return 'toolbar ok'; })(document.querySelector('#refinekit-host').shadowRoot)"
```

### Building CSS selectors from snapshots

The snapshot shows element roles, names, and refs. Map them to CSS selectors:

| Snapshot line | CSS selector |
|--------------|-------------|
| `heading "Welcome" [ref=e10]` | `h1` or `h1:first-of-type` |
| `button "Contact Me" [ref=e15]` | `button` or `.cta-button` |
| `link "GitHub" [ref=e28]` | `a[href*=github]` |
| `paragraph (long text...) [ref=e20]` | `section:nth-of-type(2) p` |
| `img "Profile photo" [ref=e5]` | `img[alt*=Profile]` |

When in doubt, verify with eval:
```bash
agent-browser eval "document.querySelector('h2').textContent"
```

## The Loop

Work top-to-bottom through the page. For each annotation:

1. Scroll to the target area via eval (`scrollIntoView`)
2. Pick a specific element — heading, paragraph, button, image, section container
3. Get its bounding box via eval (`getBoundingClientRect`)
4. Execute the coordinate-click sequence (`mouse move` -> `mouse down` -> `mouse up`)
5. Fill critique text via eval (set `.dialog-textarea.value` + dispatch `input` event)
6. Submit via eval (click `.dialog-btn-add`)
7. Verify the annotation count increased
8. Move to the next area

Aim for 5-8 annotations per page unless told otherwise.

## What to Critique

| Area | What to look for |
|------|-----------------|
| **Hero / above the fold** | Headline hierarchy, CTA placement, visual grouping |
| **Navigation** | Label styling, category grouping, visual weight |
| **Typography** | Font choices, size hierarchy, line height, letter spacing |
| **Color & contrast** | Accessibility, palette cohesion, emphasis through color |
| **Spacing** | Rhythm, padding/margin consistency, breathing room |
| **Images & media** | Sizing, aspect ratios, alignment, alt text |
| **CTAs and buttons** | Conversion weight, visual prominence, hover states |
| **Footer** | Visual separation, information hierarchy, final actions |

## Critique Style

2-3 sentences max per annotation:

- **Specific and actionable**: "Increase heading font-size to 48px and add 24px bottom margin to separate from body text" not "fix the layout"
- **1-2 concrete alternatives**: Reference CSS values, layout patterns, or design systems
- **Name the principle**: Visual hierarchy, Gestalt grouping, whitespace, emphasis, contrast ratio
- **Reference comparable products**: "Like how Stripe/Linear/Vercel handles this"

Bad: "This section needs work"
Good: "This bullet list reads like docs, not a showcase. Use a 3-column card grid with icons — similar to Stripe's feature grid. Creates visual rhythm and scannability."

## Finishing Up

After all annotations are placed:

```bash
# Get the total annotation count
agent-browser eval "document.querySelector('#refinekit-host').shadowRoot.querySelectorAll('[data-annotation-marker]').length"

# Optionally copy annotations to clipboard for the user
agent-browser eval "window.__refinekit.copyAnnotations(); 'copied to clipboard'"

# Take a final screenshot so the user can see all markers
agent-browser screenshot
```

Summarize the annotations you added and ask if the user wants you to address any of them.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "Browser not launched" | Stale session from previous run | `agent-browser close 2>/dev/null` then retry open |
| RefineKit not found on page | Not installed | Run `/refinekit` to set it up first |
| No dialog after clicking | Toolbar collapsed or settings panel open | Re-expand toolbar, close settings via eval, retry |
| "NO DIALOG" from eval | Click didn't register on overlay | Retry coordinate click — ensure overlay is visible |
| Add button stays disabled | Text not filled or `input` event not dispatched | Re-run the fill eval with `dispatchEvent(new Event('input'))` |
| Page navigated on click | Block mode is off | Enable via `eval`: set `data-blocking` to `true` on overlay |
| Annotation count didn't increase | Dialog submission failed | Re-check dialog visibility, re-fill and re-submit |
| Interrupted mid-run (Ctrl+C) | Browser stays open | `agent-browser close` to clean up |

## agent-browser Pitfalls

| Pitfall | What happens | Fix |
|---------|-------------|-----|
| `scrollintoview @ref` | Crashes: "Unsupported token @ref" | Use `eval "document.querySelector('sel').scrollIntoView({block:'center'})"` |
| `get box @ref` | Same crash — parses refs as CSS selectors | Use `eval` with `getBoundingClientRect()` |
| `eval` with double-bang | Bash expands `!!` as history substitution | Use `expr !== null` or ternary instead |
| `eval` with escaped quotes | Breaks across shells | Drop quotes: `[class*=toggleContent]` works for simple values |
| `snapshot -i \| head -50` | Dialog refs won't be visible anyway (Shadow DOM) | Use `eval` for all Shadow DOM interaction |
| `click @ref` on overlay | Click goes through to real DOM, bypasses overlay | Use `mouse move` -> `mouse down left` -> `mouse up left` |

**Rule of thumb**: Use `snapshot -i` to find **page elements** to target. Use `eval` for **all RefineKit UI** interaction.

## Install

The skill must be symlinked into `~/.claude/skills/` for Claude Code to discover it:

```bash
ln -sf "$(pwd)/skills/refinekit-self-driving" ~/.claude/skills/refinekit-self-driving
```

Restart Claude Code after installing. Verify with `/refinekit-self-driving`.
