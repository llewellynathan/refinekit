import { Refiner } from './refiner';
import type { Annotation, RefinerOptions } from './types';

export { Refiner };
export type { Annotation, RefinerOptions };

// Auto-initialize when loaded via script tag
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const init = () => {
    // Skip if already initialized (e.g. bookmarklet + script tag both present)
    if ((window as any).__refiner) return;

    // Read config from script tag data attributes
    const script = document.currentScript as HTMLScriptElement | null;
    const position = (script?.dataset.refinerPosition as 'left' | 'right') ?? 'right';
    const enabled = script?.dataset.refinerEnabled !== 'false';
    const mcpPort = script?.dataset.refinerMcpPort ? parseInt(script.dataset.refinerMcpPort, 10) : undefined;
    const mcpEnabled = script?.dataset.refinerMcpEnabled !== 'false';

    const refiner = new Refiner({ position, enabled, mcpPort, mcpEnabled });
    (window as any).__refiner = refiner;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
