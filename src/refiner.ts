import { RefinerOptions } from './types';
import { STYLES } from './styles';
import { AnnotationStore } from './annotation-store';
import { Toolbar } from './toolbar';
import { Overlay } from './overlay';
import { AnnotationDialog } from './annotation-dialog';
import { AnnotationMarkers } from './annotation-marker';
import { SettingsPanel } from './settings';
import { generateSelector } from './selector';
import { McpBridge } from './mcp-bridge';

export class Refiner {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private store: AnnotationStore;
  private toolbar: Toolbar;
  private overlay: Overlay;
  private dialog: AnnotationDialog;
  private markers: AnnotationMarkers;
  private settings: SettingsPanel;
  private mcpBridge: McpBridge | null = null;
  private currentTarget: Element | null = null;
  private currentRect: DOMRect | null = null;
  private clearOnCopy = false;

  constructor(options: RefinerOptions = {}) {
    // Create shadow host
    this.host = document.createElement('div');
    this.host.id = 'refiner-host';
    this.shadow = this.host.attachShadow({ mode: 'open' });

    // Inject styles
    const style = document.createElement('style');
    style.textContent = STYLES;
    this.shadow.appendChild(style);

    // Initialize components
    this.store = new AnnotationStore();
    this.toolbar = new Toolbar(this.shadow);
    this.settings = new SettingsPanel(this.shadow);
    this.overlay = new Overlay(this.shadow);
    this.dialog = new AnnotationDialog(this.shadow);
    this.markers = new AnnotationMarkers(this.shadow, this.store);

    // Wire up toolbar
    this.toolbar.onCopy = () => this.copyAnnotations();
    this.toolbar.onClear = () => this.clearAnnotations();
    this.toolbar.onSettings = () => {
      this.settings.toggle();
      this.toolbar.setSettingsOpen(this.settings.isVisible());
    };

    this.toolbar.onCollapse = () => {
      this.settings.hide();
      this.toolbar.setSettingsOpen(false);
    };

    // Wire up settings
    this.settings.onChange = (s) => {
      this.clearOnCopy = s.clearOnCopy;
      this.overlay.setBlocking(s.blockInteractions);
      this.markers.setColor(s.markerColor);
      this.overlay.setHighlightColor(s.markerColor);
    };

    // Wire up overlay click
    this.overlay.onClick = (target, rect) => {
      if (this.settings.isVisible()) {
        this.settings.hide();
        return;
      }
      if (this.dialog.isVisible()) {
        this.dialog.hide();
        return;
      }
      this.currentTarget = target;
      this.currentRect = rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.dialog.show(centerX, centerY);
    };

    // Wire up dialog submit
    this.dialog.onSubmit = (text) => {
      if (this.currentTarget && this.currentRect) {
        const selector = generateSelector(this.currentTarget);
        this.store.add(selector, this.currentRect, text);
        this.toolbar.updateCount(this.store.getCount());
      }
      this.currentTarget = null;
      this.currentRect = null;
    };

    this.dialog.onCancel = () => {
      this.currentTarget = null;
      this.currentRect = null;
    };

    // Update count on resolve/remove
    this.store.on('resolve', () => this.toolbar.updateCount(this.store.getCount()));
    this.store.on('remove', () => this.toolbar.updateCount(this.store.getCount()));

    // MCP bridge (auto-discover by default)
    if (options.mcpEnabled !== false) {
      this.mcpBridge = new McpBridge(this.store, options.mcpPort);
      this.mcpBridge.onChange = (connected) => {
        this.settings.setMcpStatus(connected);
      };
    }

    // Mount
    document.body.appendChild(this.host);

    if (options.enabled === false) {
      this.disable();
    }
  }

  enable(): void {
    this.host.style.display = '';
    this.overlay.setEnabled(true);
  }

  disable(): void {
    this.host.style.display = 'none';
    this.overlay.setEnabled(false);
  }

  destroy(): void {
    this.mcpBridge?.destroy();
    this.host.remove();
  }

  getAnnotations() {
    return this.store.getAll();
  }

  getAnnotationCount(): number {
    return this.store.getCount();
  }

  formatForAgent(): string {
    const annotations = this.store.getAll();
    if (annotations.length === 0) return 'No annotations.';

    const pageTitle = document.title || window.location.pathname;
    const pathname = window.location.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1) || 'index.html';
    const lines: string[] = [
      `# Design Annotations — ${pageTitle}`,
      `**File:** \`${filename}\``,
      '',
    ];

    for (let i = 0; i < annotations.length; i++) {
      const a = annotations[i];
      const status = a.resolved ? ' (resolved)' : '';
      lines.push(`## ${i + 1}.${status}`);
      lines.push(`**Element:** \`${a.targetSelector}\``);
      lines.push(`**Issue:** ${a.text}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  clearAnnotations(): void {
    const all = this.store.getAll();
    for (const a of all) {
      this.store.remove(a.id);
    }
    this.toolbar.updateCount(0);
  }

  copyAnnotations(): void {
    const text = this.formatForAgent();
    navigator.clipboard.writeText(text);

    if (this.clearOnCopy) {
      this.clearAnnotations();
    }
  }
}
