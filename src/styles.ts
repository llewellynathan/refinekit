export const STYLES = `
  :host {
    all: initial;
    position: fixed;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #1a1a2e;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  /* ── Toolbar ── */

  .refinekit-toolbar {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 10;
    user-select: none;
  }

  .toolbar-pill {
    display: flex;
    align-items: center;
    position: relative;
    background: #1a1a2e;
    border-radius: 100px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25), 0 2px 8px rgba(0, 0, 0, 0.15);
    padding: 6px;
    transform: scale(1);
    transform-origin: right center;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .refinekit-toolbar[data-collapsed="true"] .toolbar-pill {
    transform: scale(0.92);
  }

  .toolbar-inner {
    display: flex;
    align-items: center;
    gap: 2px;
    overflow: hidden;
    clip-path: inset(0);
    max-width: 300px;
    opacity: 1;
    padding-right: 2px;
    transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.2s ease 0.1s,
                padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .refinekit-toolbar[data-collapsed="true"] .toolbar-inner {
    max-width: 0;
    opacity: 0;
    padding-right: 0;
    transition: max-width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
                opacity 0.15s ease,
                padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toolbar-btn {
    position: relative;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: #a0a0b8;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.15s, background 0.15s;
  }

  .toolbar-btn:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .toolbar-btn.active {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.15);
  }

  .toolbar-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .toolbar-count {
    font-size: 14px;
    font-weight: 700;
    min-width: 18px;
    text-align: center;
  }

  .toolbar-divider {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.15);
    margin: 0 4px;
    flex-shrink: 0;
  }

  /* Tooltip */
  .toolbar-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background: #1a1a2e;
    color: #e8e8f0;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
  }

  .toolbar-tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #1a1a2e;
  }

  .toolbar-btn:hover .toolbar-tooltip {
    opacity: 1;
  }

  .tooltips-hidden .toolbar-tooltip {
    display: none;
  }

  .toolbar-btn.disabled {
    opacity: 0.3;
    cursor: default;
  }

  .toolbar-btn.disabled:hover {
    color: #a0a0b8;
    background: transparent;
  }

  /* Toggle button (always visible) */
  .toolbar-toggle-btn {
    flex-shrink: 0;
  }

  /* Badge for collapsed state */
  .toolbar-expand-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 10px;
    background: #DC2626;
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  }

  .toolbar-expand-badge.hidden {
    display: none;
  }

  /* ── Settings Panel ── */

  .settings-panel {
    position: fixed;
    bottom: 80px;
    right: 24px;
    width: 300px;
    z-index: 12;
    background: #1a1a2e;
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 20px;
    color: #e8e8f0;
    transform-origin: bottom right;
    transition: transform 0.25s ease, opacity 0.1s ease;
    transform: scale(1);
    opacity: 1;
  }

  .settings-panel.hidden {
    transform: scale(0.4);
    opacity: 0;
    pointer-events: none;
  }

  .settings-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
  }

  .settings-title {
    font-size: 16px;
    font-weight: 700;
    font-style: normal;
    color: #ffffff;
  }

  .settings-version {
    font-size: 12px;
    color: #6b6b80;
    font-weight: 500;
  }

  .settings-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.08);
    margin: 16px 0;
  }

  .settings-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .settings-label {
    font-size: 14px;
    font-weight: 500;
    color: #c0c0d0;
  }

  .settings-color-row {
    display: flex;
    gap: 8px;
  }

  .settings-swatch {
    width: 24px;
    height: 24px;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: transform 0.15s, border-color 0.15s;
    outline: none;
  }

  .settings-swatch:hover {
    transform: scale(1.1);
  }

  .settings-swatch.selected {
    border-color: #ffffff;
    transform: scale(1.1);
  }

  .settings-check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 2px 0;
  }

  .settings-checkbox {
    appearance: none;
    -webkit-appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 5px;
    border: 2px solid #4a4a60;
    background: transparent;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.15s, border-color 0.15s;
  }

  .settings-checkbox:checked {
    background: #2563EB;
    border-color: #2563EB;
  }

  .settings-checkbox:checked::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 5px;
    width: 5px;
    height: 9px;
    border: solid #ffffff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }

  .settings-check-label {
    font-size: 14px;
    font-weight: 500;
    color: #e8e8f0;
  }

  /* ── Overlay ── */

  .refinekit-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    cursor: crosshair;
    z-index: 1;
  }

  .refinekit-overlay[data-blocking="true"] {
    pointer-events: all;
  }

  .refinekit-overlay[data-blocking="false"] {
    pointer-events: none;
  }

  .refinekit-overlay.hidden {
    display: none;
  }

  /* ── Highlight ── */

  .refinekit-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px dashed;
    border-radius: 3px;
    z-index: 2;
    transition: all 0.1s ease;
  }

  /* ── Dialog ── */

  .refinekit-dialog {
    position: fixed;
    width: 320px;
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 16px;
    z-index: 11;
    color: #e8e8f0;
    animation: dialog-in 0.2s ease;
  }

  @keyframes dialog-in {
    from { opacity: 0; transform: translateY(4px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .refinekit-dialog.hidden {
    display: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .dialog-header span {
    font-size: 12px;
    font-weight: 600;
    color: #c0c0d0;
  }

  .dialog-textarea {
    width: 100%;
    min-height: 72px;
    padding: 10px 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
    color: #e8e8f0;
    background: rgba(255, 255, 255, 0.06);
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }

  .dialog-textarea:focus {
    border-color: rgba(255, 255, 255, 0.25);
  }

  .dialog-textarea::placeholder {
    color: #6b6b80;
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 12px;
  }

  .dialog-btn {
    height: 32px;
    padding: 0 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .dialog-btn-cancel {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #a0a0b8;
  }

  .dialog-btn-cancel:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #e8e8f0;
  }

  .dialog-btn-add {
    background: #2563EB;
    border: none;
    color: #ffffff;
  }

  .dialog-btn-add:hover {
    background: #3B82F6;
  }

  .dialog-btn-add:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* ── Markers ── */

  .refinekit-marker {
    position: fixed;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    color: #ffffff;
    cursor: pointer;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s;
    pointer-events: all;
  }

  .refinekit-marker:hover {
    transform: scale(1.2);
  }

  .refinekit-marker[data-resolved="true"] {
    opacity: 0.4;
  }

  .marker-tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    width: 220px;
    padding: 10px 12px;
    background: #1a1a2e;
    color: #e8e8f0;
    font-size: 12px;
    line-height: 1.4;
    border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .refinekit-marker:hover .marker-tooltip {
    opacity: 1;
  }

  .marker-tooltip-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
    border-top: 1px solid rgba(255,255,255,0.1);
    padding-top: 8px;
  }

  .marker-tooltip-btn {
    height: 22px;
    padding: 0 8px;
    border-radius: 5px;
    border: none;
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }

  .marker-tooltip-btn.resolve {
    background: #34D399;
    color: #0a2e1f;
  }

  .marker-tooltip-btn.resolve:hover {
    background: #4ade80;
  }

  .marker-tooltip-btn.delete {
    background: rgba(255,255,255,0.1);
    color: #e8e8f0;
  }

  .marker-tooltip-btn.delete:hover {
    background: #FF6B6B;
    color: #fff;
  }

  /* MCP status */
  .settings-mcp-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
  }

  .settings-mcp-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .settings-mcp-dot.connected {
    background: #34D399;
    box-shadow: 0 0 6px #34D39980;
  }

  .settings-mcp-dot.disconnected {
    background: #6B7280;
  }

  /* ── Inspect Panel ── */

  .inspect-panel {
    position: fixed;
    width: 280px;
    max-height: 80vh;
    overflow-y: auto;
    z-index: 13;
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2);
    padding: 16px;
    color: #e8e8f0;
    animation: dialog-in 0.15s ease;
  }

  .inspect-panel.hidden {
    display: none;
  }

  .inspect-panel.locked {
    border-color: rgba(37, 99, 235, 0.4);
  }

  .inspect-element-tag {
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    color: #2563EB;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .inspect-element-selector {
    font-size: 11px;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    color: #6b6b80;
    margin-bottom: 12px;
    word-break: break-all;
  }

  .inspect-section-title {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b6b80;
    margin-bottom: 6px;
    margin-top: 12px;
  }

  .inspect-section-title:first-child {
    margin-top: 0;
  }

  .inspect-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.1s;
    gap: 12px;
  }

  .inspect-row:hover {
    background: rgba(255, 255, 255, 0.06);
  }

  .inspect-row.copied {
    background: rgba(37, 99, 235, 0.2);
  }

  .inspect-row-label {
    font-size: 11px;
    color: #6b6b80;
    font-weight: 500;
    flex-shrink: 0;
  }

  .inspect-row-value {
    font-size: 12px;
    color: #e8e8f0;
    font-weight: 500;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: right;
  }

  .inspect-color-swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    margin-right: 6px;
    vertical-align: middle;
  }

  .inspect-panel::-webkit-scrollbar {
    width: 4px;
  }

  .inspect-panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .inspect-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 2px;
  }
`;
