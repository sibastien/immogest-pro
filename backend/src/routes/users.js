const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');
const { hashPassword, normalizeCode } = require('../auth');
const { userToAgent } = require('../mappers');

const router = express.Router();
router.use(protect);

// GET /api/users — team list scoped to tenant (no clients).
router.get('/', (req, res) => {
  const rows = db
    .prepare("SELECT * FROM users WHERE tenant_id = ? AND role != 'client' ORDER BY created_at DESC")
    .all(req.tenantId);
  const privileged = req.user.role === 'admin' || req.user.role === 'coordinatrice';
  res.json(rows.map((r) => {
    const agent = userToAgent(r);
    if (!privileged) delete agent.accessCode;
    return agent;
  }));
});

// POST /api/users — create an agent in this tenant (admin only).
router.post('/', requireRole('admin'), (req, res) => {
  const { name, email, role, phone, accessCode } = req.body;
  if (!name || !email || !role || !accessCode) {
    return res.status(400).json({ error: 'Nom, email, rôle et code d\'accès sont requis.' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();
  const exists = db.prepare('SELECT 1 FROM users WHERE lower(email) = ? AND tenant_id = ?').get(normalizedEmail, req.tenantId);
  if (exists) return res.status(409).json({ error: 'Un compte utilise déjà cet email.' });

  const id = req.body.id || `agent-${Date.now()}`;
  const code = normalizeCode(accessCode);
  const initials = String(name).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  db.prepare(`
    INSERT INTO users (id, tenant_id, name, initials, email, role, phone, status, access_code, password_hash, created_at)
    VALUES (@id, @tenant_id, @name, @initials, @email, @role, @phone, 'hors_ligne', @access_code, @password_hash, @created_at)
  `).run({
    id,
    tenant_id: req.tenantId,
    name: String(name).trim(),
    initials,
    email: normalizedEmail,
    role,
    phone: String(phone || '').trim(),
    access_code: code,
    password_hash: hashPassword(code),
    created_at: new Date().toISOString(),
  });

  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.status(201).json(userToAgent(row));
});

// DELETE /api/users/:id — remove an agent (admin only, same tenant).
router.delete('/:id', requireRole('admin'), (req, res) => {
  const row = db.prepare('SELECT * FROM users WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!row) return res.status(404).json({ error: 'Introuvable.' });
  if (row.role === 'admin') return res.status(400).json({ error: 'Impossible de supprimer un administrateur.' });
  db.prepare('DELETE FROM users WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ ok: true });
});

module.exports = router;
