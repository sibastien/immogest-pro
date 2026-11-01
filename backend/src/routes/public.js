const express = require('express');
const db = require('../db');
const { propertyToJSON } = require('../mappers');

const router = express.Router();

const PUBLIC_PROP_SELECT = `
  SELECT p.*,
         t.name AS agency_name,
         t.slug AS agency_slug,
         COALESCE(NULLIF(t.phone, ''), u.phone, '') AS agency_phone,
         COALESCE(NULLIF(t.whatsapp, ''), NULLIF(t.phone, ''), u.phone, '') AS agency_whatsapp,
         COALESCE(NULLIF(t.owner_email, ''), u.email, '') AS agency_email,
         t.address AS agency_address,
         t.logo AS agency_logo,
         u.name AS agent_name,
         u.phone AS agent_phone
  FROM properties p
  LEFT JOIN tenants t ON p.tenant_id = t.id
  LEFT JOIN users u ON p.agent_id = u.id
`;

// GET /api/public/properties — no auth, returns published properties only.
// If ?tenant=<tenantId> is provided, filter by tenant. Otherwise return all published properties across agencies.
router.get('/properties', (req, res) => {
  const tenantId = req.query.tenant;
  let sql = `${PUBLIC_PROP_SELECT} WHERE p.published = 1 AND p.status = 'disponible'`;
  const params = [];

  if (tenantId) {
    sql += ` AND p.tenant_id = ?`;
    params.push(tenantId);
  }

  sql += ` ORDER BY p.created_at DESC`;

  const rows = db.prepare(sql).all(...params);
  res.json(rows.map(propertyToJSON));
});

// GET /api/public/properties/:id — single published property with agency contact info
router.get('/properties/:id', (req, res) => {
  const row = db
    .prepare(`${PUBLIC_PROP_SELECT} WHERE p.id = ? AND p.published = 1`)
    .get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Bien introuvable.' });
  res.json(propertyToJSON(row));
});

// POST /api/public/inquiry — submit a contact / viewing request from the public site.
// Automatically routes the lead to the agency that owns the property.
router.post('/inquiry', (req, res) => {
  const { name, phone, email, message, propertyId, propertyRef } = req.body;

  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Nom et téléphone obligatoires.' });
  }

  let tenantId = req.query.tenant || 'default';
  let agentId = '';

  if (propertyId) {
    const prop = db.prepare('SELECT tenant_id, agent_id FROM properties WHERE id = ?').get(propertyId);
    if (prop) {
      tenantId = prop.tenant_id || tenantId;
      agentId = prop.agent_id || '';
    }
  }

  const id = `client-web-${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  // Insert as a new client lead for the agency
  db.prepare(
    `INSERT OR IGNORE INTO clients
       (id, tenant_id, name, phone, email, type, status, source, notes, agent_id, last_contact, created_at)
     VALUES
       (@id, @tenant_id, @name, @phone, @email, 'acheteur', 'actif', 'web', @notes, @agent_id, @now, @now)`
  ).run({
    id,
    tenant_id: tenantId,
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || null,
    notes: message
      ? `Demande site web${propertyRef ? ` — Réf: ${propertyRef}` : ''}:\n${message}`
      : `Demande site web${propertyRef ? ` — Réf: ${propertyRef}` : ''}`,
    agent_id: agentId,
    now,
  });

  res.status(201).json({ ok: true, clientId: id });
});

module.exports = router;
