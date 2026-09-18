const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');
const { transactionToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

// GET /api/transactions — scoped to tenant.
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions WHERE tenant_id = ? ORDER BY updated_at DESC').all(req.tenantId);
  res.json(rows.map(transactionToJSON));
});

router.post('/', (req, res) => {
  const b = req.body;
  if (!b.propertyId) return res.status(400).json({ error: 'Bien requis.' });
  if (!b.clientId) return res.status(400).json({ error: 'Client requis.' });

  const id = b.id || `tx-${Date.now()}`;
  const now = new Date().toISOString();
  const ref = b.ref || `TX-${String(Date.now()).slice(-5)}`;

  db.prepare(`
    INSERT INTO transactions (id, tenant_id, ref, property_id, client_id, agent_id, deal_type, type, amount, commission, stage, notes, created_at, updated_at)
    VALUES (@id, @tenant_id, @ref, @property_id, @client_id, @agent_id, @deal_type, @type, @amount, @commission, @stage, @notes, @created_at, @updated_at)
  `).run({
    id,
    tenant_id: req.tenantId,
    ref,
    property_id: b.propertyId,
    client_id: b.clientId,
    agent_id: b.agentId || req.user.id,
    deal_type: b.transaction || 'vente',
    type: b.type || 'villa',
    amount: b.amount ?? 0,
    commission: b.commission ?? 0,
    stage: b.stage || 'prospection',
    notes: b.notes || null,
    created_at: b.createdAt || now,
    updated_at: now,
  });

  res.status(201).json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)));
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Transaction introuvable.' });
  const b = req.body;
  db.prepare(`
    UPDATE transactions SET stage=@stage, amount=@amount, commission=@commission, notes=@notes, updated_at=@updated_at
    WHERE id=@id AND tenant_id=@tenant_id
  `).run({
    id: req.params.id,
    tenant_id: req.tenantId,
    stage: b.stage ?? existing.stage,
    amount: b.amount ?? existing.amount,
    commission: b.commission ?? existing.commission,
    notes: b.notes ?? existing.notes,
    updated_at: new Date().toISOString(),
  });
  res.json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id)));
});

router.post('/:id/close', (req, res) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!tx) return res.status(404).json({ error: 'Transaction introuvable.' });

  const now = new Date().toISOString();
  const isRental = tx.deal_type === 'location';
  const propertyStatus = isRental ? 'loue' : 'vendu';

  db.transaction(() => {
    db.prepare("UPDATE transactions SET stage = 'cloture', updated_at = ? WHERE id = ?").run(now, tx.id);
    if (tx.property_id) db.prepare('UPDATE properties SET status = ? WHERE id = ? AND tenant_id = ?').run(propertyStatus, tx.property_id, req.tenantId);
    if (tx.client_id) db.prepare("UPDATE clients SET status = 'cloture' WHERE id = ? AND tenant_id = ?").run(tx.client_id, req.tenantId);
  })();

  res.json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id)));
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const existing = db.prepare('SELECT id FROM transactions WHERE id = ? AND tenant_id = ?').get(req.params.id, req.tenantId);
  if (!existing) return res.status(404).json({ error: 'Transaction introuvable.' });
  db.prepare('DELETE FROM transactions WHERE id = ? AND tenant_id = ?').run(req.params.id, req.tenantId);
  res.json({ ok: true });
});

module.exports = router;
