import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  is_qa INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS social_drafts (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  platform TEXT NOT NULL,
  brief_json TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  publish_evidence TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS draft_versions (
  id INTEGER PRIMARY KEY,
  draft_id INTEGER NOT NULL REFERENCES social_drafts(id),
  version INTEGER NOT NULL,
  text TEXT NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (draft_id, version)
);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  draft_id INTEGER NOT NULL REFERENCES social_drafts(id),
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  prompt TEXT NOT NULL,
  error TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY,
  project_id INTEGER,
  action TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`;

export function openDb(path = process.env.SOCIAL_DB || 'data/social.sqlite') {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(SCHEMA);
  return db;
}

export function audit(db, projectId, action, detail) {
  db.prepare('INSERT INTO audit_log (project_id, action, detail) VALUES (?, ?, ?)')
    .run(projectId ?? null, action, detail ?? null);
}
