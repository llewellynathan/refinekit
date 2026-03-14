import { RefineKit } from './refinekit';
import type { Annotation, RefineKitOptions } from './types';

export { RefineKit };
export type { Annotation, RefineKitOptions };

// Auto-initialize when loaded via script tag
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const init = () => {
    // Skip if already initialized (e.g. bookmarklet + script tag both present)
    if ((window as any).__refinekit) return;

    // Read config from script tag data attributes
    const script = document.currentScript as HTMLScriptElement | null;
    const position = (script?.dataset.refinekitPosition as 'left' | 'right') ?? 'right';
    const enabled = script?.dataset.refinekitEnabled !== 'false';
    const mcpPort = script?.dataset.refinekitMcpPort ? parseInt(script.dataset.refinekitMcpPort, 10) : undefined;
    const mcpEnabled = script?.dataset.refinekitMcpEnabled !== 'false';

    const refinekit = new RefineKit({ position, enabled, mcpPort, mcpEnabled });
    (window as any).__refinekit = refinekit;
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}
