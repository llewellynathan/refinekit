import { Annotation, CATEGORIES } from './types';
import { AnnotationStore } from './annotation-store';

interface MarkerElement {
  el: HTMLElement;
  annotation: Annotation;
}

export class AnnotationMarkers {
  private markers: Map<string, MarkerElement> = new Map();
  private container: HTMLElement;
  private rafId: number | null = null;

  constructor(private root: ShadowRoot, private store: AnnotationStore) {
    this.container = document.createElement('div');
    this.container.className = 'refiner-markers';
    root.appendChild(this.container);

    // Listen to store events
    store.on('add', (annotation) => this.addMarker(annotation));
    store.on('resolve', (annotation) => this.updateMarker(annotation));
    store.on('remove', (annotation) => this.removeMarker(annotation.id));

    // Reposition on scroll/resize
    const reposition = () => this.repositionAll();
    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
  }

  private addMarker(annotation: Annotation): void {
    const cat = CATEGORIES.find((c) => c.id === annotation.category);
    const color = cat?.color ?? '#94A3B8';

    const el = document.createElement('div');
    el.className = 'refiner-marker';
    el.setAttribute('data-annotation-marker', annotation.id);
    el.setAttribute('data-resolved', String(annotation.resolved));
    el.style.background = color;

    // Number
    const index = this.markers.size + 1;
    el.textContent = String(index);

    // Tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'marker-tooltip';

    const tooltipText = document.createElement('div');
    tooltipText.textContent = annotation.text;
    tooltip.appendChild(tooltipText);

    const tooltipActions = document.createElement('div');
    tooltipActions.className = 'marker-tooltip-actions';

    const resolveBtn = document.createElement('button');
    resolveBtn.className = 'marker-tooltip-btn resolve';
    resolveBtn.textContent = 'Resolve';
    resolveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.resolve(annotation.id);
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'marker-tooltip-btn delete';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.store.remove(annotation.id);
    });

    tooltipActions.appendChild(resolveBtn);
    tooltipActions.appendChild(deleteBtn);
    tooltip.appendChild(tooltipActions);
    el.appendChild(tooltip);

    this.positionMarker(el, annotation);
    this.container.appendChild(el);
    this.markers.set(annotation.id, { el, annotation });
  }

  private updateMarker(annotation: Annotation): void {
    const marker = this.markers.get(annotation.id);
    if (marker) {
      marker.annotation = annotation;
      marker.el.setAttribute('data-resolved', String(annotation.resolved));
    }
  }

  private removeMarker(id: string): void {
    const marker = this.markers.get(id);
    if (marker) {
      marker.el.remove();
      this.markers.delete(id);
      this.renumber();
    }
  }

  private renumber(): void {
    let i = 1;
    for (const [, marker] of this.markers) {
      // Set text of marker (but not tooltip children)
      const firstText = marker.el.childNodes[0];
      if (firstText && firstText.nodeType === Node.TEXT_NODE) {
        firstText.textContent = String(i);
      }
      i++;
    }
  }

  private positionMarker(el: HTMLElement, annotation: Annotation): void {
    // Try to find the element by selector and use live position
    const target = this.queryTarget(annotation.targetSelector);
    if (target) {
      const rect = target.getBoundingClientRect();
      el.style.top = `${rect.top - 8}px`;
      el.style.left = `${rect.right - 8}px`;
    } else {
      // Fallback to stored rect
      el.style.top = `${annotation.targetRect.y - 8}px`;
      el.style.left = `${annotation.targetRect.x + annotation.targetRect.width - 8}px`;
    }
  }

  private queryTarget(selector: string): Element | null {
    try {
      return document.querySelector(selector);
    } catch {
      return null;
    }
  }

  private repositionAll(): void {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      for (const [, marker] of this.markers) {
        this.positionMarker(marker.el, marker.annotation);
      }
    });
  }
}
