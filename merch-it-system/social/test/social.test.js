import { test } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';
import * as svc from '../src/service.js';
import { buildPrompt, providerStatus } from '../src/agent.js';

const brief = { scene: 'הארוחה', quote: 'שבת שלום', quoteStatus: 'verified' };
const setup = () => {
  const db = openDb(':memory:');
  return { db, a: svc.createProject(db, { name: 'A', isQa: true }), b: svc.createProject(db, { name: 'B', isQa: true }) };
};
const noKey = {};

test('בלי ספק: עבודה ממתינה, בלי טקסט מומצא', async () => {
  const { db, a } = setup();
  const d = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, noKey);
  assert.equal(d.job.status, 'waiting_for_input');
  assert.equal(d.latest, null);
  assert.equal(providerStatus(noKey).connected, false);
});

test('הדבקה ידנית סוגרת את העבודה, ואישור/ייצוא עובדים', async () => {
  const { db, a } = setup();
  const d = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, noKey);
  assert.throws(() => svc.setStatus(db, a.id, d.id, { status: 'approved' }), /אין עדיין נוסח/);
  const v = svc.addDraftVersion(db, a.id, d.id, { text: 'לקחתי צעד אחורי.', source: 'manual_paste' });
  assert.equal(v.job.status, 'succeeded');
  assert.throws(() => svc.exportDraft(db, a.id, d.id), /אושרה/);
  svc.setStatus(db, a.id, d.id, { status: 'approved' });
  const pkg = svc.exportDraft(db, a.id, d.id);
  assert.equal(pkg.text, 'לקחתי צעד אחורי.');
  assert.equal(svc.getDraft(db, a.id, d.id).status, 'exported');
});

test('עריכה אחרי אישור מבטלת אישור ושומרת היסטוריה', async () => {
  const { db, a } = setup();
  const d = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, noKey);
  svc.addDraftVersion(db, a.id, d.id, { text: 'אחת', source: 'manual_paste' });
  svc.setStatus(db, a.id, d.id, { status: 'approved' });
  const after = svc.addDraftVersion(db, a.id, d.id, { text: 'שתיים' });
  assert.equal(after.status, 'draft');
  assert.deepEqual(after.versions.map((x) => x.text), ['אחת', 'שתיים']);
});

test('"פורסם" דורש ראיה', async () => {
  const { db, a } = setup();
  const d = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, noKey);
  svc.addDraftVersion(db, a.id, d.id, { text: 'טקסט', source: 'manual_paste' });
  svc.setStatus(db, a.id, d.id, { status: 'approved' });
  svc.exportDraft(db, a.id, d.id);
  assert.throws(() => svc.setStatus(db, a.id, d.id, { status: 'published' }), /נדרש/);
  assert.equal(svc.setStatus(db, a.id, d.id, { status: 'published', evidence: 'https://example.test/p/1' }).status, 'published');
});

test('אין ערבוב בין פרויקטים', async () => {
  const { db, a, b } = setup();
  const d = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, noKey);
  assert.throws(() => svc.getDraft(db, b.id, d.id), /לא נמצאה/);
  assert.throws(() => svc.setStatus(db, b.id, d.id, { status: 'approved' }), /לא נמצאה/);
  assert.equal(svc.listDrafts(db, b.id).length, 0);
});

test('ספק מחובר: הצלחה וכשל נרשמים כפי שהם', async () => {
  const { db, a } = setup();
  const env = { ANTHROPIC_API_KEY: 'test' };
  const ok = async () => ({ ok: true, json: async () => ({ content: [{ type: 'text', text: 'פוסט' }] }) });
  const d1 = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, env, ok);
  assert.equal(d1.job.status, 'succeeded');
  assert.equal(d1.latest.text, 'פוסט');
  const bad = async () => ({ ok: false, status: 500 });
  const d2 = await svc.generateDraft(db, a.id, { platform: 'linkedin', brief }, env, bad);
  assert.equal(d2.job.status, 'failed');
  assert.equal(d2.latest, null);
});

test('הפרומפט לא מוסיף ציטוט שלא ניתן, ומסמן את מצבו', () => {
  const p = buildPrompt('linkedin', { scene: 'ס', quote: 'שבת שלום', quoteStatus: 'machine' });
  assert.match(p, /"שבת שלום" \(תמלול מכונה/);
  assert.doesNotMatch(buildPrompt('linkedin', { scene: 'ס' }), /- ציטוט:/);
  assert.throws(() => buildPrompt('tiktok', {}), /לא נתמכת/);
});
