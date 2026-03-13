const MARKER_COLORS = [
  { id: 'purple', color: '#7C3AED' },
  { id: 'blue', color: '#2563EB' },
  { id: 'green', color: '#059669' },
  { id: 'yellow', color: '#D97706' },
  { id: 'orange', color: '#EA580C' },
  { id: 'red', color: '#DC2626' },
  { id: 'pink', color: '#DB2777' },
];

export interface Settings {
  clearOnCopy: boolean;
  blockInteractions: boolean;
  markerColor: string;
}

export class SettingsPanel {
  readonly el: HTMLElement;
  private visible = false;
  private settings: Settings = {
    clearOnCopy: false,
    blockInteractions: true,
    markerColor: '#7C3AED',
  };

  onChange?: (settings: Settings) => void;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'settings-panel hidden';
    this.render();
    root.appendChild(this.el);
  }

  private render(): void {
    // Header
    const header = document.createElement('div');
    header.className = 'settings-header';
    const title = document.createElement('span');
    title.className = 'settings-title';
    title.textContent = 'reFiner';
    const version = document.createElement('span');
    version.className = 'settings-version';
    version.textContent = 'v0.1.0';
    header.appendChild(title);
    header.appendChild(version);
    this.el.appendChild(header);

    this.el.appendChild(this.createDivider());

    // Marker color
    const colorSection = document.createElement('div');
    colorSection.className = 'settings-section';
    const colorLabel = document.createElement('span');
    colorLabel.className = 'settings-label';
    colorLabel.textContent = 'Marker Colour';
    colorSection.appendChild(colorLabel);

    const colorRow = document.createElement('div');
    colorRow.className = 'settings-color-row';
    for (const mc of MARKER_COLORS) {
      const swatch = document.createElement('button');
      swatch.className = 'settings-swatch';
      swatch.style.background = mc.color;
      swatch.setAttribute('data-color', mc.color);
      if (mc.color === this.settings.markerColor) {
        swatch.classList.add('selected');
      }
      swatch.addEventListener('click', () => {
        colorRow.querySelectorAll('.settings-swatch').forEach((s) =>
          s.classList.remove('selected')
        );
        swatch.classList.add('selected');
        this.settings.markerColor = mc.color;
        this.emitChange();
      });
      colorRow.appendChild(swatch);
    }
    colorSection.appendChild(colorRow);
    this.el.appendChild(colorSection);

    this.el.appendChild(this.createDivider());

    // Clear on copy
    this.el.appendChild(this.createCheckbox(
      'Clear on copy',
      this.settings.clearOnCopy,
      (checked) => {
        this.settings.clearOnCopy = checked;
        this.emitChange();
      },
    ));

    // Block page interactions
    this.el.appendChild(this.createCheckbox(
      'Block page interactions',
      this.settings.blockInteractions,
      (checked) => {
        this.settings.blockInteractions = checked;
        this.emitChange();
      },
    ));
  }

  private createCheckbox(label: string, initial: boolean, onChange: (v: boolean) => void): HTMLElement {
    const row = document.createElement('label');
    row.className = 'settings-check-row';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'settings-checkbox';
    checkbox.checked = initial;
    checkbox.addEventListener('change', () => onChange(checkbox.checked));

    const text = document.createElement('span');
    text.className = 'settings-check-label';
    text.textContent = label;

    row.appendChild(checkbox);
    row.appendChild(text);
    return row;
  }

  private createDivider(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'settings-divider';
    return div;
  }

  private emitChange(): void {
    this.onChange?.({ ...this.settings });
  }

  toggle(): void {
    this.visible = !this.visible;
    this.el.classList.toggle('hidden', !this.visible);
  }

  hide(): void {
    this.visible = false;
    this.el.classList.add('hidden');
  }

  isVisible(): boolean {
    return this.visible;
  }

  getSettings(): Settings {
    return { ...this.settings };
  }
}
