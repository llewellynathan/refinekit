import { generateSelector } from './selector';

interface PropertyRow {
  label: string;
  value: string;
  color?: string; // if set, show a color swatch
}

interface PropertySection {
  title: string;
  rows: PropertyRow[];
}

export class InspectPanel {
  readonly el: HTMLElement;
  private content: HTMLElement;
  private lastTarget: Element | null = null;
  private visible = false;

  constructor(private root: ShadowRoot) {
    this.el = document.createElement('div');
    this.el.className = 'inspect-panel hidden';

    this.content = document.createElement('div');
    this.el.appendChild(this.content);

    root.appendChild(this.el);
  }

  show(target: Element, rect: DOMRect): void {
    if (target === this.lastTarget) {
      this.position(rect);
      return;
    }
    this.lastTarget = target;

    const style = window.getComputedStyle(target);
    const sections = this.extractProperties(target, style);
    this.renderContent(target, sections);
    this.position(rect);

    this.el.classList.remove('hidden');
    this.visible = true;
  }

  hide(): void {
    this.el.classList.add('hidden');
    this.visible = false;
    this.lastTarget = null;
  }

  isVisible(): boolean {
    return this.visible;
  }

  private extractProperties(target: Element, style: CSSStyleDeclaration): PropertySection[] {
    const sections: PropertySection[] = [];

    // Typography
    const typoRows: PropertyRow[] = [
      { label: 'font-family', value: this.formatFontFamily(style.fontFamily) },
      { label: 'font-size', value: style.fontSize },
      { label: 'font-weight', value: style.fontWeight },
      { label: 'line-height', value: style.lineHeight },
      { label: 'letter-spacing', value: style.letterSpacing },
      { label: 'color', value: style.color, color: style.color },
    ];
    sections.push({ title: 'Typography', rows: typoRows });

    // Spacing
    const spacingRows: PropertyRow[] = [];
    this.addSpacingRows(spacingRows, 'padding', style);
    this.addSpacingRows(spacingRows, 'margin', style);
    sections.push({ title: 'Spacing', rows: spacingRows });

    // Background
    const bgRows: PropertyRow[] = [];
    if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgRows.push({ label: 'background', value: style.backgroundColor, color: style.backgroundColor });
    }
    if (bgRows.length > 0) {
      sections.push({ title: 'Background', rows: bgRows });
    }

    // Border
    const borderRows: PropertyRow[] = [];
    this.addBorderRows(borderRows, style);
    if (style.borderRadius && style.borderRadius !== '0px') {
      borderRows.push({ label: 'border-radius', value: style.borderRadius });
    }
    if (borderRows.length > 0) {
      sections.push({ title: 'Border', rows: borderRows });
    }

    // Layout
    const layoutRows: PropertyRow[] = [
      { label: 'width', value: `${Math.round(target.getBoundingClientRect().width)}px` },
      { label: 'height', value: `${Math.round(target.getBoundingClientRect().height)}px` },
      { label: 'display', value: style.display },
      { label: 'position', value: style.position },
    ];
    sections.push({ title: 'Layout', rows: layoutRows });

