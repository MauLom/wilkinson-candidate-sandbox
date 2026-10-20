import http from 'node:http';
import fs from 'node:fs';
import { createStore } from './store.js';
import { sendMessage, processWebhook } from './messages.js';
const store = createStore(process.env.DATA_FILE || './data/store.json');
const port = Number(process.env.PORT || 4317);
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html' }); return res.end(fs.readFileSync('public/index.html'));
    }
    if (req.method === 'GET' && url.pathname === '/api/prospects') return json(res, 200, store.read().prospects);
    const match = url.pathname.match(/^\/api\/prospects\/([^/]+)\/messages$/);
    if (req.method === 'GET' && match) return json(res, 200, store.read().messages.filter(m => m.prospectId === match[1]));
    if (req.method === 'GET' && url.pathname === '/api/activity') return json(res, 200, store.read().activity.filter(a => a.prospectId === url.searchParams.get('prospectId')));
    let body = '';
    for await (const chunk of req) { body += chunk; if (body.length > 10000) throw new Error('Request too large'); }
    const input = body ? JSON.parse(body) : {};
    if (req.method === 'POST' && match) return json(res, 201, sendMessage(store, match[1], input.body));
    if (req.method === 'POST' && url.pathname === '/api/webhooks/messages') return json(res, 200, processWebhook(store, input));
    return json(res, 404, { error: 'Not found' });
  } catch (error) { return json(res, 400, { error: error.message }); }
}).listen(port, '127.0.0.1', () => console.log(`Sandbox running at http://localhost:${port}`));
