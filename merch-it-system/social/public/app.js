const $ = (id) => document.getElementById(id);
const STATUS_HE = { draft: 'טיוטה', approved: 'אושרה', exported: 'יוצאה', scheduled: 'תוזמנה', published: 'פורסמה' };
let projectId = null;

async function api(path, opts = {}) {
  const res = await fetch(path, {
    method: opts.method || 'GET',
    headers: opts.body ? { 'content-type': 'application/json' } : undefined,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `שגיאה ${res.status}`);
  return data;
}

function say(text, isErr) { $('msg').textContent = text; $('msg').className = isErr ? 'err' : ''; }

async function init() {
  const [agent, projects] = await Promise.all([api('/api/agent/status'), api('/api/projects')]);
  const st = $('agent-state');
  st.textContent = agent.connected ? `ספק AI מחובר (${agent.model})` : 'ספק AI לא מחובר — עבודה ידנית';
  st.className = 'pill ' + (agent.connected ? 'ok' : 'warn');
  $('project').innerHTML = '';
  for (const p of projects) $('project').add(new Option(p.name + (p.is_qa ? ' (בדיקות)' : ''), p.id));
  projectId = projects[0]?.id;
  $('project').onchange = () => { projectId = Number($('project').value); load(); };
  await load();
}

async function load() {
  if (!projectId) return;
  render(await api(`/api/projects/${projectId}/drafts`));
}

$('generate').onclick = async () => {
  const brief = Object.fromEntries(['scene', 'product', 'character', 'quote', 'note', 'quoteStatus'].map((k) => [k, $(k).value.trim()]));
  $('generate').disabled = true;
  try {
    const d = await api(`/api/projects/${projectId}/drafts`, { method: 'POST', body: { platform: 'linkedin', brief } });
    say(d.job?.status === 'failed' ? `הריצה נכשלה: ${d.job.error}` : d.job?.status === 'waiting_for_input' ? 'נוצרה עבודה שממתינה לנוסח. ראה למטה.' : 'הטיוטה נוצרה.', d.job?.status === 'failed');
    await load();
  } catch (e) { say(e.message, true); }
  $('generate').disabled = false;
};

function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
}

function render(drafts) {
  const root = $('drafts');
  root.replaceChildren();
  if (!drafts.length) root.append(el('p', { textContent: 'עדיין אין טיוטות בפרויקט הזה.' }));
  for (const d of drafts) {
    const card = el('div', { className: 'card' });
    card.append(el('div', { className: 'row' },
      el('strong', { textContent: `טיוטה ${d.id}` }),
      el('span', { className: 'pill', textContent: STATUS_HE[d.status] }),
      d.latest ? el('span', { className: 'pill', textContent: `גרסה ${d.latest.version}` }) : ''));
    const editor = el('textarea', { rows: 7, value: d.latest?.text || '', placeholder: d.job?.status === 'waiting_for_input' ? 'הדבק כאן את הנוסח שקיבלת' : '' });
    if (d.job?.status === 'waiting_for_input') {
      card.append(el('p', { textContent: 'ספק ה-AI לא מחובר. העתק את הפרומפט, הרץ אותו בכלי שלך והדבק את התוצאה:' }),
        el('pre', { textContent: d.job.prompt }));
    }
    if (d.job?.status === 'failed') card.append(el('p', { className: 'err', textContent: `הריצה נכשלה: ${d.job.error}` }));
    card.append(editor);
    const act = (label, fn, cls = '') => el('button', { textContent: label, className: cls, onclick: async () => { try { await fn(); await load(); } catch (e) { say(e.message, true); } } });
    const row = el('div', { className: 'row' });
    row.append(act('שמור כגרסה חדשה', () => api(`/api/projects/${projectId}/drafts/${d.id}/versions`, { method: 'POST', body: { text: editor.value, source: d.latest ? 'creator' : 'manual_paste' } })));
    if (d.status === 'draft' && d.latest) row.append(act('אשר', () => api(`/api/projects/${projectId}/drafts/${d.id}/status`, { method: 'POST', body: { status: 'approved' } })));
    if (d.status === 'approved' || d.status === 'exported') row.append(act('ייצא חבילה', async () => {
      const pkg = await api(`/api/projects/${projectId}/drafts/${d.id}/export`);
      const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' })), download: `social-draft-${d.id}.json` });
      a.click();
    }, 'ghost'));
    if (d.status === 'exported') row.append(act('פרסמתי ידנית', () => {
      const evidence = prompt('קישור לפוסט או הערה שמאשרת שפרסמת:');
      if (!evidence) return;
      return api(`/api/projects/${projectId}/drafts/${d.id}/status`, { method: 'POST', body: { status: 'published', evidence } });
    }, 'ghost'));
    card.append(row);
    if (d.versions.length > 1) {
      const v = el('details', { className: 'versions' }, el('summary', { textContent: 'גרסאות קודמות' }));
      for (const x of d.versions.slice(0, -1).reverse()) v.append(el('pre', { textContent: `גרסה ${x.version} (${x.source})\n${x.text}` }));
      card.append(v);
    }
    root.append(card);
  }
}

init().catch((e) => say(e.message, true));
