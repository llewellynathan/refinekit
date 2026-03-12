import { CATEGORIES, AnnotationCategory } from './types';

export class Toolbar {
  readonly el: HTMLElement;
  private collapsed = false;
  private blocking = true;
  private selectedCategory: AnnotationCategory = 'general';
  private countBadge!: HTMLElement;
  private blockBtn!: HTMLElement;

  onCategoryChange?: (category: AnnotationCategory) => void;
  onBlockingChange?: (blocking: boolean) => void;
  onCopy?: () => void;
  onExport?: () => void;

  constructor(private root: ShadowRoot, position: 'left' | 'right' = 'right') {
    this.el = document.createElement('div');
    this.el.className = 'refiner-toolbar';
    this.el.setAttribute('data-refiner-toolbar', '');
    this.el.setAttribute('data-position', position);
    this.el.setAttribute('data-collapsed', 'false');
    this.render();
    root.appendChild(this.el);
  }

  private render(): void {
    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'toolbar-toggle';
    toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    toggle.addEventListener('click', () => this.toggleCollapse());
    this.el.appendChild(toggle);

    // Body
    const body = document.createElement('div');
    body.className = 'toolbar-body';

    // Count
    const countRow = document.createElement('div');
    countRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:2px 2px;';
    const countLabel = document.createElement('span');
    countLabel.className = 'toolbar-label';
    countLabel.textContent = 'Notes';
    this.countBadge = document.createElement('span');
    this.countBadge.className = 'badge';
    this.countBadge.textContent = '0';
    countRow.appendChild(countLabel);
    countRow.appendChild(this.countBadge);
    body.appendChild(countRow);

    // Divider
    body.appendChild(this.createDivider());

    // Category label
    const catLabel = document.createElement('span');
    catLabel.className = 'toolbar-label';
    catLabel.textContent = 'Category';
    body.appendChild(catLabel);

    // Category grid
    const grid = document.createElement('div');
    grid.className = 'category-grid';
    for (const cat of CATEGORIES) {
      const btn = document.createElement('button');
      btn.className = 'category-btn';
      btn.style.background = cat.color;
      btn.title = cat.label;
      btn.setAttribute('data-category', cat.id);
      btn.setAttribute('data-selected', cat.id === this.selectedCategory ? 'true' : 'false');
      btn.addEventListener('click', () => {
        this.selectedCategory = cat.id;
        grid.querySelectorAll('.category-btn').forEach((b) =>
          (b as HTMLElement).setAttribute('data-selected', 'false')
        );
        btn.setAttribute('data-selected', 'true');
        this.onCategoryChange?.(cat.id);
      });
      grid.appendChild(btn);
    }
    body.appendChild(grid);

    // Divider
    body.appendChild(this.createDivider());

    // Block interactions button
    this.blockBtn = document.createElement('button');
    this.blockBtn.className = 'toolbar-action active';
    this.blockBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Block`;
    this.blockBtn.addEventListener('click', () => {
      this.blocking = !this.blocking;
      this.blockBtn.classList.toggle('active', this.blocking);
      this.onBlockingChange?.(this.blocking);
    });
    body.appendChild(this.blockBtn);

    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'toolbar-action';
    copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy`;
    copyBtn.addEventListener('click', () => {
      this.onCopy?.();
      const original = copyBtn.innerHTML;
      copyBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied`;
      copyBtn.classList.add('active');
      setTimeout(() => {
        copyBtn.innerHTML = original;
        copyBtn.classList.remove('active');
      }, 1500);
    });
    body.appendChild(copyBtn);

    // Export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'toolbar-action';
    exportBtn.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export`;
    exportBtn.addEventListener('click', () => this.onExport?.());
    body.appendChild(exportBtn);

    this.el.appendChild(body);
  }

  private createDivider(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'toolbar-divider';
    return div;
  }

  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.el.setAttribute('data-collapsed', String(this.collapsed));
  }

  getSelectedCategory(): AnnotationCategory {
    return this.selectedCategory;
  }

  isBlocking(): boolean {
    return this.blocking;
  }

  updateCount(count: number): void {
    this.countBadge.textContent = String(count);
  }
}
