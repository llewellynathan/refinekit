import { RefinerOptions, CATEGORIES } from './types';
import { STYLES } from './styles';
import { AnnotationStore } from './annotation-store';
import { Toolbar } from './toolbar';
import { Overlay } from './overlay';
import { AnnotationDialog } from './annotation-dialog';
import { AnnotationMarkers } from './annotation-marker';
import { generateSelector } from './selector';

export class Refiner {
  private host: HTMLDivElement;
  private shadow: ShadowRoot;
  private store: AnnotationStore;
  private toolbar: Toolbar;
  private overlay: Overlay;
  private dialog: AnnotationDialog;
  private markers: AnnotationMarkers;
  private currentTarget: Element | null = null;
  private currentRect: DOMRect | null = null;

  constructor(options: RefinerOptions = {}) {
    const position = options.position ?? 'right';

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
    this.toolbar = new Toolbar(this.shadow, position);
    this.overlay = new Overlay(this.shadow);
    this.dialog = new AnnotationDialog(this.shadow);
    this.markers = new AnnotationMarkers(this.shadow, this.store);

    // Wire up toolbar events
    this.toolbar.onCategoryChange = (cat) => {
      this.overlay.setCategory(cat);
    };

    this.toolbar.onBlockingChange = (blocking) => {
      this.overlay.setBlocking(blocking);
    };

    this.toolbar.onCopy = () => this.copyAnnotations();

    this.toolbar.onExport = () => this.exportAnnotations();

    // Wire up overlay click
    this.overlay.onClick = (target, rect) => {
      if (this.dialog.isVisible()) {
        this.dialog.hide();
        return;
      }
      this.currentTarget = target;
      this.currentRect = rect;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      this.dialog.show(centerX, centerY, this.toolbar.getSelectedCategory());
    };

    // Wire up dialog submit
    this.dialog.onSubmit = (text, category) => {
      if (this.currentTarget && this.currentRect) {
        const selector = generateSelector(this.currentTarget);
        this.store.add(selector, this.currentRect, category, text);
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
    const lines: string[] = [`# Design Annotations — ${pageTitle}`, ''];

    for (let i = 0; i < annotations.length; i++) {
      const a = annotations[i];
      const cat = CATEGORIES.find((c) => c.id === a.category);
      const status = a.resolved ? ' (resolved)' : '';
      lines.push(`## ${i + 1}. [${cat?.label ?? a.category}]${status}`);
      lines.push(`**Element:** \`${a.targetSelector}\``);
      lines.push(`**Issue:** ${a.text}`);
      lines.push('');
    }

    return lines.join('\n');
  }

  copyAnnotations(): void {
    const text = this.formatForAgent();
    navigator.clipboard.writeText(text);
  }

  exportAnnotations(): void {
    const json = this.store.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `refiner-annotations-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
