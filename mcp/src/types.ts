export interface Annotation {
  id: string;
  sessionId: string;
  targetSelector: string;
  targetRect: { x: number; y: number; width: number; height: number };
  text: string;
  timestamp: number;
  resolved: boolean;
  resolvedSummary?: string;
  dismissedReason?: string;
}

export interface Session {
  id: string;
  url: string;
  title: string;
  createdAt: number;
}

export interface CreateSessionRequest {
  url: string;
  title: string;
}

export interface CreateAnnotationRequest {
  targetSelector: string;
  targetRect: { x: number; y: number; width: number; height: number };
  text: string;
}
