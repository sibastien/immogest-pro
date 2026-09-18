const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { crToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function canSeeAll(user) {
  return user.role === 'admin' || user.role === 'coordinatrice';
}

// GET /api/comptes-rendus — admin/coordinatrice: all in tenant. Agents: own in tenant.
router.get('/', (req, res) => {
  const rows = canSeeAll(req.user)
    ? db.prepare('SELECT * FROM comptes_rendus WHERE tenant_id = ? ORDER BY created_at DESC').all(req.tenantId)
    : db.prepare('SELECT * FROM comptes_rendus WHERE tenant_id = ? AND agent_id = ? ORDER BY created_at DESC').all(req.tenantId, req.user.id);
  res.json(rows.map(crToJSON));
});

// POST /api/comptes-rendus — agent submits a report+feedback for a visit.
router.post('/', (req, res) => {
  const b = req.body;
  if (!b.visitId) return res.status(400).json({ error: 'Visite requise.' });

  const id = b.id || `cr-${Date.now()}`;
  const agentId = canSeeAll(req.user) ? (b.agentId || req.user.id) : req.user.id;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO comptes_rendus (id, tenant_id, visit_id, agent_id, client_interest, result, notes,
      follow_up, photos, submitted_at, validated_at, status, created_at)
    VALUES (@id, @tenant_id, @visit_id, @agent_id, @client_interest, @result, @notes,
      @follow_up, @photos, @submitted_at, NULL, @status, @created_at)
    ON CONFLICT(id) DO UPDATE SET client_interest=@client_interest, result=@result,
      notes=@notes, follow_up=@follow_up, photos=@photos, submitted_at=@submitted_at, status=@status
  `).run({
    id,
    tenant_id: req.tenantId,
    visit_id: b.visitId,
    agent_id: agentId,
    client_interest: b.clientInterest ?? 3,
    result: b.result || 'a_revoir',
    notes: b.notes || '',
    follow_up: JSON.stringify(b.followUp || []),
    photos: JSON.stringify(b.photos || []),
    submitted_at: b.submittedAt || now,
    status: b.status || 'soumis',
    created_at: now,
  });

  // Mark the visit as done + CR submitted within the same tenant.
  db.prepare("UPDATE visits SET cr_submitted = 1, status = 'effectue' WHERE id = ? AND tenant_id = ?").run(b.visitId, req.tenantId);

  res.status(201).json(crToJSON(db.prepare('SELECT * FROM comptes_rendus WHERE id = ? AND tenant_id = ?').get(id, req.tenantId)));
});

// PUT /api/comptes-rendus/:id — coordinatrice/admin validate or request correction.
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM comptes_rendus WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Compte-rendu introuvable.' });
  const b = req.body;
  const validatedAt = b.status === 'valide' ? new Date().toISOString() : existing.validated_at;
  db.prepare(`
    UPDATE comptes_rendus SET status = @status, notes = @notes, validated_at = @validated_at WHERE id = @id AND tenant_id = @tenant_id
  `).run({
    id: req.params.id,
    tenant_id: req.tenantId,
    status: b.status ?? existing.status,
    notes: b.notes ?? existing.notes,
    validated_at: validatedAt,
  });
  res.json(crToJSON(db.prepare('SELECT * FROM comptes_rendus WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId)));
});

module.exports = router;
