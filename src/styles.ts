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

  .refiner-toolbar {
    position: fixed;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: #ffffff;
    border: 1px solid #e2e2e8;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: transform 0.25s ease, opacity 0.25s ease;
    user-select: none;
  }

  .refiner-toolbar[data-position="right"] {
    right: 16px;
  }

  .refiner-toolbar[data-position="left"] {
    left: 16px;
  }

  .refiner-toolbar[data-collapsed="true"] {
    padding: 6px;
    gap: 0;
  }

  .refiner-toolbar[data-collapsed="true"] .toolbar-body {
    display: none;
  }

  .toolbar-toggle {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 10px;
    background: #f0f0f5;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: background 0.15s;
  }

  .toolbar-toggle:hover {
    background: #e4e4ed;
  }

  .toolbar-body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .toolbar-divider {
    height: 1px;
    background: #e2e2e8;
    margin: 2px 0;
  }

  .toolbar-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #8888a0;
    padding: 0 2px;
  }

  .category-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
  }

  .category-btn {
    width: 100%;
    height: 28px;
    border: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.1s, border-color 0.15s;
    position: relative;
  }

  .category-btn:hover {
    transform: scale(1.1);
  }

  .category-btn[data-selected="true"] {
    border-color: #1a1a2e;
    transform: scale(1.1);
  }

  .category-btn[title]::after {
    content: attr(title);
    position: absolute;
    bottom: -18px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 9px;
    color: #8888a0;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.15s;
    pointer-events: none;
  }

  .category-btn:hover::after {
    opacity: 1;
  }

  .toolbar-action {
    width: 100%;
    height: 32px;
    border: 1px solid #e2e2e8;
    border-radius: 8px;
    background: #fafafc;
    cursor: pointer;
    font-size: 11px;
    font-weight: 500;
    color: #4a4a60;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: background 0.15s, border-color 0.15s;
  }

  .toolbar-action:hover {
    background: #f0f0f5;
    border-color: #d0d0dc;
  }

  .toolbar-action.active {
    background: #1a1a2e;
    color: #ffffff;
    border-color: #1a1a2e;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 9px;
    background: #1a1a2e;
    color: #ffffff;
    font-size: 10px;
    font-weight: 700;
  }

  /* ── Overlay ── */

  .refiner-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    cursor: crosshair;
    z-index: 1;
  }

  .refiner-overlay[data-blocking="true"] {
    pointer-events: all;
  }

  .refiner-overlay[data-blocking="false"] {
    pointer-events: none;
  }

  .refiner-overlay.hidden {
    display: none;
  }

  /* ── Highlight ── */

  .refiner-highlight {
    position: fixed;
    pointer-events: none;
    border: 2px dashed;
    border-radius: 3px;
    z-index: 2;
    transition: all 0.1s ease;
  }

  /* ── Dialog ── */

  .refiner-dialog {
    position: fixed;
    width: 320px;
    background: #ffffff;
    border: 1px solid #e2e2e8;
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 16px;
    z-index: 11;
    animation: dialog-in 0.2s ease;
  }

  @keyframes dialog-in {
    from { opacity: 0; transform: translateY(4px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  .refiner-dialog.hidden {
    display: none;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .dialog-header .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .dialog-header span {
    font-size: 12px;
    font-weight: 600;
    color: #4a4a60;
  }

  .dialog-textarea {
    width: 100%;
    min-height: 72px;
    padding: 10px 12px;
    border: 1px solid #e2e2e8;
    border-radius: 10px;
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
    color: #1a1a2e;
    background: #fafafc;
    resize: vertical;
    outline: none;
    transition: border-color 0.15s;
  }

  .dialog-textarea:focus {
    border-color: #a0a0b8;
  }

  .dialog-textarea::placeholder {
    color: #b0b0c0;
  }

  .dialog-categories {
    display: flex;
    gap: 4px;
    margin-top: 10px;
    flex-wrap: wrap;
  }

  .dialog-cat-btn {
    height: 24px;
    padding: 0 8px;
    border: 1px solid #e2e2e8;
    border-radius: 6px;
    background: #fafafc;
    font-size: 11px;
    font-weight: 500;
    color: #4a4a60;
    cursor: pointer;
    transition: all 0.15s;
  }

  .dialog-cat-btn:hover {
    border-color: #c0c0d0;
  }

  .dialog-cat-btn[data-selected="true"] {
    color: #ffffff;
    border-color: transparent;
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
    border: 1px solid #e2e2e8;
    color: #4a4a60;
  }

  .dialog-btn-cancel:hover {
    background: #f0f0f5;
  }

  .dialog-btn-add {
    background: #1a1a2e;
    border: none;
    color: #ffffff;
  }

  .dialog-btn-add:hover {
    background: #2a2a45;
  }

  .dialog-btn-add:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── Markers ── */

  .refiner-marker {
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

  .refiner-marker:hover {
    transform: scale(1.2);
  }

  .refiner-marker[data-resolved="true"] {
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

  .refiner-marker:hover .marker-tooltip {
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
`;
