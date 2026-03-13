import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import type { Annotation, Session, CreateSessionRequest, CreateAnnotationRequest } from './types.js';

export class Store {
  private db: Database.Database;
  private listeners: Set<(event: string, data: unknown) => void> = new Set();

  constructor(dbPath?: string) {
    const resolvedPath = dbPath ?? path.join(os.homedir(), '.refiner', 'store.db');

    if (resolvedPath !== ':memory:') {
      fs.mkdirSync(path.dirname(resolvedPath), { recursive: true });
    }

    this.db = new Database(resolvedPath);
    this.db.pragma('journal_mode = WAL');
    this.migrate();
  }

  private migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        title TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        target_selector TEXT NOT NULL,
        target_rect_x REAL NOT NULL,
        target_rect_y REAL NOT NULL,
        target_rect_width REAL NOT NULL,
        target_rect_height REAL NOT NULL,
        text TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        resolved INTEGER NOT NULL DEFAULT 0,
        resolved_summary TEXT,
        dismissed_reason TEXT
      );
    `);
  }

  createSession(req: CreateSessionRequest): Session {
    const session: Session = {
      id: crypto.randomUUID(),
      url: req.url,
      title: req.title,
      createdAt: Date.now(),
    };

    this.db.prepare(
      'INSERT INTO sessions (id, url, title, created_at) VALUES (?, ?, ?, ?)'
    ).run(session.id, session.url, session.title, session.createdAt);

    return session;
  }

  listSessions(): Session[] {
    return this.db.prepare('SELECT id, url, title, created_at as createdAt FROM sessions ORDER BY created_at DESC').all() as Session[];
  }

  getSession(id: string): Session | undefined {
    return this.db.prepare('SELECT id, url, title, created_at as createdAt FROM sessions WHERE id = ?').get(id) as Session | undefined;
  }

  addAnnotation(sessionId: string, req: CreateAnnotationRequest): Annotation {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      sessionId,
      targetSelector: req.targetSelector,
      targetRect: req.targetRect,
      text: req.text,
      timestamp: Date.now(),
      resolved: false,
    };

    this.db.prepare(`
      INSERT INTO annotations (id, session_id, target_selector, target_rect_x, target_rect_y, target_rect_width, target_rect_height, text, timestamp, resolved)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(
      annotation.id, sessionId, annotation.targetSelector,
      annotation.targetRect.x, annotation.targetRect.y,
      annotation.targetRect.width, annotation.targetRect.height,
      annotation.text, annotation.timestamp
    );

    this.emit('annotation:added', annotation);
    return annotation;
  }

  getAnnotation(id: string): Annotation | undefined {
    const row = this.db.prepare(`
      SELECT id, session_id as sessionId, target_selector as targetSelector,
        target_rect_x, target_rect_y, target_rect_width, target_rect_height,
        text, timestamp, resolved, resolved_summary as resolvedSummary, dismissed_reason as dismissedReason
      FROM annotations WHERE id = ?
    `).get(id) as Record<string, unknown> | undefined;

    return row ? this.rowToAnnotation(row) : undefined;
  }

  getSessionAnnotations(sessionId: string): Annotation[] {
    const rows = this.db.prepare(`
      SELECT id, session_id as sessionId, target_selector as targetSelector,
        target_rect_x, target_rect_y, target_rect_width, target_rect_height,
        text, timestamp, resolved, resolved_summary as resolvedSummary, dismissed_reason as dismissedReason
      FROM annotations WHERE session_id = ? ORDER BY timestamp ASC
    `).all(sessionId) as Record<string, unknown>[];

    return rows.map((r) => this.rowToAnnotation(r));
  }

  getPending(): Annotation[] {
    const rows = this.db.prepare(`
      SELECT id, session_id as sessionId, target_selector as targetSelector,
        target_rect_x, target_rect_y, target_rect_width, target_rect_height,
        text, timestamp, resolved, resolved_summary as resolvedSummary, dismissed_reason as dismissedReason
      FROM annotations WHERE resolved = 0 AND dismissed_reason IS NULL ORDER BY timestamp ASC
    `).all() as Record<string, unknown>[];

    return rows.map((r) => this.rowToAnnotation(r));
  }

  resolve(id: string, summary: string): Annotation | undefined {
    this.db.prepare('UPDATE annotations SET resolved = 1, resolved_summary = ? WHERE id = ?').run(summary, id);
    const annotation = this.getAnnotation(id);
    if (annotation) this.emit('annotation:resolved', annotation);
    return annotation;
  }

  dismiss(id: string, reason: string): Annotation | undefined {
    this.db.prepare('UPDATE annotations SET dismissed_reason = ? WHERE id = ?').run(reason, id);
    const annotation = this.getAnnotation(id);
    if (annotation) this.emit('annotation:dismissed', annotation);
    return annotation;
  }

  private rowToAnnotation(row: Record<string, unknown>): Annotation {
    return {
      id: row.id as string,
      sessionId: row.sessionId as string,
      targetSelector: row.targetSelector as string,
      targetRect: {
        x: row.target_rect_x as number,
        y: row.target_rect_y as number,
        width: row.target_rect_width as number,
        height: row.target_rect_height as number,
      },
      text: row.text as string,
      timestamp: row.timestamp as number,
      resolved: Boolean(row.resolved),
      resolvedSummary: row.resolvedSummary as string | undefined,
      dismissedReason: row.dismissedReason as string | undefined,
    };
  }

  onEvent(listener: (event: string, data: unknown) => void): void {
    this.listeners.add(listener);
  }

  offEvent(listener: (event: string, data: unknown) => void): void {
    this.listeners.delete(listener);
  }

  private emit(event: string, data: unknown): void {
    for (const listener of this.listeners) {
      listener(event, data);
    }
  }

  close(): void {
    this.db.close();
  }
}
