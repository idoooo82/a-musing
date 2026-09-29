import { audit } from './db.js';
import { PLATFORMS, buildPrompt, runProvider } from './agent.js';

export const STATUSES = ['draft', 'approved', 'exported', 'scheduled', 'published'];
// מעברים מותרים. פרסום דורש ראיה או רישום ידני מפורש.
const NEXT = {
  draft: ['approved'],
  approved: ['draft', 'exported'],
  exported: ['draft', 'scheduled', 'published'],
  scheduled: ['published', 'exported'],
  published: [],
};

export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

export function createProject(db, { name, isQa = false }) {
  if (!name?.trim()) throw new HttpError(400, 'חסר שם פרויקט');
  const r = db.prepare('INSERT INTO projects (name, is_qa) VALUES (?, ?)').run(name.trim(), isQa ? 1 : 0);
  audit(db, r.lastInsertRowid, 'project.create', name);
  return getProject(db, Number(r.lastInsertRowid));
}

export function getProject(db, id) {
  const p = db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  if (!p) throw new HttpError(404, 'פרויקט לא נמצא');
  return p;
}

export const listProjects = (db) => db.prepare('SELECT * FROM projects ORDER BY id').all();

// כל גישה לטיוטה עוברת בדיקת שיוך לפרויקט, כדי שלא יהיה ערבוב בין פרויקטים.
function loadDraft(db, projectId, draftId) {
  const d = db.prepare('SELECT * FROM social_drafts WHERE id = ? AND project_id = ?').get(draftId, projectId);
  if (!d) throw new HttpError(404, 'טיוטה לא נמצאה בפרויקט הזה');
  return d;
}

function hydrate(db, d) {
  const versions = db.prepare('SELECT * FROM draft_versions WHERE draft_id = ? ORDER BY version').all(d.id);
  const job = db.prepare('SELECT * FROM jobs WHERE draft_id = ? ORDER BY id DESC LIMIT 1').get(d.id);
  return { ...d, brief: JSON.parse(d.brief_json), versions, latest: versions.at(-1) ?? null, job: job ?? null };
}

export function listDrafts(db, projectId) {
  getProject(db, projectId);
  return db.prepare('SELECT * FROM social_drafts WHERE project_id = ? ORDER BY id DESC').all(projectId)
    .map((d) => hydrate(db, d));
}

export const getDraft = (db, projectId, draftId) => hydrate(db, loadDraft(db, projectId, draftId));

function addVersion(db, draftId, text, source, note) {
  const { v } = db.prepare('SELECT COALESCE(MAX(version), 0) AS v FROM draft_versions WHERE draft_id = ?').get(draftId);
  db.prepare('INSERT INTO draft_versions (draft_id, version, text, source, note) VALUES (?, ?, ?, ?, ?)')
    .run(draftId, v + 1, text, source, note ?? null);
  db.prepare("UPDATE social_drafts SET updated_at = datetime('now') WHERE id = ?").run(draftId);
}

export async function generateDraft(db, projectId, { platform, brief }, env = process.env, fetchImpl = fetch) {
  getProject(db, projectId);
  if (!PLATFORMS[platform]) throw new HttpError(400, 'פלטפורמה לא נתמכת');
  if (!brief || !(brief.scene || brief.product || brief.character || brief.quote || brief.note)) {
    throw new HttpError(400, 'צריך לפחות סצנה, מוצר, דמות, ציטוט או הערה');
  }
  const prompt = buildPrompt(platform, brief);
  const d = db.prepare('INSERT INTO social_drafts (project_id, platform, brief_json) VALUES (?, ?, ?)')
    .run(projectId, platform, JSON.stringify(brief));
  const draftId = Number(d.lastInsertRowid);
  const provider = env.ANTHROPIC_API_KEY ? 'anthropic' : 'manual';
  const j = db.prepare('INSERT INTO jobs (project_id, draft_id, provider, status, prompt) VALUES (?, ?, ?, ?, ?)')
    .run(projectId, draftId, provider, provider === 'manual' ? 'waiting_for_input' : 'running', prompt);
  const jobId = Number(j.lastInsertRowid);
  audit(db, projectId, 'draft.create', `draft=${draftId} job=${jobId} provider=${provider}`);

  if (provider === 'anthropic') {
    let out;
    try { out = await runProvider(prompt, env, fetchImpl); }
    catch (e) { out = { ok: false, error: `שגיאת רשת: ${e.message}` }; }
    if (out.ok) {
      addVersion(db, draftId, out.text, `ai:${out.model}`, null);
      db.prepare("UPDATE jobs SET status='succeeded', updated_at=datetime('now') WHERE id=?").run(jobId);
    } else {
      db.prepare("UPDATE jobs SET status='failed', error=?, updated_at=datetime('now') WHERE id=?").run(out.error, jobId);
    }
  }
  return getDraft(db, projectId, draftId);
}

