const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');
const { clientToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function rowFromBody(b) {
  return {
    name: String(b.name || '').trim(),
    phone: String(b.phone || '').trim(),
    email: b.email || null,
    type: b.type || 'acheteur',
    budget_min: b.budget?.min ?? null,
    budget_max: b.budget?.max ?? null,
    search: b.search || null,
    agent_id: b.agentId || '',
    status: b.status || 'actif',
    last_contact: b.lastContact || new Date().toISOString().split('T')[0],
    source: b.source || 'appel',
    notes: b.notes || null,
    property_preferences: JSON.stringify(b.propertyPreferences || {}),
  };
}

// GET /api/clients — scoped to tenant.
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM clients WHERE tenant_id = ? ORDER BY created_at DESC').all(req.tenantId);
  res.json(rows.map(clientToJSON));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM clients WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!row) return res.status(404).json({ error: 'Client introuvable.' });
  res.json(clientToJSON(row));
});

router.post('/', (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ error: 'Le nom est obligatoire.' });
  const id = req.body.id || `client-${Date.now()}`;
  const data = rowFromBody(req.body);
  if (req.user.role !== 'admin' && req.user.role !== 'coordinatrice') data.agent_id = req.user.id;

  db.prepare(`
    INSERT INTO clients (id, tenant_id, name, phone, email, type, budget_min, budget_max, search,
      agent_id, status, last_contact, source, notes, property_preferences, created_at)
    VALUES (@id, @tenant_id, @name, @phone, @email, @type, @budget_min, @budget_max, @search,
      @agent_id, @status, @last_contact, @source, @notes, @property_preferences, @created_at)
  `).run({ id, tenant_id: req.tenantId, ...data, created_at: new Date().toISOString().split('T')[0] });

  res.status(201).json(clientToJSON(db.prepare('SELECT * FROM clients WHERE id = ?').get(id)));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM clients WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Client introuvable.' });
  const data = rowFromBody({ ...clientToJSON(existing), ...req.body });

  db.prepare(`
    UPDATE clients SET name=@name, phone=@phone, email=@email, type=@type,
      budget_min=@budget_min, budget_max=@budget_max, search=@search, agent_id=@agent_id,
      status=@status, last_contact=@last_contact, source=@source, notes=@notes,
      property_preferences=@property_preferences
    WHERE id=@id AND tenant_id=@tenant_id
  `).run({ id: req.params.id, tenant_id: req.tenantId, ...data });

  res.json(clientToJSON(db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id)));
});

router.delete('/:id', requireRole('admin', 'coordinatrice'), (req, res) => {
  const existing = db.prepare('SELECT id FROM clients WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Client introuvable.' });
  db.prepare('DELETE FROM clients WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ ok: true });
});

module.exports = router;
