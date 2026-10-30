const express = require('express');
const db = require('../db');
const { propertyToJSON } = require('../mappers');

const router = express.Router();

// GET /api/public/properties — no auth, returns published properties only.
// Supports optional ?tenant=<tenantId> query param; if omitted, uses 'default'.
router.get('/properties', (req, res) => {
  const tenantId = req.query.tenant || 'default';
  const rows = db
    .prepare(
      `SELECT * FROM properties
       WHERE tenant_id = ? AND published = 1 AND status = 'disponible'
       ORDER BY created_at DESC`
    )
    .all(tenantId);
  res.json(rows.map(propertyToJSON));
});

// GET /api/public/properties/:id — single published property
router.get('/properties/:id', (req, res) => {
  const tenantId = req.query.tenant || 'default';
  const row = db
    .prepare(
      `SELECT * FROM properties
       WHERE id = ? AND tenant_id = ? AND published = 1`
    )
    .get(req.params.id, tenantId);
  if (!row) return res.status(404).json({ error: 'Bien introuvable.' });
  res.json(propertyToJSON(row));
});

// POST /api/public/inquiry — submit a contact / viewing request from the public site.
// Creates a lead in the clients table automatically.
router.post('/inquiry', (req, res) => {
  const tenantId = req.query.tenant || 'default';
  const { name, phone, email, message, propertyId, propertyRef } = req.body;

  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Nom et téléphone obligatoires.' });
  }

  const id = `client-web-${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  // Insert as a new client lead (source = 'web')
  db.prepare(
    `INSERT OR IGNORE INTO clients
       (id, tenant_id, name, phone, email, type, status, source, notes, agent_id, last_contact, created_at)
     VALUES
       (@id, @tenant_id, @name, @phone, @email, 'acheteur', 'actif', 'web', @notes, '', @now, @now)`
  ).run({
    id,
    tenant_id: tenantId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    notes: message
      ? `Demande site web${propertyRef ? ` — Réf: ${propertyRef}` : ''}:\n${message}`
      : `Demande site web${propertyRef ? ` — Réf: ${propertyRef}` : ''}`,
    now,
  });

  res.status(201).json({ ok: true, clientId: id });
});

module.exports = router;
