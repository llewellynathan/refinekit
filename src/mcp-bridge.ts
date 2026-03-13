import { AnnotationStore } from './annotation-store';
import { Annotation } from './types';

export class McpBridge {
  private baseUrl: string;
  private sessionId: string | null = null;
  private connected = false;
  private retryTimer: ReturnType<typeof setInterval> | null = null;

  onChange?: (connected: boolean) => void;

  constructor(
    private store: AnnotationStore,
    port: number = 4848,
  ) {
    this.baseUrl = `http://localhost:${port}`;
    this.discover();

    // Wire up store events
    this.store.on('add', (annotation) => this.postAnnotation(annotation));
    this.store.on('resolve', (annotation) => this.patchAnnotation(annotation));
  }

  private async discover(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      const data = await res.json();
      if (data && typeof data === 'object' && 'status' in data && data.status === 'ok') {
        this.connected = true;
        this.onChange?.(true);
        await this.createSession();
        this.stopRetry();
      }
    } catch {
      this.connected = false;
      this.onChange?.(false);
      this.startRetry();
    }
  }

  private startRetry(): void {
    if (this.retryTimer) return;
    this.retryTimer = setInterval(() => this.discover(), 5000);
  }

  private stopRetry(): void {
    if (this.retryTimer) {
      clearInterval(this.retryTimer);
      this.retryTimer = null;
    }
  }

  private async createSession(): Promise<void> {
    try {
      const res = await fetch(`${this.baseUrl}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          title: document.title || window.location.pathname,
        }),
      });
      const session = await res.json();
      this.sessionId = session.id;
    } catch {
      // Session creation failed — annotations won't sync but local still works
    }
  }

  private async postAnnotation(annotation: Annotation): Promise<void> {
    if (!this.connected || !this.sessionId) return;

    try {
      await fetch(`${this.baseUrl}/sessions/${this.sessionId}/annotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSelector: annotation.targetSelector,
          targetRect: annotation.targetRect,
          text: annotation.text,
        }),
      });
    } catch {
      // Silently fail — local annotation still exists
    }
  }

  private async patchAnnotation(annotation: Annotation): Promise<void> {
    if (!this.connected) return;

    try {
      await fetch(`${this.baseUrl}/annotations/${annotation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved: true,
          summary: 'Resolved from browser',
        }),
      });
    } catch {
      // Silently fail
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  destroy(): void {
    this.stopRetry();
  }
}
