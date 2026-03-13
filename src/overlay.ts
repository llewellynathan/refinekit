export class Overlay {
  readonly el: HTMLElement;
  private highlight: HTMLElement;
  private enabled = true;
  private blocking = true;
  private currentTarget: Element | null = null;
  private highlightColor = '#7C3AED';

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
    }
  };

  private handleClick = (e: MouseEvent): void => {
    if (!this.enabled) return;
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
  }

  private hideHighlight(): void {
    this.highlight.style.display = 'none';
    this.currentTarget = null;
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
