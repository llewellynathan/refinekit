import { Annotation } from './types';

type Listener = (annotation: Annotation) => void;

export class AnnotationStore {
  private annotations: Map<string, Annotation> = new Map();
  private listeners: Map<string, Set<Listener>> = new Map();

  add(targetSelector: string, targetRect: DOMRect, text: string): Annotation {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      targetSelector,
      targetRect: {
        x: targetRect.x,
        y: targetRect.y,
        width: targetRect.width,
        height: targetRect.height,
      },
      text,
      timestamp: Date.now(),
      resolved: false,
    };
    this.annotations.set(annotation.id, annotation);
    this.emit('add', annotation);
    return annotation;
  }

  resolve(id: string): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      annotation.resolved = true;
      this.emit('resolve', annotation);
    }
  }

  remove(id: string): void {
    const annotation = this.annotations.get(id);
    if (annotation) {
      this.annotations.delete(id);
      this.emit('remove', annotation);
    }
  }

  get(id: string): Annotation | undefined {
    return this.annotations.get(id);
  }

  getAll(): Annotation[] {
    return Array.from(this.annotations.values());
  }

  getPending(): Annotation[] {
    return this.getAll().filter((a) => !a.resolved);
  }

  getCount(): number {
    return this.annotations.size;
  }

  exportJSON(): string {
    return JSON.stringify(this.getAll(), null, 2);
  }

  on(event: string, listener: Listener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off(event: string, listener: Listener): void {
    this.listeners.get(event)?.delete(listener);
  }

  private emit(event: string, annotation: Annotation): void {
    this.listeners.get(event)?.forEach((fn) => fn(annotation));
  }
}
