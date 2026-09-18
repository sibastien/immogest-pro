const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { visitToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function canSeeAll(user) {
  return user.role === 'admin' || user.role === 'coordinatrice';
}

// GET /api/visits — scoped to tenant; agents only see their own.
router.get('/', (req, res) => {
  const rows = canSeeAll(req.user)
    ? db.prepare('SELECT * FROM visits WHERE tenant_id = ? ORDER BY date DESC, time ASC').all(req.tenantId)
    : db.prepare('SELECT * FROM visits WHERE tenant_id = ? AND agent_id = ? ORDER BY date DESC, time ASC').all(req.tenantId, req.user.id);
  res.json(rows.map(visitToJSON));
});

router.post('/', (req, res) => {
  const b = req.body;
  if (!b.clientId) return res.status(400).json({ error: 'Client requis.' });
  if (!b.propertyId) return res.status(400).json({ error: 'Bien requis.' });
  if (!b.date || !b.time) return res.status(400).json({ error: 'Date et heure requises.' });

  const id = b.id || `visit-${Date.now()}`;
  const agentId = canSeeAll(req.user) ? (b.agentId || req.user.id) : req.user.id;

  db.prepare(`
    INSERT INTO visits (id, tenant_id, property_id, client_id, agent_id, date, time, status, cr_submitted, notes, created_at)
    VALUES (@id, @tenant_id, @property_id, @client_id, @agent_id, @date, @time, @status, 0, @notes, @created_at)
  `).run({
    id,
    tenant_id: req.tenantId,
    property_id: b.propertyId,
    client_id: b.clientId,
    agent_id: agentId,
    date: b.date,
    time: b.time,
    status: b.status || 'planifie',
    notes: b.notes || null,
    created_at: new Date().toISOString(),
  });

  res.status(201).json(visitToJSON(db.prepare('SELECT * FROM visits WHERE id = ?').get(id)));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM visits WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Visite introuvable.' });
  const b = req.body;
  db.prepare(`
    UPDATE visits SET status = @status, cr_submitted = @cr_submitted, notes = @notes WHERE id = @id AND tenant_id = @tenant_id
  `).run({
    id: req.params.id,
    tenant_id: req.tenantId,
    status: b.status ?? existing.status,
    cr_submitted: b.crSubmitted != null ? (b.crSubmitted ? 1 : 0) : existing.cr_submitted,
    notes: b.notes ?? existing.notes,
  });
  res.json(visitToJSON(db.prepare('SELECT * FROM visits WHERE id = ?').get(req.params.id)));
});

module.exports = router;
