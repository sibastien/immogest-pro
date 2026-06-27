const express = require('express');
const db = require('../db');
const { protect } = require('../middleware/auth');
const { callToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function canSeeAll(user) {
  return user.role === 'admin' || user.role === 'coordinatrice';
}

// GET /api/calls — admin/coordinatrice: all (oversight). Agents: own only.
// Optional ?agentId= filter for the admin oversight page.
router.get('/', (req, res) => {
  let rows;
  if (canSeeAll(req.user)) {
    if (req.query.agentId) {
      rows = db.prepare('SELECT * FROM calls WHERE agent_id = ? ORDER BY date DESC, time DESC').all(req.query.agentId);
    } else {
      rows = db.prepare('SELECT * FROM calls ORDER BY date DESC, time DESC').all();
    }
  } else {
    rows = db.prepare('SELECT * FROM calls WHERE agent_id = ? ORDER BY date DESC, time DESC').all(req.user.id);
  }
  res.json(rows.map(callToJSON));
});

// POST /api/calls
router.post('/', (req, res) => {
  const b = req.body;
  if (!b.clientName?.trim()) return res.status(400).json({ error: 'Nom du client requis.' });
  if (!b.notes?.trim()) return res.status(400).json({ error: 'Le contenu de l\'appel est requis.' });

  const id = b.id || `call-${Date.now()}`;
  const agentId = canSeeAll(req.user) ? (b.agentId || req.user.id) : req.user.id;
  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO calls (id, agent_id, client_id, client_name, phone, type, outcome, notes, date, time, created_at)
    VALUES (@id, @agent_id, @client_id, @client_name, @phone, @type, @outcome, @notes, @date, @time, @created_at)
  `).run({
    id,
    agent_id: agentId,
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

  // Touch the client's last contact date if the call is tied to a fiche.
  if (b.clientId) {
    db.prepare('UPDATE clients SET last_contact = ? WHERE id = ?').run(b.date || today, b.clientId);
  }

  res.status(201).json(callToJSON(db.prepare('SELECT * FROM calls WHERE id = ?').get(id)));
});

module.exports = router;