    return sections;
  }

  private addSpacingRows(rows: PropertyRow[], prop: 'padding' | 'margin', style: CSSStyleDeclaration): void {
    const top = style.getPropertyValue(`${prop}-top`);
    const right = style.getPropertyValue(`${prop}-right`);
    const bottom = style.getPropertyValue(`${prop}-bottom`);
    const left = style.getPropertyValue(`${prop}-left`);

    if (top === right && right === bottom && bottom === left) {
      if (top !== '0px') {
        rows.push({ label: prop, value: top });
      }
    } else if (top === bottom && left === right) {
      rows.push({ label: prop, value: `${top} ${right}` });
    } else {
      rows.push({ label: prop, value: `${top} ${right} ${bottom} ${left}` });
    }
  }

  private addBorderRows(rows: PropertyRow[], style: CSSStyleDeclaration): void {
    const tw = style.borderTopWidth;
    const ts = style.borderTopStyle;
    const tc = style.borderTopColor;

    if (ts === 'none' || tw === '0px') return;

    const rw = style.borderRightWidth;
    const rs = style.borderRightStyle;
    const rc = style.borderRightColor;
    const bw = style.borderBottomWidth;
    const bs = style.borderBottomStyle;
    const bc = style.borderBottomColor;
    const lw = style.borderLeftWidth;
    const ls = style.borderLeftStyle;
    const lc = style.borderLeftColor;

    if (tw === rw && rw === bw && bw === lw &&
        ts === rs && rs === bs && bs === ls &&
        tc === rc && rc === bc && bc === lc) {
      rows.push({ label: 'border', value: `${tw} ${ts} ${tc}`, color: tc });
    } else {
      rows.push({ label: 'border-top', value: `${tw} ${ts} ${tc}`, color: tc });
      rows.push({ label: 'border-right', value: `${rw} ${rs} ${rc}`, color: rc });
      rows.push({ label: 'border-bottom', value: `${bw} ${bs} ${bc}`, color: bc });
      rows.push({ label: 'border-left', value: `${lw} ${ls} ${lc}`, color: lc });
    }
  }

  private formatFontFamily(value: string): string {
    const fonts = value.split(',').map(f => f.trim().replace(/^["']|["']$/g, ''));
    if (fonts.length <= 2) return fonts.join(', ');
    return `${fonts[0]}, +${fonts.length - 1}`;
  }

  private renderContent(target: Element, sections: PropertySection[]): void {
    this.content.innerHTML = '';

    // Element header
    const tag = document.createElement('div');
    tag.className = 'inspect-element-tag';
    tag.textContent = `<${target.tagName.toLowerCase()}>`;
    this.content.appendChild(tag);

    const sel = document.createElement('div');
    sel.className = 'inspect-element-selector';
    sel.textContent = generateSelector(target);
    this.content.appendChild(sel);

    // Sections
    for (const section of sections) {
      const title = document.createElement('div');
      title.className = 'inspect-section-title';
      title.textContent = section.title;
      this.content.appendChild(title);

      for (const row of section.rows) {
        const rowEl = document.createElement('div');
        rowEl.className = 'inspect-row';

        const labelEl = document.createElement('span');
        labelEl.className = 'inspect-row-label';
        labelEl.textContent = row.label;

        const valueEl = document.createElement('span');
        valueEl.className = 'inspect-row-value';

        if (row.color) {
          const swatch = document.createElement('span');
          swatch.className = 'inspect-color-swatch';
          swatch.style.background = row.color;
          valueEl.appendChild(swatch);
        }

        valueEl.appendChild(document.createTextNode(row.value));

        rowEl.appendChild(labelEl);
        rowEl.appendChild(valueEl);

        rowEl.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(row.value);
          rowEl.classList.add('copied');
          setTimeout(() => rowEl.classList.remove('copied'), 600);
        });

        this.content.appendChild(rowEl);
      }
    }
  }

  private position(rect: DOMRect): void {
    const panelW = 280;
    const panelH = this.el.offsetHeight || 400;
    const gap = 12;
    const margin = 16;

    let left: number;
    let top: number;

    // Prefer right side of element
    if (rect.right + gap + panelW < window.innerWidth - margin) {
      left = rect.right + gap;
    } else if (rect.left - gap - panelW > margin) {
      // Fall back to left side
      left = rect.left - gap - panelW;
    } else {
      // Center horizontally as last resort
      left = Math.max(margin, (window.innerWidth - panelW) / 2);
    }

    // Align top with element, clamp to viewport
    top = rect.top;
    if (top + panelH > window.innerHeight - margin) {
      top = window.innerHeight - margin - panelH;
    }
    top = Math.max(margin, top);

    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }
}
