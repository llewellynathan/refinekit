export interface Annotation {
  id: string;
  targetSelector: string;
  targetRect: { x: number; y: number; width: number; height: number };
  text: string;
  timestamp: number;
  resolved: boolean;
}

export interface RefineKitOptions {
  enabled?: boolean;
  position?: 'left' | 'right';
  mcpPort?: number;
  mcpEnabled?: boolean;
}
