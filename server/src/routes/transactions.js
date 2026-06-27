const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { transactionToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

// GET /api/transactions — shared, every authenticated user.
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM transactions ORDER BY updated_at DESC').all();
  res.json(rows.map(transactionToJSON));
});

// POST /api/transactions — open a new deal.
router.post('/', (req, res) => {
  const b = req.body;
  if (!b.propertyId) return res.status(400).json({ error: 'Bien requis.' });
  if (!b.clientId) return res.status(400).json({ error: 'Client requis.' });

  const id = b.id || `tx-${Date.now()}`;
  const now = new Date().toISOString();
  const ref = b.ref || `TX-${String(Date.now()).slice(-5)}`;

  db.prepare(`
    INSERT INTO transactions (id, ref, property_id, client_id, agent_id, type, amount, commission, stage, notes, created_at, updated_at)
    VALUES (@id, @ref, @property_id, @client_id, @agent_id, @type, @amount, @commission, @stage, @notes, @created_at, @updated_at)
  `).run({
    id,
    ref,
    property_id: b.propertyId,
    client_id: b.clientId,
    agent_id: b.agentId || req.user.id,
    type: b.type || 'vente_residentielle',
    amount: b.amount ?? 0,
    commission: b.commission ?? 0,
    stage: b.stage || 'prospection',
    notes: b.notes || null,
    created_at: b.createdAt || now,
    updated_at: now,
  });

  res.status(201).json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(id)));
});

// PUT /api/transactions/:id — update stage / amount / commission / notes.
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Transaction introuvable.' });
  const b = req.body;
  db.prepare(`
    UPDATE transactions SET stage=@stage, amount=@amount, commission=@commission, notes=@notes, updated_at=@updated_at
    WHERE id=@id
  `).run({
    id: req.params.id,
    stage: b.stage ?? existing.stage,
    amount: b.amount ?? existing.amount,
    commission: b.commission ?? existing.commission,
    notes: b.notes ?? existing.notes,
    updated_at: new Date().toISOString(),
  });
  res.json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id)));
});

// POST /api/transactions/:id/close — mark as sold/rented. Side effects:
//   - transaction -> stage 'cloture'
//   - property    -> 'vendu' (sale) or 'loue' (rental)
//   - client      -> 'cloture'
router.post('/:id/close', (req, res) => {
  const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction introuvable.' });

  const now = new Date().toISOString();
  const isRental = tx.type === 'location_residentielle';
  const propertyStatus = isRental ? 'loue' : 'vendu';

  const close = db.transaction(() => {
    db.prepare("UPDATE transactions SET stage = 'cloture', updated_at = ? WHERE id = ?").run(now, tx.id);
    if (tx.property_id) db.prepare('UPDATE properties SET status = ? WHERE id = ?').run(propertyStatus, tx.property_id);
    if (tx.client_id) db.prepare("UPDATE clients SET status = 'cloture' WHERE id = ?").run(tx.client_id);
  });
  close();

  res.json(transactionToJSON(db.prepare('SELECT * FROM transactions WHERE id = ?').get(tx.id)));
});

module.exports = router;
