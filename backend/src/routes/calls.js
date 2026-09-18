const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { callToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

// GET /api/calls — scoped to tenant; optional ?agentId= filter.
router.get('/', (req, res) => {
  const rows = req.query.agentId
    ? db.prepare('SELECT * FROM calls WHERE tenant_id = ? AND agent_id = ? ORDER BY date DESC, time DESC').all(req.tenantId, req.query.agentId)
    : db.prepare('SELECT * FROM calls WHERE tenant_id = ? ORDER BY date DESC, time DESC').all(req.tenantId);

  const names = {};
  for (const u of db.prepare('SELECT id, name FROM users WHERE tenant_id = ?').all(req.tenantId)) {
    names[u.id] = u.name;
  }

  res.json(rows.map((r) => ({ ...callToJSON(r), agentName: names[r.agent_id] || 'Agent' })));
});

router.post('/', (req, res) => {
  const b = req.body;
  if (!b.clientName?.trim()) return res.status(400).json({ error: 'Nom du client requis.' });
  if (!b.notes?.trim()) return res.status(400).json({ error: 'Le contenu de l\'appel est requis.' });

  const id = b.id || `call-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO calls (id, tenant_id, agent_id, client_id, client_name, phone, type, outcome, notes, date, time, created_at)
    VALUES (@id, @tenant_id, @agent_id, @client_id, @client_name, @phone, @type, @outcome, @notes, @date, @time, @created_at)
  `).run({
    id,
    tenant_id: req.tenantId,
    agent_id: req.user.id,
    client_id: b.clientId || null,
    client_name: String(b.clientName).trim(),
    phone: b.phone || null,
    type: b.type || 'sortant',
    outcome: b.outcome || 'joint',
    notes: String(b.notes).trim(),
    date: b.date || today,
    time: b.time || new Date().toTimeString().slice(0, 5),
    created_at: new Date().toISOString(),
  });

  if (b.clientId) {
    db.prepare('UPDATE clients SET last_contact = ? WHERE id = ? AND tenant_id = ?').run(b.date || today, b.clientId, req.tenantId);
  }

  res.status(201).json(callToJSON(db.prepare('SELECT * FROM calls WHERE id = ?').get(id)));
});

module.exports = router;
