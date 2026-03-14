export class Toolbar {
  readonly el: HTMLElement;
  private collapsed = true;
  private countBadge!: HTMLElement;
  private expandBadge!: HTMLElement;
  private innerEl!: HTMLElement;
  private copyBtn!: HTMLElement;
  private clearBtn!: HTMLElement;
  private toggleBtn!: HTMLElement;
  private inspectBtn!: HTMLElement;
  private inspectActive = false;
  private settingsOpen = false;

  onCopy?: () => void;
  onClear?: () => void;
  onSettings?: () => void;
  onCollapse?: () => void;
  onExpand?: () => void;
  onInspectToggle?: (active: boolean) => void;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'refinekit-toolbar';
    this.el.setAttribute('data-refinekit-toolbar', '');
    this.el.setAttribute('data-collapsed', 'true');
    this.render();
    root.appendChild(this.el);

    // Expand on first load after a short delay
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.collapsed = false;
        this.el.setAttribute('data-collapsed', 'false');
        this.updateBadgeVisibility();
      });
    });
  }

  private render(): void {
    const pill = document.createElement('div');
    pill.className = 'toolbar-pill';

    // Inner (collapsible buttons)
    this.innerEl = document.createElement('div');
    this.innerEl.className = 'toolbar-inner';

    // Note count
    this.countBadge = document.createElement('span');
    this.countBadge.className = 'toolbar-count';
    this.countBadge.textContent = '0';
    this.innerEl.appendChild(this.createBtn(
      this.countBadge,
      'Annotations',
      null,
    ));

    // Copy
    const copyIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
    const checkIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>`;
    this.copyBtn = this.createBtn(
      copyIcon,
      'Copy annotations',
      () => {
        if (this.copyBtn.classList.contains('disabled')) return;
        this.onCopy?.();
        this.copyBtn.querySelector('.toolbar-icon')!.innerHTML = checkIcon;
        setTimeout(() => {
          this.copyBtn.querySelector('.toolbar-icon')!.innerHTML = copyIcon;
        }, 1500);
      },
    );
    this.copyBtn.classList.add('disabled');
    this.innerEl.appendChild(this.copyBtn);

    // Clear all
    this.clearBtn = this.createBtn(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      'Clear all',
      () => {
        if (this.clearBtn.classList.contains('disabled')) return;
        this.onClear?.();
      },
    );
    this.clearBtn.classList.add('disabled');
    this.innerEl.appendChild(this.clearBtn);

    // Inspect
    this.inspectBtn = this.createBtn(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      'Inspect element',
      () => {
        this.inspectActive = !this.inspectActive;
        this.inspectBtn.classList.toggle('active', this.inspectActive);
        this.onInspectToggle?.(this.inspectActive);
      },
    );
    this.innerEl.appendChild(this.inspectBtn);

    // Settings
    this.innerEl.appendChild(this.createBtn(
      `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
      'Settings',
      () => this.onSettings?.(),
    ));

    // Divider
    const divider = document.createElement('div');
    divider.className = 'toolbar-divider';
    this.innerEl.appendChild(divider);

    pill.appendChild(this.innerEl);

    // Toggle button (always visible — pen when collapsed, X when expanded)
    const penIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`;
    const xIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

    this.toggleBtn = this.createBtn(
      penIcon,
      '',
      () => this.toggleCollapse(),
    );
    this.toggleBtn.classList.add('toolbar-toggle-btn');
    pill.appendChild(this.toggleBtn);

    // Badge for collapsed state
    this.expandBadge = document.createElement('span');
    this.expandBadge.className = 'toolbar-expand-badge hidden';
    this.expandBadge.textContent = '0';
    pill.appendChild(this.expandBadge);

    this.el.appendChild(pill);

    // Update toggle icon on transition end
    this.el.addEventListener('transitionend', () => {
      const icon = this.toggleBtn.querySelector('.toolbar-icon')!;
      icon.innerHTML = this.collapsed ? penIcon : xIcon;
    });
  }

  private createBtn(content: string | HTMLElement, tooltip: string, onClick: (() => void) | null): HTMLElement {
    const btn = document.createElement('button');
    btn.className = 'toolbar-btn';

    const iconWrap = document.createElement('span');
    iconWrap.className = 'toolbar-icon';
    if (typeof content === 'string') {
      iconWrap.innerHTML = content;
    } else {
      iconWrap.appendChild(content);
    }
    btn.appendChild(iconWrap);

    if (tooltip) {
      const tip = document.createElement('span');
      tip.className = 'toolbar-tooltip';
      tip.textContent = tooltip;
      btn.appendChild(tip);
    }

    if (onClick) {
      btn.addEventListener('click', onClick);
    }

    return btn;
  }

  private toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.el.setAttribute('data-collapsed', String(this.collapsed));
    this.updateBadgeVisibility();
    if (this.collapsed) {
      this.onCollapse?.();
    } else {
      this.onExpand?.();
    }
  }

  setInspectActive(active: boolean): void {
    this.inspectActive = active;
    this.inspectBtn.classList.toggle('active', active);
  }

  setSettingsOpen(open: boolean): void {
    this.settingsOpen = open;
    this.el.classList.toggle('tooltips-hidden', open);
  }

  updateCount(count: number): void {
    this.countBadge.textContent = String(count);
    this.expandBadge.textContent = String(count);
    this.updateBadgeVisibility(count);

    const empty = count === 0;
    this.copyBtn.classList.toggle('disabled', empty);
    this.clearBtn.classList.toggle('disabled', empty);
  }

  private updateBadgeVisibility(count?: number): void {
    const c = count ?? parseInt(this.expandBadge.textContent || '0', 10);
    this.expandBadge.classList.toggle('hidden', c === 0 || !this.collapsed);
  }
}
