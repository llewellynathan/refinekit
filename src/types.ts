export type AnnotationCategory =
  | 'spacing'
  | 'typography'
  | 'contrast'
  | 'alignment'
  | 'color'
  | 'layout'
  | 'general';

export interface CategoryConfig {
  id: AnnotationCategory;
  label: string;
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  { id: 'spacing', label: 'Spacing', color: '#FF6B6B' },
  { id: 'typography', label: 'Typography', color: '#4ECDC4' },
  { id: 'contrast', label: 'Contrast', color: '#FFB347' },
  { id: 'alignment', label: 'Alignment', color: '#A78BFA' },
  { id: 'color', label: 'Color', color: '#F472B6' },
  { id: 'layout', label: 'Layout', color: '#34D399' },
  { id: 'general', label: 'General', color: '#94A3B8' },
];

export interface Annotation {
  id: string;
  targetSelector: string;
  targetRect: { x: number; y: number; width: number; height: number };
  category: AnnotationCategory;
  text: string;
  timestamp: number;
  resolved: boolean;
}

export interface RefinerOptions {
  enabled?: boolean;
  position?: 'left' | 'right';
}

export interface RefinerEvents {
  'annotation:add': Annotation;
  'annotation:resolve': string;
  'annotation:remove': string;
  'annotations:export': Annotation[];
}
