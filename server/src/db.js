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

  CREATE TABLE IF NOT EXISTS properties (
    id           TEXT PRIMARY KEY,
    ref          TEXT,
    title        TEXT NOT NULL,
    type         TEXT NOT NULL DEFAULT 'vente_residentielle',
    status       TEXT NOT NULL DEFAULT 'disponible',
    price        INTEGER NOT NULL DEFAULT 0,
    price_type   TEXT NOT NULL DEFAULT 'vente',
    surface      INTEGER NOT NULL DEFAULT 0,
    rooms        INTEGER,
    bathrooms    INTEGER,
    location     TEXT DEFAULT '',
    address      TEXT DEFAULT '',
    agent_id     TEXT DEFAULT '',
    photos       TEXT,
    description  TEXT,
    features     TEXT,
    floor        INTEGER,
    total_floors INTEGER,
    parking      INTEGER,
    furnished    INTEGER,
    created_at   TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id          TEXT PRIMARY KEY,
    ref         TEXT,
    property_id TEXT,
    client_id   TEXT,
    agent_id    TEXT,
    type        TEXT NOT NULL DEFAULT 'vente_residentielle',
    amount      INTEGER NOT NULL DEFAULT 0,
    commission  INTEGER NOT NULL DEFAULT 0,
    stage       TEXT NOT NULL DEFAULT 'prospection',
    notes       TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS documents (
    id          TEXT PRIMARY KEY,
    type        TEXT NOT NULL DEFAULT 'autre',
    title       TEXT NOT NULL,
    property_id TEXT,
    client_id   TEXT,
    status      TEXT NOT NULL DEFAULT 'brouillon',
    url         TEXT,
    size        TEXT,
    created_at  TEXT NOT NULL,
    expires_at  TEXT,
    signed_at   TEXT
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
