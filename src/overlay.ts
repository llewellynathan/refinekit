import { CATEGORIES, AnnotationCategory } from './types';

export class Overlay {
  readonly el: HTMLElement;
  private highlight: HTMLElement;
  private enabled = true;
  private blocking = true;
  private currentTarget: Element | null = null;
  private category: AnnotationCategory = 'general';

  onClick?: (target: Element, rect: DOMRect) => void;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'refiner-overlay';
    this.el.setAttribute('data-blocking', 'true');

    this.highlight = document.createElement('div');
    this.highlight.className = 'refiner-highlight';
    this.highlight.style.display = 'none';

    root.appendChild(this.highlight);
    root.appendChild(this.el);

    this.el.addEventListener('mousemove', this.handleMouseMove);
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('mouseleave', () => this.hideHighlight());
  }

  private isOverOwnUI(x: number, y: number): boolean {
    // Check if the point hits any Refiner UI element inside the shadow root
    // (toolbar, dialog, markers) by testing shadow root's elementFromPoint
    const shadowEl = this.root.elementFromPoint(x, y);
    if (!shadowEl) return false;
    // If it hits the overlay itself, that's not "own UI" — that's the transparent layer
    if (shadowEl === this.el || shadowEl === this.highlight) return false;
    // Anything else inside the shadow root is our UI
    return true;
  }

  private handleMouseMove = (e: MouseEvent): void => {
    if (!this.enabled) return;
    if (this.isOverOwnUI(e.clientX, e.clientY)) {
      this.hideHighlight();
      return;
    }

    const target = this.getElementAt(e.clientX, e.clientY);
    if (target && target !== this.currentTarget) {
      this.currentTarget = target;
      this.showHighlight(target);
    }
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.enabled) return;
    // Let clicks on Refiner's own UI (toolbar, dialog, markers) pass through
    if (this.isOverOwnUI(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();

    const target = this.getElementAt(e.clientX, e.clientY);
    if (target) {
      const rect = target.getBoundingClientRect();
      this.onClick?.(target, rect);
    }
  };

  private getElementAt(x: number, y: number): Element | null {
    // Temporarily hide overlay + highlight to do hit test
    this.el.style.pointerEvents = 'none';
    this.highlight.style.pointerEvents = 'none';

    const el = document.elementFromPoint(x, y);

    this.el.style.pointerEvents = '';
    this.highlight.style.pointerEvents = '';

    // Ignore our own shadow host
    if (el && el === this.root.host) return null;
    return el;
  }

  private showHighlight(target: Element): void {
    const rect = target.getBoundingClientRect();
    const catConfig = CATEGORIES.find((c) => c.id === this.category);
    const color = catConfig?.color ?? '#94A3B8';

    this.highlight.style.display = 'block';
    this.highlight.style.top = `${rect.top - 2}px`;
    this.highlight.style.left = `${rect.left - 2}px`;
    this.highlight.style.width = `${rect.width + 4}px`;
    this.highlight.style.height = `${rect.height + 4}px`;
    this.highlight.style.borderColor = color;
  }

  private hideHighlight(): void {
    this.highlight.style.display = 'none';
    this.currentTarget = null;
  }

  setCategory(category: AnnotationCategory): void {
    this.category = category;
  }

  setBlocking(blocking: boolean): void {
    this.blocking = blocking;
    this.el.setAttribute('data-blocking', String(blocking));
    if (!blocking) {
      this.hideHighlight();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    this.el.classList.toggle('hidden', !enabled);
    if (!enabled) this.hideHighlight();
  }
}
