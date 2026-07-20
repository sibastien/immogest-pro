const express = require('express');
const db = require('../db');
const { protect, requireRole } = require('../middleware/auth');
const { propertyToJSON } = require('../mappers');

const router = express.Router();
router.use(protect);

function rowFromBody(b) {
  return {
    ref: b.ref || null,
    title: String(b.title || '').trim(),
    deal_type: b.transaction || 'vente',
    type: b.type || 'villa',
    status: b.status || 'disponible',
    price: b.price ?? 0,
    price_type: b.priceType || 'vente',
    surface: b.surface ?? 0,
    rooms: b.rooms ?? null,
    bathrooms: b.bathrooms ?? null,
    location: b.location || '',
    address: b.address || '',
    agent_id: b.agentId || '',
    photos: JSON.stringify(b.photos || []),
    description: b.description || null,
    features: JSON.stringify(b.features || []),
    floor: b.floor ?? null,
    total_floors: b.totalFloors ?? null,
    parking: b.parking == null ? null : (b.parking ? 1 : 0),
    furnished: b.furnished == null ? null : (b.furnished ? 1 : 0),
    published: b.published ? 1 : 0,
  };
}

const COLS = `ref, title, deal_type, type, status, price, price_type, surface, rooms, bathrooms,
  location, address, agent_id, photos, description, features, floor, total_floors, parking, furnished, published`;

// GET /api/properties — shared catalogue, visible to every authenticated user.
router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM properties ORDER BY created_at DESC').all();
  res.json(rows.map(propertyToJSON));
});

router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Bien introuvable.' });
  res.json(propertyToJSON(row));
});

// POST /api/properties — any authenticated user may add a bien.
router.post('/', (req, res) => {
  if (!req.body.title?.trim()) return res.status(400).json({ error: 'Le titre est obligatoire.' });
  const id = req.body.id || `prop-${Date.now()}`;
  const data = rowFromBody(req.body);

  db.prepare(`
    INSERT INTO properties (id, ${COLS}, created_at)
    VALUES (@id, @ref, @title, @deal_type, @type, @status, @price, @price_type, @surface, @rooms, @bathrooms,
      @location, @address, @agent_id, @photos, @description, @features, @floor, @total_floors,
      @parking, @furnished, @published, @created_at)
  `).run({ id, ...data, created_at: req.body.createdAt || new Date().toISOString().split('T')[0] });

  res.status(201).json(propertyToJSON(db.prepare('SELECT * FROM properties WHERE id = ?').get(id)));
});

// PUT /api/properties/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Bien introuvable.' });
  const data = rowFromBody({ ...propertyToJSON(existing), ...req.body });

  db.prepare(`
    UPDATE properties SET ref=@ref, title=@title, deal_type=@deal_type, type=@type, status=@status, price=@price,
      price_type=@price_type, surface=@surface, rooms=@rooms, bathrooms=@bathrooms, location=@location,
      address=@address, agent_id=@agent_id, photos=@photos, description=@description, features=@features,
      floor=@floor, total_floors=@total_floors, parking=@parking, furnished=@furnished, published=@published
    WHERE id=@id
  `).run({ id: req.params.id, ...data });

  res.json(propertyToJSON(db.prepare('SELECT * FROM properties WHERE id = ?').get(req.params.id)));
});

// DELETE /api/properties/:id — admin and agent bureau (catalogue management).
router.delete('/:id', requireRole('admin', 'agent_bureau'), (req, res) => {
  db.prepare('DELETE FROM properties WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
