import http from 'node:http';
import type { Store } from './store.js';
import type { CreateSessionRequest, CreateAnnotationRequest } from './types.js';

type SSEClient = http.ServerResponse;

export class HttpServer {
  private server: http.Server;
  private sseClients: Set<SSEClient> = new Set();

  constructor(private store: Store, private port: number = 4848) {
    this.server = http.createServer((req, res) => this.handleRequest(req, res));

    // Broadcast store events to SSE clients
    this.store.onEvent((event, data) => {
      this.broadcast(event, data);
    });
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.listen(this.port, () => {
        console.log(`Refiner HTTP server listening on http://localhost:${this.port}`);
        resolve();
      });
      this.server.on('error', reject);
    });
  }

  stop(): Promise<void> {
    // Close all SSE connections
    for (const client of this.sseClients) {
      client.end();
    }
    this.sseClients.clear();

    return new Promise((resolve) => {
      this.server.close(() => resolve());
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? '/', `http://localhost:${this.port}`);
    const segments = url.pathname.split('/').filter(Boolean);

    try {
      // GET /health
      if (req.method === 'GET' && url.pathname === '/health') {
        this.json(res, { status: 'ok', service: 'refinekit-mcp' });
        return;
      }

      // GET /events (SSE)
      if (req.method === 'GET' && url.pathname === '/events') {
        this.handleSSE(res);
        return;
      }

      // POST /sessions
      if (req.method === 'POST' && url.pathname === '/sessions') {
        const body = await this.readBody(req) as unknown as CreateSessionRequest;
        const session = this.store.createSession(body);
        this.json(res, session, 201);
        return;
      }

      // GET /sessions
      if (req.method === 'GET' && url.pathname === '/sessions') {
        this.json(res, this.store.listSessions());
        return;
      }

      // GET /sessions/:id
      if (req.method === 'GET' && segments[0] === 'sessions' && segments.length === 2) {
        const session = this.store.getSession(segments[1]);
        if (!session) { this.notFound(res); return; }
        const annotations = this.store.getSessionAnnotations(segments[1]);
        this.json(res, { ...session, annotations });
        return;
      }

      // POST /sessions/:id/annotations
      if (req.method === 'POST' && segments[0] === 'sessions' && segments[2] === 'annotations' && segments.length === 3) {
        const session = this.store.getSession(segments[1]);
        if (!session) { this.notFound(res); return; }
        const body = await this.readBody(req) as unknown as CreateAnnotationRequest;
        const annotation = this.store.addAnnotation(segments[1], body);
        this.json(res, annotation, 201);
        return;
      }

      // PATCH /annotations/:id
      if (req.method === 'PATCH' && segments[0] === 'annotations' && segments.length === 2) {
        const body = await this.readBody(req);
        let annotation;
        if (body.resolved && body.summary) {
          annotation = this.store.resolve(segments[1], body.summary as string);
        } else if (body.dismissed && body.reason) {
          annotation = this.store.dismiss(segments[1], body.reason as string);
        }
        if (!annotation) { this.notFound(res); return; }
        this.json(res, annotation);
        return;
      }

      // GET /pending
      if (req.method === 'GET' && url.pathname === '/pending') {
        this.json(res, this.store.getPending());
        return;
      }

      this.notFound(res);
    } catch (err) {
      console.error('Request error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private handleSSE(res: http.ServerResponse): void {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write('data: {"type":"connected"}\n\n');
    this.sseClients.add(res);

    res.on('close', () => {
      this.sseClients.delete(res);
    });
  }

  private broadcast(event: string, data: unknown): void {
    const payload = `data: ${JSON.stringify({ type: event, data })}\n\n`;
    for (const client of this.sseClients) {
      client.write(payload);
    }
  }

  private json(res: http.ServerResponse, data: unknown, status = 200): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  private notFound(res: http.ServerResponse): void {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString()));
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }
}
