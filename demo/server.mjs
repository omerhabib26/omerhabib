import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Local educational service. In-memory storage and a fixed demo token are not production authentication.
export function createApp({ token = 'local-demo-token', onEvent = () => {} } = {}) {
  const claims = new Map();
  const keys = new Map();
  const emit = (name, requestId, code) => onEvent({ name, requestId, ...(code ? { code } : {}) });
  return createServer(async (req, res) => {
    const requestId = randomUUID();
    res.setHeader('X-Request-Id', requestId);
    const send = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    const fail = (status, code) => {
      emit('api_failure', requestId, code);
      send(status, { error: { code, requestId } });
    };
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (req.method === 'GET' && path === '/health') return send(200, { status: 'ok' });
      const assets = { '/': ['index.html', 'text/html'], '/app.mjs': ['app.mjs', 'text/javascript'], '/styles.css': ['styles.css', 'text/css'] };
      if (req.method === 'GET' && assets[path]) {
        const [name, type] = assets[path];
        res.writeHead(200, { 'Content-Type': type });
        return res.end(await readFile(new URL(`./public/${name}`, import.meta.url)));
      }
      if (req.headers.authorization !== `Bearer ${token}`) return fail(401, 'UNAUTHORIZED');
      if (path === '/claims' && req.method === 'GET') return send(200, { claims: [...claims.values()] });
      if (path !== '/claims' || req.method !== 'POST') return fail(404, 'NOT_FOUND');
      const key = req.headers['idempotency-key'];
      if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{8,128}$/.test(key)) return fail(400, 'INVALID_IDEMPOTENCY_KEY');
      let raw = '';
      for await (const chunk of req) {
        raw += chunk;
        if (Buffer.byteLength(raw) > 4096) return fail(413, 'PAYLOAD_TOO_LARGE');
      }
      let body;
      try { body = JSON.parse(raw); } catch { return fail(400, 'INVALID_JSON'); }
      if (!body || typeof body !== 'object' || Array.isArray(body) || !Number.isInteger(body.amountMinor) || body.amountMinor < 1 || body.amountMinor > 100000000 || !['EUR', 'USD', 'PKR'].includes(body.currency)) return fail(422, 'INVALID_CLAIM');
      const fingerprint = JSON.stringify({ amountMinor: body.amountMinor, currency: body.currency });
      if (keys.has(key)) {
        const previous = keys.get(key);
        if (previous.fingerprint !== fingerprint) return fail(409, 'IDEMPOTENCY_CONFLICT');
        emit('claim_replayed', requestId);
        return send(200, { claim: claims.get(previous.id), replayed: true });
      }
      // No await between key lookup and insertion: atomic within this single Node process.
      const claim = { id: randomUUID(), amountMinor: body.amountMinor, currency: body.currency, status: 'submitted' };
      claims.set(claim.id, claim);
      keys.set(key, { id: claim.id, fingerprint });
      emit('claim_submitted', requestId);
      return send(201, { claim, replayed: false });
    } catch {
      if (!res.headersSent) fail(500, 'INTERNAL_ERROR');
      else res.end();
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createApp({ onEvent: event => console.log(JSON.stringify(event)) }).listen(Number(process.env.PORT || 3000), '127.0.0.1', () => console.log('Demo: http://127.0.0.1:3000'));
}