// גרסה חדשה: הדבקה ידנית או תיקון של היוצר. לא דורסת גרסאות קודמות.
export function addDraftVersion(db, projectId, draftId, { text, note, source = 'creator' }) {
  const d = loadDraft(db, projectId, draftId);
  if (!text?.trim()) throw new HttpError(400, 'חסר טקסט');
  if (!['creator', 'manual_paste'].includes(source)) throw new HttpError(400, 'מקור לא חוקי');
  if (text.length > PLATFORMS[d.platform].maxChars) throw new HttpError(400, 'הטקסט ארוך מהמותר לפלטפורמה');
  addVersion(db, draftId, text.trim(), source, note);
  // שינוי תוכן מבטל אישור קודם: האישור היה על גרסה אחרת.
  if (d.status !== 'draft') db.prepare("UPDATE social_drafts SET status='draft' WHERE id=?").run(draftId);
  db.prepare("UPDATE jobs SET status='succeeded', updated_at=datetime('now') WHERE draft_id=? AND status='waiting_for_input'").run(draftId);
  audit(db, projectId, 'draft.version', `draft=${draftId} source=${source}`);
  return getDraft(db, projectId, draftId);
}

export function setStatus(db, projectId, draftId, { status, evidence }) {
  const d = loadDraft(db, projectId, draftId);
  if (!STATUSES.includes(status)) throw new HttpError(400, 'סטטוס לא חוקי');
  if (!NEXT[d.status].includes(status)) throw new HttpError(409, `אי אפשר לעבור מ-${d.status} ל-${status}`);
  const hasText = db.prepare('SELECT 1 FROM draft_versions WHERE draft_id = ?').get(draftId);
  if (status !== 'draft' && !hasText) throw new HttpError(409, 'אין עדיין נוסח בטיוטה');
  if (status === 'published' && !evidence?.trim()) {
    throw new HttpError(400, 'כדי לסמן "פורסם" נדרש קישור לפוסט או רישום ידני מפורש');
  }
  db.prepare("UPDATE social_drafts SET status=?, publish_evidence=COALESCE(?, publish_evidence), updated_at=datetime('now') WHERE id=?")
    .run(status, status === 'published' ? evidence.trim() : null, draftId);
  audit(db, projectId, 'draft.status', `draft=${draftId} ${d.status}->${status}`);
  return getDraft(db, projectId, draftId);
}

// חבילת פרסום ידנית. רק טיוטה שאושרה, ורק הגרסה האחרונה.
export function exportDraft(db, projectId, draftId) {
  let d = loadDraft(db, projectId, draftId);
  if (d.status === 'draft') throw new HttpError(409, 'אפשר לייצא רק טיוטה שאושרה');
  if (d.status === 'approved') d = setStatusRaw(db, projectId, d, 'exported');
  const full = hydrate(db, d);
  return {
    exportedAt: new Date().toISOString(),
    project: getProject(db, projectId).name,
    platform: full.platform,
    draftId: full.id,
    version: full.latest.version,
    text: full.latest.text,
    brief: full.brief,
    note: 'חבילה לפרסום ידני. הפוסט לא פורסם אוטומטית.',
  };
}

function setStatusRaw(db, projectId, d, status) {
  db.prepare("UPDATE social_drafts SET status=?, updated_at=datetime('now') WHERE id=?").run(status, d.id);
  audit(db, projectId, 'draft.status', `draft=${d.id} ${d.status}->${status}`);
  return { ...d, status };
}
