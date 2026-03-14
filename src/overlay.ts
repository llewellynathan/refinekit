export class Overlay {
  readonly el: HTMLElement;
  private highlight: HTMLElement;
  private enabled = true;
  private blocking = true;
  private currentTarget: Element | null = null;
  private highlightColor = '#7C3AED';

  inspectMode = false;

  onClick?: (target: Element, rect: DOMRect) => void;
  onHoverChange?: (target: Element | null, rect: DOMRect | null) => void;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'refinekit-overlay';
    this.el.setAttribute('data-blocking', 'true');

    this.highlight = document.createElement('div');
    this.highlight.className = 'refinekit-highlight';
    this.highlight.style.display = 'none';

    root.appendChild(this.highlight);
    root.appendChild(this.el);

    this.el.addEventListener('mousemove', this.handleMouseMove);
    this.el.addEventListener('click', this.handleClick);
    this.el.addEventListener('mouseleave', () => this.hideHighlight());

    document.addEventListener('keydown', this.handleKeyBlock, true);
  }

  private isOverOwnUI(x: number, y: number): boolean {
    const shadowEl = this.root.elementFromPoint(x, y);
    if (!shadowEl) return false;
    if (shadowEl === this.el || shadowEl === this.highlight) return false;
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
      this.onHoverChange?.(target, target.getBoundingClientRect());
    }
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.enabled) return;
    if (this.isOverOwnUI(e.clientX, e.clientY)) return;

    e.preventDefault();
    e.stopPropagation();

    if (this.inspectMode) return;

    const target = this.getElementAt(e.clientX, e.clientY);
    if (target) {
      const rect = target.getBoundingClientRect();
      this.onClick?.(target, rect);
    }
  };

  private handleKeyBlock = (e: KeyboardEvent): void => {
    if (!this.enabled || !this.blocking) return;
    // Allow keys when focus is inside refinekit's own UI (e.g. annotation dialog textarea)
    const target = e.target as Element;
    if (target && (target === this.root.host || this.root.host.contains(target))) return;

    e.preventDefault();
    e.stopPropagation();
  };

  private getElementAt(x: number, y: number): Element | null {
    this.el.style.pointerEvents = 'none';
    this.highlight.style.pointerEvents = 'none';

    const el = document.elementFromPoint(x, y);

    this.el.style.pointerEvents = '';
    this.highlight.style.pointerEvents = '';

    if (el && el === this.root.host) return null;
    return el;
  }

  private showHighlight(target: Element): void {
    const rect = target.getBoundingClientRect();
    this.highlight.style.display = 'block';
    this.highlight.style.top = `${rect.top - 2}px`;
    this.highlight.style.left = `${rect.left - 2}px`;
    this.highlight.style.width = `${rect.width + 4}px`;
    this.highlight.style.height = `${rect.height + 4}px`;
    this.highlight.style.borderColor = this.highlightColor;
    this.highlight.style.borderStyle = this.inspectMode ? 'solid' : 'dashed';
  }

  private hideHighlight(): void {
    this.highlight.style.display = 'none';
    this.currentTarget = null;
    this.onHoverChange?.(null, null);
  }

  setHighlightColor(color: string): void {
    this.highlightColor = color;
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
