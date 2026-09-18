const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { dayBlockToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function isSupervisor(user) {
  return user.role === 'admin' || user.role === 'coordinatrice';
}

// GET /api/day-blocks?date=YYYY-MM-DD&agentId=...
// Agents always get their own day. Supervisors can pass any agentId.
router.get('/', (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0];
  const agentId = isSupervisor(req.user) && req.query.agentId ? req.query.agentId : req.user.id;
  const rows = db
    .prepare('SELECT * FROM day_blocks WHERE tenant_id = ? AND agent_id = ? AND date = ? ORDER BY start ASC')
    .all(req.tenantId, agentId, date);
  res.json(rows.map(dayBlockToJSON));
});

// POST /api/day-blocks — an agent fills in what they're doing in a time slot.
router.post('/', (req, res) => {
  const b = req.body;
  if (!b.date || !b.start || !b.end) return res.status(400).json({ error: 'Date et créneau requis.' });
  const id = b.id || `blk-${Date.now()}`;
  db.prepare(`
    INSERT INTO day_blocks (id, tenant_id, agent_id, date, start, end, label, color, created_at)
    VALUES (@id, @tenant_id, @agent_id, @date, @start, @end, @label, @color, @created_at)
  `).run({
    id,
    tenant_id: req.tenantId,
    agent_id: req.user.id, // always your own
    date: b.date,
    start: b.start,
    end: b.end,
    label: (b.label || '').trim(),
    color: b.color || 'blue',
    created_at: new Date().toISOString(),
  });
  res.status(201).json(dayBlockToJSON(db.prepare('SELECT * FROM day_blocks WHERE id = ? AND tenant_id = ?').get(id, req.tenantId)));
});

// PUT /api/day-blocks/:id — edit label/color/times (owner or admin).
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM day_blocks WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Créneau introuvable.' });
  if (existing.agent_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  const b = req.body;
  db.prepare('UPDATE day_blocks SET start=@start, end=@end, label=@label, color=@color WHERE id=@id AND tenant_id=@tenant_id').run({
    id: req.params.id,
    tenant_id: req.tenantId,
    start: b.start ?? existing.start,
    end: b.end ?? existing.end,
    label: b.label ?? existing.label,
    color: b.color ?? existing.color,
  });
  res.json(dayBlockToJSON(db.prepare('SELECT * FROM day_blocks WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId)));
});

// DELETE /api/day-blocks/:id — owner or admin.
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM day_blocks WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Introuvable.' });
  if (existing.agent_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Accès refusé.' });
  }
  db.prepare('DELETE FROM day_blocks WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ ok: true });
});

module.exports = router;
