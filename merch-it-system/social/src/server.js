import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, join, normalize } from 'node:path';
import { openDb } from './db.js';
import { providerStatus, PLATFORMS } from './agent.js';
import * as svc from './service.js';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

const json = (res, status, body) => {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 1_000_000) throw new svc.HttpError(413, 'הבקשה גדולה מדי');
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new svc.HttpError(400, 'JSON לא תקין'); }
}

export function createApp(db, env = process.env, fetchImpl = fetch) {
  return async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const path = url.pathname;
    try {
      if (path.startsWith('/api/')) {
        let m;
        if (req.method === 'GET' && path === '/api/agent/status') {
          return json(res, 200, { ...providerStatus(env), platforms: Object.fromEntries(Object.entries(PLATFORMS).map(([k, v]) => [k, v.label])) });
        }
        if (path === '/api/projects') {
          if (req.method === 'GET') return json(res, 200, svc.listProjects(db));
          if (req.method === 'POST') return json(res, 201, svc.createProject(db, await readBody(req)));
        }
        if ((m = path.match(/^\/api\/projects\/(\d+)\/drafts$/))) {
          const pid = Number(m[1]);
          if (req.method === 'GET') return json(res, 200, svc.listDrafts(db, pid));
          if (req.method === 'POST') return json(res, 201, await svc.generateDraft(db, pid, await readBody(req), env, fetchImpl));
        }
        if ((m = path.match(/^\/api\/projects\/(\d+)\/drafts\/(\d+)(?:\/(versions|status|export))?$/))) {
          const [pid, did] = [Number(m[1]), Number(m[2])];
          if (!m[3] && req.method === 'GET') return json(res, 200, svc.getDraft(db, pid, did));
          if (m[3] === 'versions' && req.method === 'POST') return json(res, 201, svc.addDraftVersion(db, pid, did, await readBody(req)));
          if (m[3] === 'status' && req.method === 'POST') return json(res, 200, svc.setStatus(db, pid, did, await readBody(req)));
          if (m[3] === 'export' && req.method === 'GET') return json(res, 200, svc.exportDraft(db, pid, did));
        }
        throw new svc.HttpError(404, 'נתיב לא קיים');
      }
      // קבצים סטטיים, עם חסימת יציאה מהתיקייה
      const rel = normalize(path === '/' ? 'index.html' : path.slice(1));
      if (rel.startsWith('..') || !TYPES[extname(rel)]) throw new svc.HttpError(404, 'לא נמצא');
      const data = await readFile(join(PUBLIC, rel)).catch(() => { throw new svc.HttpError(404, 'לא נמצא'); });
      res.writeHead(200, { 'content-type': TYPES[extname(rel)] });
      res.end(data);
    } catch (e) {
      if (e instanceof svc.HttpError) return json(res, e.status, { error: e.message });
      console.error(e);
      json(res, 500, { error: 'שגיאת שרת' });
    }
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb();
  if (!svc.listProjects(db).length) svc.createProject(db, { name: 'האנושות כפרה עליה' });
  const port = Number(process.env.PORT || 3000);
  createServer(createApp(db)).listen(port, () => console.log(`Merch It Social: http://localhost:${port}`));
}
