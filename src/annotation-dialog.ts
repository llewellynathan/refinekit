import { CATEGORIES, AnnotationCategory } from './types';

export class AnnotationDialog {
  readonly el: HTMLElement;
  private textarea!: HTMLTextAreaElement;
  private addBtn!: HTMLButtonElement;
  private selectedCategory: AnnotationCategory = 'general';
  private catButtons: HTMLButtonElement[] = [];

  onSubmit?: (text: string, category: AnnotationCategory) => void;
  onCancel?: () => void;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'refiner-dialog hidden';
    this.render();
    root.appendChild(this.el);
  }

  private render(): void {
    // Header
    const header = document.createElement('div');
    header.className = 'dialog-header';
    const dot = document.createElement('div');
    dot.className = 'dot';
    const label = document.createElement('span');
    label.textContent = 'What should change?';
    header.appendChild(dot);
    header.appendChild(label);
    this.el.appendChild(header);

    // Textarea
    this.textarea = document.createElement('textarea');
    this.textarea.className = 'dialog-textarea';
    this.textarea.placeholder = 'Describe the issue or improvement...';
    this.textarea.addEventListener('input', () => {
      this.addBtn.disabled = this.textarea.value.trim().length === 0;
    });
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && this.textarea.value.trim()) {
        this.submit();
      }
      if (e.key === 'Escape') {
        this.hide();
        this.onCancel?.();
      }
    });
    this.el.appendChild(this.textarea);

    // Category row
    const catRow = document.createElement('div');
    catRow.className = 'dialog-categories';
    for (const cat of CATEGORIES) {
      const btn = document.createElement('button');
      btn.className = 'dialog-cat-btn';
      btn.textContent = cat.label;
      btn.setAttribute('data-category', cat.id);
      btn.setAttribute('data-selected', cat.id === this.selectedCategory ? 'true' : 'false');
      btn.addEventListener('click', () => this.selectCategory(cat.id));
      this.catButtons.push(btn);
      catRow.appendChild(btn);
    }
    this.el.appendChild(catRow);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'dialog-actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'dialog-btn dialog-btn-cancel';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      this.hide();
      this.onCancel?.();
    });

    this.addBtn = document.createElement('button');
    this.addBtn.className = 'dialog-btn dialog-btn-add';
    this.addBtn.textContent = 'Add';
    this.addBtn.disabled = true;
    this.addBtn.addEventListener('click', () => this.submit());

    actions.appendChild(cancelBtn);
    actions.appendChild(this.addBtn);
    this.el.appendChild(actions);
  }

  private selectCategory(id: AnnotationCategory): void {
    this.selectedCategory = id;
    const catConfig = CATEGORIES.find((c) => c.id === id);
    for (const btn of this.catButtons) {
      const isSelected = btn.getAttribute('data-category') === id;
      btn.setAttribute('data-selected', String(isSelected));
      if (isSelected && catConfig) {
        btn.style.background = catConfig.color;
        btn.style.color = '#ffffff';
        btn.style.borderColor = 'transparent';
      } else {
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
      }
    }
  }

  private submit(): void {
    const text = this.textarea.value.trim();
    if (text) {
      this.onSubmit?.(text, this.selectedCategory);
      this.hide();
    }
  }

  show(x: number, y: number, category: AnnotationCategory): void {
    this.selectedCategory = category;
    this.selectCategory(category);

    // Update header dot color
    const catConfig = CATEGORIES.find((c) => c.id === category);
    const dot = this.el.querySelector('.dot') as HTMLElement;
    if (dot && catConfig) dot.style.background = catConfig.color;

    // Position: prefer below-right of click, but keep on screen
    const dialogW = 320;
    const dialogH = 260;
    let left = x + 12;
    let top = y + 12;

    if (left + dialogW > window.innerWidth - 16) {
      left = x - dialogW - 12;
    }
    if (top + dialogH > window.innerHeight - 16) {
      top = y - dialogH - 12;
    }

    this.el.style.left = `${Math.max(16, left)}px`;
    this.el.style.top = `${Math.max(16, top)}px`;
    this.el.classList.remove('hidden');

    this.textarea.value = '';
    this.addBtn.disabled = true;
    requestAnimationFrame(() => this.textarea.focus());
  }

  hide(): void {
    this.el.classList.add('hidden');
    this.textarea.value = '';
  }

  isVisible(): boolean {
    return !this.el.classList.contains('hidden');
  }
}
