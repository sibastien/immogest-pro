const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
require('dotenv').config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'immogest.db');

// Ensure the parent directory exists (e.g. ./data).
fs.mkdirSync(path.dirname(path.resolve(DB_PATH)), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema — idempotent. Safe to run on every boot.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    initials      TEXT NOT NULL DEFAULT '',
    email         TEXT NOT NULL UNIQUE,
    role          TEXT NOT NULL,
    phone         TEXT DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'hors_ligne',
    access_code   TEXT,
    password_hash TEXT,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS clients (
    id                   TEXT PRIMARY KEY,
    name                 TEXT NOT NULL,
    phone                TEXT NOT NULL DEFAULT '',
    email                TEXT,
    type                 TEXT NOT NULL DEFAULT 'acheteur',
    budget_min           INTEGER,
    budget_max           INTEGER,
    search               TEXT,
    agent_id             TEXT NOT NULL DEFAULT '',
    status               TEXT NOT NULL DEFAULT 'actif',
    last_contact         TEXT NOT NULL DEFAULT '',
    source               TEXT NOT NULL DEFAULT 'appel',
    notes                TEXT,
    property_preferences TEXT,
    created_at           TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS calls (
    id          TEXT PRIMARY KEY,
    agent_id    TEXT NOT NULL,
    client_id   TEXT,
    client_name TEXT NOT NULL,
    phone       TEXT,
    type        TEXT NOT NULL DEFAULT 'sortant',
    outcome     TEXT NOT NULL DEFAULT 'joint',
    notes       TEXT NOT NULL DEFAULT '',
    date        TEXT NOT NULL,
    time        TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS visits (
    id           TEXT PRIMARY KEY,
    property_id  TEXT NOT NULL DEFAULT '',
    client_id    TEXT NOT NULL DEFAULT '',
    agent_id     TEXT NOT NULL,
    date         TEXT NOT NULL,
    time         TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'planifie',
    cr_submitted INTEGER NOT NULL DEFAULT 0,
    notes        TEXT,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS comptes_rendus (
    id              TEXT PRIMARY KEY,
    visit_id        TEXT NOT NULL,
    agent_id        TEXT NOT NULL,
    client_interest INTEGER NOT NULL DEFAULT 3,
    result          TEXT NOT NULL DEFAULT 'a_revoir',
    notes           TEXT NOT NULL DEFAULT '',
    follow_up       TEXT,
    photos          TEXT,
    submitted_at    TEXT,
    validated_at    TEXT,
    status          TEXT NOT NULL DEFAULT 'soumis',
    created_at      TEXT NOT NULL
  );
`);

module.exports = db;
